"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";

export interface CatalogGameLink {
  id: string;
  owned: boolean;
  wishlist: boolean;
  quality: string | null;
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#f5b64225] text-[#f5b642]",
  A: "bg-[#4ade8020] text-[#4ade80]",
  B: "bg-[#60a5fa20] text-[#60a5fa]",
  C: "bg-[#8a93a820] text-[#8a93a8]",
  D: "bg-[#f8717120] text-[#f87171]",
};

interface CatalogEntry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
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
  gb: "Game Boy",
  gbc: "Game Boy Color",
  gba: "Game Boy Advance",
  ds: "Nintendo DS",
  "3ds": "Nintendo 3DS",
  n64: "Nintendo 64",
  gamecube: "GameCube",
};

/**
 * Catalogue de référence No-Intro complet (tous les jeux sortis), pour la recherche.
 * Distinct de la collection : sert à retrouver un jeu / vérifier une possession.
 */
export default function CatalogClient({
  basePath,
  links,
}: {
  basePath: string;
  links: Record<string, CatalogGameLink>;
}) {
  const [platform, setPlatform] = useState<string>(""); // "" = toutes les plateformes
  const [entries, setEntries] = useState<CatalogEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [possession, setPossession] = useState("");
  const [region, setRegion] = useState("");
  const [quality, setQuality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CatalogEntry | null>(null);

  /** plateforme d'une entrée, déduite de son id (`gba-slug`, `gamecube-slug`…). */
  const platformOf = (e: CatalogEntry): string => e.id.slice(0, e.id.indexOf("-"));
  const linkFor = (e: CatalogEntry): CatalogGameLink | undefined =>
    links[`${platformOf(e)}:${e.n}`];

  // filtres depuis l'URL au montage (retour arrière = sélections restaurées)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const read = (key: string, set: (v: string) => void) => {
      const v = params.get(key);
      if (v) set(v);
    };
    read("plateforme", setPlatform);
    read("q", setQuery);
    read("possession", setPossession);
    read("region", setRegion);
    read("qualite", setQuality);
  }, []);

  // reflète chaque sélection dans l'URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (platform !== "ds") params.set("plateforme", platform);
    if (query) params.set("q", query);
    if (possession) params.set("possession", possession);
    if (region) params.set("region", region);
    if (quality) params.set("qualite", quality);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [platform, query, possession, region, quality]);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);
    const ids = platform ? [platform] : Object.keys(PLATFORM_LABELS);
    Promise.all(
      ids.map((id) =>
        fetch(`${basePath}/catalog/${id}.json`).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} (${id})`);
          return r.json() as Promise<CatalogEntry[]>;
        }),
      ),
    )
      .then((lists) => {
        if (cancelled) return;
        const all = lists.flat();
        if (!platform) all.sort((a, b) => a.t.localeCompare(b.t, "fr"));
        setEntries(all);
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
      const isOwned = links[`${platform}:${e.n}`]?.owned ?? false;
      if (possession === "owned" && !isOwned) return false;
      if (possession === "missing" && isOwned) return false;
      if (region && !e.r.includes(region)) return false;
      const tier = links[`${platform}:${e.n}`]?.quality ?? e.q ?? null;
      if (quality && tier !== quality) return false;
      if (qWords.length && !qWords.every((w) => e.n.includes(w))) return false;
      return true;
    });
  }, [entries, query, possession, links, platform, region, quality]);

  const shown = filtered.slice(0, 200);
  const select =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <button
          type="button"
          onClick={() => setPlatform("")}
          aria-pressed={platform === ""}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 transition ${
            platform === ""
              ? "border-accent bg-accent-soft text-accent shadow-[0_0_20px_-8px_var(--accent)]"
              : "border-border bg-surface text-muted hover:border-accent/40 hover:text-text"
          }`}
        >
          <span className="text-2xl font-bold">∀</span>
          <span className="text-sm font-medium">Toutes</span>
        </button>
        {Object.entries(PLATFORM_LABELS).map(([id, label]) => {
          const Icon = CONSOLE_ICONS[id];
          const active = platform === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition ${
                active
                  ? "border-accent bg-accent-soft text-accent shadow-[0_0_20px_-8px_var(--accent)]"
                  : "border-border bg-surface text-muted hover:border-accent/40 hover:text-text"
              }`}
            >
              {Icon ? <Icon size={44} /> : null}
              <span className={`text-sm font-medium ${active ? "" : ""}`}>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
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
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className={select}>
          <option value="">Qualité (toutes)</option>
          <option value="S">S — incontournable</option>
          <option value="A">A — excellent</option>
          <option value="B">B — bon</option>
          <option value="C">C — moyen</option>
          <option value="D">D — faible</option>
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
              const link = linkFor(e);
              const inner = (
                <>
                  {e.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${basePath}/catalog-covers/${platformOf(e)}/${e.id.slice(platformOf(e).length + 1)}.jpg`}
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
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium" title={e.t}>
                        {e.t}
                      </span>
                      {(() => {
                        const tier = link?.quality ?? e.q;
                        return (
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                              tier ? (TIER_COLORS[tier] ?? "") : "bg-surface-2 text-muted"
                            }`}
                            title={tier ? `Qualité ${tier}` : "Qualité non notée"}
                          >
                            {tier ?? "?"}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                      {link?.owned ? (
                        <span className="rounded-full bg-[#4ade8020] px-1.5 py-0.5 text-[#4ade80]">
                          Possédé
                        </span>
                      ) : link?.wishlist ? (
                        <span className="rounded-full bg-[#c084fc20] px-1.5 py-0.5 text-[#c084fc]">
                          Wishlist
                        </span>
                      ) : null}
                      {!platform ? (
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono uppercase">
                          {platformOf(e)}
                        </span>
                      ) : null}
                      <span className="truncate">{e.r.join(", ") || "région inconnue"}</span>
                    </div>
                  </div>
                </>
              );
              const cardClass = `flex items-center gap-3 rounded-lg border px-3 py-2 ${
                link?.owned ? "border-[#4ade8040] bg-[#4ade800a]" : "border-border bg-surface"
              }`;
              // base (possédé/wishlist) → fiche complète ; sinon → carte détaillée
              return link ? (
                <Link
                  key={e.id}
                  href={`/jeu/${link.id}/`}
                  className={`${cardClass} transition hover:border-accent/40`}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setDetail(e)}
                  className={`${cardClass} w-full text-left transition hover:border-accent/40`}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-muted">
        Source : listes No-Intro (libretro-thumbnails). Le catalogue est une référence de
        recherche — l&apos;ajout à la collection passe toujours par la CLI.
      </p>

      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDetail(null)}
          onKeyDown={(e) => e.key === "Escape" && setDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              {detail.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${basePath}/catalog-covers/${platformOf(detail)}/${detail.id.slice(platformOf(detail).length + 1)}.jpg`}
                  alt={`Jaquette de ${detail.t}`}
                  className="w-28 shrink-0 rounded-lg border border-border shadow-lg"
                />
              ) : (
                <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">
                  pas de jaquette
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{detail.t}</h3>
                  {detail.q ? (
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-sm font-bold ${TIER_COLORS[detail.q] ?? ""}`}
                    >
                      {detail.q}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {PLATFORM_LABELS[platformOf(detail)] ?? platformOf(detail)}
                </div>
                <div className="mt-1 text-xs text-muted">
                  Régions : {detail.r.join(", ") || "inconnues"}
                </div>
                <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
                  Pas dans la collection ni la wishlist. Pour l&apos;ajouter, demander à
                  l&apos;agent (CLI <code className="font-mono">pnpm vault</code>).
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-4 w-full rounded-lg border border-border bg-surface-2 py-2 text-sm text-muted transition hover:text-text"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
