"use client";

import { useEffect, useMemo, useState } from "react";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault } from "@/components/vault/VaultProvider";
import {
  BOX_BADGES,
  BoxBadge,
  Button,
  CoverGridSkeleton,
  EmptyState,
  ErrorState,
  FilterBar,
  PageHeader,
  SearchField,
  StatusBadge,
  TIER_LABELS,
  TierBadge,
  cx,
} from "@/components/ui/primitives";
import { CatalogIcon, GridIcon } from "@/components/icons";
import CoverImage from "@/components/game/CoverImage";
import { formatOf } from "@/lib/platform-format";
import CatalogEntryPanel from "./CatalogEntryPanel";
import { sizedInput } from "@/components/ui/fields";
import { expandAbbreviations } from "@/lib/abbreviations";
import { buildEntryLinks, type CatalogGameLink } from "@/lib/catalog-match";

/** Les 35 000 jaquettes du catalogue restent servies par GitHub Pages (plafond Cloudflare). */
const COVERS_BASE = "https://benglut.github.io/game-vault";

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
  /** boîte : fr, eu (multilingue) ou etr (import) — Switch seulement */
  b?: string;
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

/** code court affiché sous la jaquette (« SWITCH-DIGITAL » déborderait) */
const PLATFORM_CODES: Record<string, string> = {
  gamecube: "NGC",
  switch: "SWITCH",
  "switch-digital": "SW DIGITAL",
  switch2: "SWITCH 2",
};

const selectClass = cx(sizedInput("w-[calc(50%-4px)] sm:w-auto"), "gv-select cursor-pointer");

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
  const [box, setBox] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const drawer = useGameDrawer();
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const coversBase = COVERS_BASE;
  // une console choisie : le cadre prend les proportions de ses jaquettes
  const frameRatio = platform ? formatOf(platform).ratio : 0.75;
  const localCover = (e: CatalogEntry) => `${coversBase}/catalog-covers/${platformOf(e)}/${e.id.slice(platformOf(e).length + 1)}.jpg`;

  const entries = useMemo(() => {
    if (!lists) return null;
    const all = [...lists.values()].flat();
    if (!platform) all.sort((a, b) => a.t.localeCompare(b.t, "fr"));
    return all;
  }, [lists, platform]);

  // rapprochement catalogue ↔ base, recalculé à chaque modification de la base
  const links = useMemo<Record<string, CatalogGameLink>>(() => (lists ? buildEntryLinks(lists, stats.rows) : {}), [lists, stats.rows]);

  /** jeu de la base : sa fiche ; sinon la fiche catalogue, avec ajout en un clic */
  const openDrawer = (e: CatalogEntry, link?: CatalogGameLink) => {
    if (link) drawer.open(link.id);
    else setSelected(e);
  };

  /**
   * Plateforme d'une entrée, déduite de son id (`gba-slug`, `switch-digital-slug`…).
   * Le préfixe le plus long gagne : `switch-digital` avant `switch`.
   */
  const platformOf = (e: CatalogEntry): string => PLATFORM_IDS.find((id) => e.id.startsWith(`${id}-`)) ?? e.id.slice(0, e.id.indexOf("-"));
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
    read("boite", setBox);
  }, []);

  // reflète chaque sélection dans l'URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (platform) params.set("plateforme", platform);
    if (query) params.set("q", query);
    if (possession) params.set("possession", possession);
    if (region) params.set("region", region);
    if (quality) params.set("qualite", quality);
    if (box) params.set("boite", box);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [platform, query, possession, region, quality, box]);

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
  }, [platform, attempt]);

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
      if (box && e.b !== box) return false;
      if (qWords.length && !qWords.every((w) => e.n.includes(w))) return false;
      return true;
    });
  }, [entries, query, possession, links, region, quality, box]);

  const shown = filtered.slice(0, 200);
  const anyFilter = !!(query || possession || region || quality || box);
  const clearFilters = () => {
    setQuery("");
    setPossession("");
    setRegion("");
    setQuality("");
    setBox("");
  };

  return (
    <div className="animate-page">
      <PageHeader title="Catalogue" subtitle="Tous les jeux sortis sur les consoles Nintendo, comparés à la collection en direct" />

      {/* choix de la console */}
      <div role="group" aria-label="Console" className="no-scrollbar -mx-4 mb-1 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[["", "Toutes"] as const, ...Object.entries(PLATFORM_LABELS)].map(([id, label]) => {
          const Icon = id ? CONSOLE_ICONS[id] : null;
          const active = platform === id;
          return (
            <button
              key={id || "all"}
              type="button"
              onClick={() => setPlatform(id)}
              aria-pressed={active}
              className={cx(
                "flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition",
                active
                  ? "border-accent/50 bg-accent/10 text-text shadow-[var(--shadow-sm)]"
                  : "border-border bg-surface text-text-2 hover:border-border-strong hover:text-text",
              )}
            >
              <span className={active ? "text-accent" : "text-muted"}>{Icon ? <Icon size={20} /> : <GridIcon size={16} />}</span>
              {label}
            </button>
          );
        })}
      </div>

      <FilterBar
        top={
          <>
            <SearchField className="basis-full lg:flex-1 lg:basis-64" value={query} onChange={setQuery} placeholder="Chercher dans tous les jeux sortis…" />
            <select aria-label="Possession" value={possession} onChange={(e) => setPossession(e.target.value)} className={selectClass}>
              <option value="">Possédés ou non</option>
              <option value="owned">Dans ma collection</option>
              <option value="missing">Pas dans ma collection</option>
            </select>
            <select aria-label="Région" value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
              <option value="">Toutes régions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select aria-label="Qualité" value={quality} onChange={(e) => setQuality(e.target.value)} className={selectClass}>
              <option value="">Toute qualité</option>
              {Object.entries(TIER_LABELS).map(([t, label]) => (
                <option key={t} value={t}>
                  {t} — {label}
                </option>
              ))}
            </select>
            <select aria-label="Boîte" value={box} onChange={(e) => setBox(e.target.value)} className={selectClass}>
              <option value="">Toute boîte</option>
              <option value="fr">FR — boîte française</option>
              <option value="eu">EU — multilingue, FR à vérifier</option>
              <option value="etr">ÉTR — import seulement</option>
            </select>
          </>
        }
      />

      {error ? (
        <ErrorState title="Le catalogue n’a pas pu être chargé" onRetry={() => setAttempt((a) => a + 1)}>
          {error}
        </ErrorState>
      ) : !entries ? (
        <CoverGridSkeleton />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted" aria-live="polite">
            <span>
              <span className="font-medium text-text">{filtered.length.toLocaleString("fr-FR")}</span> jeu{filtered.length > 1 ? "x" : ""} sur{" "}
              {entries.length.toLocaleString("fr-FR")} référencés
              {shown.length < filtered.length ? ` · ${shown.length} affichés, affinez la recherche` : ""}
            </span>
            {anyFilter ? (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            ) : null}
          </div>
          {shown.length === 0 ? (
            <EmptyState title="Aucun jeu ne correspond" icon={<CatalogIcon size={18} />}>
              Essayez une autre console, un autre mot ou moins de filtres.
            </EmptyState>
          ) : (
            <div
              className={cx(
                "grid gap-x-3 gap-y-6 sm:gap-x-4",
                frameRatio > 1.25 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
              )}
            >
              {shown.map((e) => {
                const link = linkFor(e);
                const tier = link?.quality ?? e.q;
                const pid = platformOf(e);
                // toujours un panneau latéral : on garde ses filtres et on enchaîne
                return (
                  <button key={e.id} type="button" onClick={() => openDrawer(e, link)} className="group block w-full min-w-0 rounded-lg text-left focus-visible:outline-offset-4">
                    <div className="cover-lift overflow-hidden rounded-lg ring-1 ring-[var(--cover-ring)]">
                      <CoverImage
                        src={e.u}
                        fallback={e.img ? localCover(e) : null}
                        alt={`Jaquette de ${e.t}`}
                        ratio={frameRatio}
                        width={frameRatio > 1.25 ? 320 : 240}
                        rounded="rounded-none"
                      />
                    </div>
                    {/* infos sous la jaquette : la boîte reste lisible (bandeau console, PEGI) */}
                    <div className="mt-2 px-0.5">
                      <div className="flex items-start gap-1.5">
                        {tier ? <TierBadge tier={tier} size="sm" className="mt-px" /> : null}
                        <span className="line-clamp-2 text-[13px] font-medium leading-snug transition group-hover:text-accent" title={e.t}>
                          {e.t}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {link?.statuses.map((s) => <StatusBadge key={s} status={s} />)}
                        <BoxBadge code={e.b} />
                        <span className="min-w-0 truncate text-xs text-muted">
                          {platform ? "" : `${PLATFORM_CODES[pid] ?? pid.toUpperCase()} · `}
                          {e.r.join(", ") || "région inconnue"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
      <p className="mt-8 text-xs text-muted">
        Sources : listes No-Intro et jaquettes libretro-thumbnails, eShop Nintendo Europe pour la Switch. Un jeu absent de la base s’ajoute depuis sa fiche.
      </p>
      {selected ? (
        <CatalogEntryPanel
          entry={selected}
          platformId={platformOf(selected)}
          platformName={PLATFORM_LABELS[platformOf(selected)] ?? platformOf(selected)}
          fallback={selected.img ? localCover(selected) : null}
          tierLabel={selected.q ? `${selected.q} · ${TIER_LABELS[selected.q] ?? ""}` : null}
          boxLabel={selected.b ? (BOX_BADGES[selected.b]?.title ?? null) : null}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
