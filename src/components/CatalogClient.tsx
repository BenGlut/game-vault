"use client";

import { useEffect, useMemo, useState } from "react";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { useGameDrawer } from "@/components/GameDrawer";
import type { Game } from "@/lib/schema";
import type { GameRow } from "@/lib/data";
import { expandAbbreviations } from "@/lib/abbreviations";

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
  switch: "Switch",
  "switch-digital": "Switch digital",
  switch2: "Switch 2",
};

/** ids de plateforme, du plus long au plus court (préfixes imbriqués) */
const PLATFORM_IDS = Object.keys(PLATFORM_LABELS).sort((a, b) => b.length - a.length);

/** code court affiché sur la jaquette (« SWITCH-DIGITAL » déborderait) */
const PLATFORM_CODES: Record<string, string> = {
  gamecube: "NGC",
  switch: "SWITCH",
  "switch-digital": "SW DIGITAL",
  switch2: "SWITCH 2",
};

/**
 * Catalogue de référence No-Intro complet (tous les jeux sortis), pour la recherche.
 * Distinct de la collection : sert à retrouver un jeu / vérifier une possession.
 */
export default function CatalogClient({
  basePath,
  links,
  rows,
}: {
  basePath: string;
  links: Record<string, CatalogGameLink>;
  rows: Record<string, GameRow>;
}) {
  const [platform, setPlatform] = useState<string>(""); // "" = toutes les plateformes
  const [entries, setEntries] = useState<CatalogEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [possession, setPossession] = useState("");
  const [region, setRegion] = useState("");
  const [quality, setQuality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const drawer = useGameDrawer();

  /** ouvre le panneau : fiche complète de la base si connue, sinon fiche catalogue minimale */
  const openDrawer = (e: CatalogEntry, link?: CatalogGameLink) => {
    const platformId = platformOf(e);
    const row = link ? rows[link.id] : undefined;
    if (row) {
      // strictement le même panneau que dans la collection ; la jaquette du
      // catalogue sert de repli quand la collection n'en a pas.
      drawer.open({
        ...row,
        coverUrl:
          row.coverUrl ??
          (e.img
            ? `${basePath}/catalog-covers/${platformId}/${e.id.slice(platformId.length + 1)}.jpg`
            : null),
      });
      return;
    }
    drawer.open({
      game: {
        id: link?.id ?? e.id,
        canonicalTitle: e.t,
        normalizedTitle: e.n,
        aliases: [],
        franchise: null,
        platformId,
        region: (e.r[0] === "France" ? "PAL-FR" : "PAL-EU") as Game["region"],
        languages: [],
        publisher: null,
        developer: null,
        releaseYear: null,
        genres: [],
        edition: null,
        mediaType: platformId.endsWith("-digital") ? "digital" : "cartridge",
        externalIds: {},
        qualityTier: (link?.quality ?? e.q ?? null) as Game["qualityTier"],
        buyPriority: null,
      },
      platform: {
        id: platformId,
        name: PLATFORM_LABELS[platformId] ?? platformId,
        shortName: platformId.toUpperCase(),
        brand: "Nintendo",
        mediaTypes: ["cartridge"],
      } as never,
      coverUrl: e.img
        ? `${basePath}/catalog-covers/${platformId}/${e.id.slice(platformId.length + 1)}.jpg`
        : null,
      items: [],
      catalogOnly: !link,
    });
  };

  /**
   * Plateforme d'une entrée, déduite de son id (`gba-slug`, `switch-digital-slug`…).
   * Le préfixe le plus long gagne : `switch-digital` avant `switch`.
   */
  const platformOf = (e: CatalogEntry): string =>
    PLATFORM_IDS.find((id) => e.id.startsWith(`${id}-`)) ?? e.id.slice(0, e.id.indexOf("-"));
  // links est indexé par id d'entrée catalogue (matching 3 niveaux fait au build)
  const linkFor = (e: CatalogEntry): CatalogGameLink | undefined => links[e.id];

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
    if (platform) params.set("plateforme", platform);
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
    // « dqm 2 » doit trouver « Dragon Quest Monsters - Joker 2 »
    const q = expandAbbreviations(norm(query));
    const qWords = q.split(" ").filter(Boolean);
    return entries.filter((e) => {
      const isOwned = links[e.id]?.owned ?? false;
      if (possession === "owned" && !isOwned) return false;
      if (possession === "missing" && isOwned) return false;
      if (region && !e.r.includes(region)) return false;
      const tier = links[e.id]?.quality ?? e.q ?? null;
      if (quality && tier !== quality) return false;
      if (qWords.length && !qWords.every((w) => e.n.includes(w))) return false;
      return true;
    });
  }, [entries, query, possession, links, region, quality]);

  const shown = filtered.slice(0, 200);
  const select =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none";

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
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
        <select
          value={possession}
          onChange={(e) => setPossession(e.target.value)}
          className={select}
        >
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
            {shown.length < filtered.length
              ? ` — ${shown.length} affichés, affiner la recherche`
              : ""}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shown.map((e) => {
              const link = linkFor(e);
              const tier = link?.quality ?? e.q;
              const inner = (
                <>
                  <div className="poster">
                    {e.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${basePath}/catalog-covers/${platformOf(e)}/${e.id.slice(platformOf(e).length + 1)}.jpg`}
                        alt={`Jaquette de ${e.t}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-2 px-2 text-center text-xs text-muted">
                        {e.t}
                      </div>
                    )}
                    <div className="poster-veil" />

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold shadow-lg ${
                          tier
                            ? (TIER_COLORS[tier] ?? "")
                            : "bg-black/50 text-white/70 backdrop-blur-sm"
                        }`}
                        title={tier ? `Qualité ${tier}` : "Qualité non notée"}
                      >
                        {tier ?? "?"}
                      </span>
                      {link?.owned ? (
                        <span className="rounded-full bg-[#4ade8030] px-2 py-0.5 text-[10px] font-semibold text-[#4ade80] ring-1 ring-inset ring-[#4ade8050] backdrop-blur-sm">
                          Possédé
                        </span>
                      ) : link?.wishlist ? (
                        <span className="rounded-full bg-[#c084fc30] px-2 py-0.5 text-[10px] font-semibold text-[#c084fc] ring-1 ring-inset ring-[#c084fc50] backdrop-blur-sm">
                          Wishlist
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 p-2">
                      <span className="truncate text-[11px] text-white/70">
                        {e.r.join(", ") || "région inconnue"}
                      </span>
                      <span className="ml-auto shrink-0 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white/80 backdrop-blur-sm">
                        {PLATFORM_CODES[platformOf(e)] ?? platformOf(e)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 px-0.5">
                    <div
                      className="truncate text-sm font-medium transition group-hover:text-accent"
                      title={e.t}
                    >
                      {e.t}
                    </div>
                  </div>
                </>
              );
              // toujours le panneau latéral : on garde ses filtres et on enchaîne
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => openDrawer(e, link)}
                  className="group block w-full text-left"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-muted">
        Source : listes No-Intro (libretro-thumbnails). Le catalogue est une référence de recherche
        — l&apos;ajout à la collection passe toujours par la CLI.
      </p>
    </div>
  );
}
