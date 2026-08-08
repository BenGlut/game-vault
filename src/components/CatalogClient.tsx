"use client";

import { useEffect, useMemo, useState } from "react";

interface CatalogEntry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
}

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const PLATFORM_LABELS: Record<string, string> = {
  ds: "Nintendo DS",
  "3ds": "Nintendo 3DS",
  gba: "Game Boy Advance",
};

/**
 * Catalogue de référence No-Intro complet (tous les jeux sortis), pour la recherche.
 * Distinct de la collection : sert à retrouver un jeu / vérifier une possession.
 */
export default function CatalogClient({
  basePath,
  ownedKeys,
}: {
  basePath: string;
  ownedKeys: string[];
}) {
  const [platform, setPlatform] = useState<string>("ds");
  const [entries, setEntries] = useState<CatalogEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [possession, setPossession] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const owned = useMemo(() => new Set(ownedKeys), [ownedKeys]);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);
    fetch(`${basePath}/catalog/${platform}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CatalogEntry[]) => {
        if (!cancelled) setEntries(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [platform, basePath]);

  const regions = useMemo(() => {
    if (!entries) return [];
    const counts = new Map<string, number>();
    for (const e of entries) for (const r of e.r) counts.set(r, (counts.get(r) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = norm(query);
    const qWords = q.split(" ").filter(Boolean);
    return entries.filter((e) => {
      const isOwned = owned.has(`${platform}:${e.n}`);
      if (possession === "owned" && !isOwned) return false;
      if (possession === "missing" && isOwned) return false;
      if (region && !e.r.includes(region)) return false;
      if (qWords.length && !qWords.every((w) => e.n.includes(w))) return false;
      return true;
    });
  }, [entries, query, possession, owned, platform, region]);

  const shown = filtered.slice(0, 200);
  const select =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={select}>
          {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Chercher dans tous les jeux sortis…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${select} w-full md:w-80`}
        />
        <select value={possession} onChange={(e) => setPossession(e.target.value)} className={select}>
          <option value="">Tous</option>
          <option value="owned">Dans ma collection</option>
          <option value="missing">Pas dans ma collection</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={select}>
          <option value="">Toutes régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
          Catalogue indisponible ({error}).
        </div>
      ) : !entries ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
          Chargement du catalogue…
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            {filtered.length} jeu{filtered.length > 1 ? "x" : ""} sur {entries.length} référencés
            {shown.length < filtered.length ? ` — ${shown.length} affichés, affiner la recherche` : ""}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((e) => {
              const isOwned = owned.has(`${platform}:${e.n}`);
              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                    isOwned ? "border-[#4ade8040] bg-[#4ade800a]" : "border-border bg-surface"
                  }`}
                >
                  {e.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${basePath}/catalog-covers/${platform}/${e.id.slice(platform.length + 1)}.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-14 w-12 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-surface-2 text-xs text-muted">
                      ?
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium" title={e.t}>
                      {e.t}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                      {isOwned ? (
                        <span className="rounded-full bg-[#4ade8020] px-1.5 py-0.5 text-[#4ade80]">
                          Possédé
                        </span>
                      ) : null}
                      <span className="truncate">{e.r.join(", ") || "région inconnue"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-muted">
        Source : listes No-Intro (libretro-thumbnails). Le catalogue est une référence de
        recherche — l&apos;ajout à la collection passe toujours par la CLI.
      </p>
    </div>
  );
}
