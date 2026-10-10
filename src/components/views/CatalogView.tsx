"use client";

import { useEffect, useMemo, useState } from "react";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault } from "@/components/vault/VaultProvider";
import { PageHeader, StatusBadge } from "@/components/ui/primitives";
import CoverImage from "@/components/game/CoverImage";
import { formatOf } from "@/lib/platform-format";
import CatalogEntryPanel from "./CatalogEntryPanel";
import { inputClass } from "@/components/ui/fields";
import { expandAbbreviations } from "@/lib/abbreviations";
import { buildEntryLinks, type CatalogGameLink } from "@/lib/catalog-match";

/** Les 35 000 jaquettes du catalogue restent servies par GitHub Pages (plafond Cloudflare). */
const COVERS_BASE = "https://benglut.github.io/game-vault";

const TIER_COLORS: Record<string, string> = {
  S: "bg-accent text-bg",
  A: "bg-ok text-bg",
  B: "bg-info text-bg",
  C: "bg-muted text-bg",
  D: "bg-ko text-bg",
};

const TIER_LABELS: Record<string, string> = {
  S: "incontournable",
  A: "excellent",
  B: "bon",
  C: "moyen",
  D: "faible",
};

interface CatalogEntry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
  /** jaquette originale (haute résolution) */
  u?: string;
  /** image carrée de l'eShop faute de photo de boîte */
  sq?: boolean;
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
export default function CatalogView() {
  const { stats } = useVault();
  const [platform, setPlatform] = useState<string>(""); // "" = toutes les plateformes
  const [lists, setLists] = useState<Map<string, CatalogEntry[]> | null>(null);
  const [query, setQuery] = useState("");
  const [possession, setPossession] = useState("");
  const [region, setRegion] = useState("");
  const [quality, setQuality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const drawer = useGameDrawer();
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const coversBase = COVERS_BASE;
  // une console choisie : le cadre prend les proportions de ses jaquettes
  const frameRatio = platform ? formatOf(platform).ratio : 0.75;
  const localCover = (e: CatalogEntry) =>
    `${coversBase}/catalog-covers/${platformOf(e)}/${e.id.slice(platformOf(e).length + 1)}.jpg`;

  const entries = useMemo(() => {
    if (!lists) return null;
    const all = [...lists.values()].flat();
    if (!platform) all.sort((a, b) => a.t.localeCompare(b.t, "fr"));
    return all;
  }, [lists, platform]);

  // rapprochement catalogue ↔ base, recalculé à chaque modification de la base
  const links = useMemo<Record<string, CatalogGameLink>>(
    () => (lists ? buildEntryLinks(lists, stats.rows) : {}),
    [lists, stats.rows],
  );

  /** jeu de la base : sa fiche ; sinon la fiche catalogue, avec ajout en un clic */
  const openDrawer = (e: CatalogEntry, link?: CatalogGameLink) => {
    if (link) drawer.open(link.id);
    else setSelected(e);
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
    setLists(null);
    setError(null);
    const ids = platform ? [platform] : Object.keys(PLATFORM_LABELS);
    Promise.all(
      ids.map((id) =>
        fetch(`/catalog/${id}.json`).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} (${id})`);
          return r.json() as Promise<CatalogEntry[]>;
        }),
      ),
    )
      .then((loaded) => {
        if (!cancelled) setLists(new Map(ids.map((id, i) => [id, loaded[i] ?? []])));
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [platform]);

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
  const select = `${inputClass.replace("w-full ", "")} w-auto`;

  return (
    <div className="animate-page">
      <PageHeader
        title="Catalogue"
        subtitle="Tous les jeux sortis sur les consoles Nintendo, comparés à la collection en direct"
      />
      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setPlatform("")}
          aria-pressed={platform === ""}
          className={`flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 transition ${
            platform === ""
              ? "border-accent bg-accent-soft text-accent"
              : "border-border bg-surface text-muted hover:border-border-strong hover:text-text"
          }`}
        >
          <span className="text-xl font-semibold leading-7">∀</span>
          <span className="text-xs font-medium">Toutes</span>
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
              className={`flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition ${
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {Icon ? <Icon size={28} /> : null}
              <span className="text-center text-xs font-medium leading-tight">{label}</span>
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
          className={`${inputClass} md:w-80`}
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
          <div
            className={`grid gap-x-4 gap-y-6 ${
              frameRatio > 1.25
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            }`}
          >
            {shown.map((e) => {
              const link = linkFor(e);
              const tier = link?.quality ?? e.q;
              const pid = platformOf(e);
              // toujours un panneau latéral : on garde ses filtres et on enchaîne
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => openDrawer(e, link)}
                  className="group block w-full text-left focus-visible:outline-none"
                >
                  <div className="relative transition duration-300 group-hover:-translate-y-1">
                    <CoverImage
                      src={e.u}
                      fallback={e.img ? localCover(e) : null}
                      alt={`Jaquette de ${e.t}`}
                      ratio={frameRatio}
                      width={frameRatio > 1.25 ? 320 : 240}
                      className="ring-1 ring-border transition group-hover:ring-accent/50 group-hover:shadow-[var(--shadow-hover)] group-focus-visible:ring-2 group-focus-visible:ring-accent"
                    />
                  </div>
                  {/* infos sous la jaquette : la boîte reste lisible (bandeau console, PEGI) */}
                  <div className="mt-2 px-0.5">
                    <div className="flex items-start gap-1.5">
                      {tier ? (
                        <span
                          className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${TIER_COLORS[tier] ?? ""}`}
                          title={`Qualité ${tier} · ${TIER_LABELS[tier] ?? ""}`}
                        >
                          {tier}
                        </span>
                      ) : null}
                      <span className="line-clamp-2 text-[13px] font-medium leading-snug transition group-hover:text-accent" title={e.t}>
                        {e.t}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {link?.owned || link?.wishlist ? <StatusBadge status={link.owned ? "owned" : "wishlist"} /> : null}
                      <span className="truncate text-xs text-muted">
                        {platform ? "" : `${PLATFORM_CODES[pid] ?? pid.toUpperCase()} · `}
                        {e.r.join(", ") || "région inconnue"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-muted">
        Sources : listes No-Intro et jaquettes libretro-thumbnails, eShop Nintendo Europe pour la Switch. Un jeu absent de la base
        s’ajoute depuis sa fiche.
      </p>
      {selected ? (
        <CatalogEntryPanel
          entry={selected}
          platformId={platformOf(selected)}
          platformName={PLATFORM_LABELS[platformOf(selected)] ?? platformOf(selected)}
          fallback={selected.img ? localCover(selected) : null}
          tierLabel={selected.q ? `${selected.q} · ${TIER_LABELS[selected.q] ?? ""}` : null}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
