"use client";

import { useEffect, useMemo, useState } from "react";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault } from "@/components/vault/VaultProvider";
import {
  BOX_BADGES,
  BoxBadge,
  Button,
  Chip,
  ChipRow,
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
import {
  AMIIBO_PLATFORM,
  AMIIBO_TYPE_GROUPS,
  COMPAT_PLATFORM_LABELS,
  DEFAULT_AMIIBO_TYPE,
  compatGameIndexes,
  entryKeys,
  inTypeGroup,
  isAmiiboTypeGroup,
  isUpcoming,
  typeGroupOf,
  typeRank,
  type AmiiboCompat,
  type AmiiboTypeGroup,
} from "@/lib/amiibo";

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
  /** amiibo : série, type (Figurine, Carte…), sortie européenne */
  s?: string;
  ty?: string;
  d?: string;
  /** amiibo : autres titres normalisés (nom anglais, ancien titre) */
  a?: string[];
  note?: string;
}

/** Cartes affichées par page (le bouton « Afficher plus » en ajoute autant). */
const PAGE = 200;

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
  amiibo: "amiibo",
};

/** « Toutes » = toutes les consoles de jeux ; les amiibo ont leur propre onglet */
const GAME_PLATFORM_IDS = Object.keys(PLATFORM_LABELS).filter((id) => id !== AMIIBO_PLATFORM);

/** ids de plateforme, du plus long au plus court (préfixes imbriqués) */
const PLATFORM_IDS = Object.keys(PLATFORM_LABELS).sort((a, b) => b.length - a.length);

/** code court affiché sous la jaquette (« SWITCH-DIGITAL » déborderait) */
const PLATFORM_CODES: Record<string, string> = {
  gamecube: "NGC",
  switch: "SWITCH",
  "switch-digital": "SW DIGITAL",
  switch2: "SWITCH 2",
  amiibo: "AMIIBO",
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
  // amiibo : jeu compatible (index dans amiibo-compat.json) et série
  const [compatGame, setCompatGame] = useState("");
  const [series, setSeries] = useState("");
  // amiibo : figurines par défaut, les cartes à part
  const [amiiboType, setAmiiboType] = useState<AmiiboTypeGroup>(DEFAULT_AMIIBO_TYPE);
  const [limit, setLimit] = useState(PAGE);
  const [compat, setCompat] = useState<AmiiboCompat | null>(null);
  const isAmiibo = platform === AMIIBO_PLATFORM;
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const drawer = useGameDrawer();
  const [selected, setSelected] = useState<CatalogEntry | null>(null);
  const coversBase = COVERS_BASE;
  // une console choisie : le cadre prend les proportions de ses jaquettes
  const frameRatio = platform ? formatOf(platform).ratio : 0.75;
  const localCover = (e: CatalogEntry) => `${coversBase}/catalog-covers/${platformOf(e)}/${e.id.slice(platformOf(e).length + 1)}.jpg`;
  /** original à redimensionner, sauf s'il n'est que la copie locale elle-même (amiibo) */
  const remoteCover = (e: CatalogEntry) => (e.img && e.u?.startsWith(`${coversBase}/`) ? null : e.u);

  const entries = useMemo(() => {
    if (!lists) return null;
    const all = [...lists.values()].flat();
    if (!platform) all.sort((a, b) => a.t.localeCompare(b.t, "fr"));
    // amiibo (onglet « Tous ») : figurines d'abord, puis laine / bracelets / blocs, puis cartes
    if (platform === AMIIBO_PLATFORM) all.sort((a, b) => typeRank(a.ty) - typeRank(b.ty) || a.t.localeCompare(b.t, "fr"));
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
    read("jeu", setCompatGame);
    read("serie", setSeries);
    const type = params.get("type");
    if (isAmiiboTypeGroup(type)) setAmiiboType(type);
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
    if (compatGame) params.set("jeu", compatGame);
    if (series) params.set("serie", series);
    if (platform === AMIIBO_PLATFORM) params.set("type", amiiboType);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [platform, query, possession, region, quality, box, compatGame, series, amiiboType]);

  // table de compatibilité, chargée au premier passage sur les amiibo
  useEffect(() => {
    if (!isAmiibo || compat) return;
    fetch("/catalog/amiibo-compat.json")
      .then((r) => (r.ok ? (r.json() as Promise<AmiiboCompat>) : null))
      .then((c) => c && setCompat(c))
      .catch(() => undefined);
  }, [isAmiibo, compat]);

  useEffect(() => {
    let cancelled = false;
    setLists(null);
    setError(null);
    const ids = platform ? [platform] : GAME_PLATFORM_IDS;
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

  // filtre amiibo « Compatible avec » : les jeux de ta collection (possédés ou en route) d'abord
  const compatOptions = useMemo(() => {
    if (!compat) return null;
    const mine = new Set<number>();
    for (const r of stats.rows) {
      if (r.game.kind !== "game" || (r.ownedCount === 0 && r.state !== "incoming")) continue;
      for (const i of compatGameIndexes(r.game, compat)) mine.add(i);
    }
    const all = compat.games
      .map((g, i) => ({ i, label: `${g.t} (${COMPAT_PLATFORM_LABELS[g.p] ?? g.p})`, mine: mine.has(i) }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
    return { mine: all.filter((o) => o.mine), others: all.filter((o) => !o.mine) };
  }, [compat, stats.rows]);
  // séries du type d'amiibo affiché : les séries de cartes n'encombrent pas la liste des figurines
  const seriesList = useMemo(
    () =>
      isAmiibo && entries
        ? [...new Set(entries.filter((e) => inTypeGroup(e.ty, amiiboType)).map((e) => e.s).filter((s): s is string => !!s))].sort((a, b) =>
            a.localeCompare(b, "fr"),
          )
        : [],
    [isAmiibo, entries, amiiboType],
  );

  // tous les filtres sauf le type d'amiibo : sert aussi aux compteurs des puces de type
  const matching = useMemo(() => {
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
      if (isAmiibo && series && e.s !== series) return false;
      if (isAmiibo && compatGame && compat && !(compat.links[e.id] ?? []).some(([g]) => String(g) === compatGame)) return false;
      // amiibo : le nom anglais (alias) et la série (« metroid » trouve Sylux) se cherchent aussi
      if (qWords.length && !(e.s ? [...entryKeys(e).map((k) => `${k} ${norm(e.s!)}`)] : [e.n]).some((k) => qWords.every((w) => k.includes(w)))) return false;
      return true;
    });
  }, [entries, query, possession, links, region, quality, box, isAmiibo, series, compatGame, compat]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { figurine: 0, carte: 0, autre: 0, tous: matching.length };
    if (isAmiibo) for (const e of matching) counts[typeGroupOf(e.ty)] = (counts[typeGroupOf(e.ty)] ?? 0) + 1;
    return counts;
  }, [matching, isAmiibo]);

  const filtered = useMemo(() => (isAmiibo ? matching.filter((e) => inTypeGroup(e.ty, amiiboType)) : matching), [matching, isAmiibo, amiiboType]);

  // nouvelle sélection : on repart de la première page
  useEffect(() => setLimit(PAGE), [filtered]);

  const shown = filtered.slice(0, limit);
  const anyFilter = !!(query || possession || region || quality || box || compatGame || series);
  const clearFilters = () => {
    setQuery("");
    setPossession("");
    setRegion("");
    setQuality("");
    setBox("");
    setCompatGame("");
    setSeries("");
  };

  return (
    <div className="animate-page">
      <PageHeader title="Catalogue" subtitle="Tous les jeux sortis sur les consoles Nintendo, comparés à la collection en direct" />

      {/* choix de la console */}
      <div role="group" aria-label="Console" className="no-scrollbar -mx-4 mb-1 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
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
            <SearchField
              className="basis-full lg:flex-1 lg:basis-64"
              value={query}
              onChange={setQuery}
              placeholder={isAmiibo ? "Chercher un amiibo…" : "Chercher dans tous les jeux sortis…"}
            />
            <select aria-label="Possession" value={possession} onChange={(e) => setPossession(e.target.value)} className={selectClass}>
              <option value="">Possédés ou non</option>
              <option value="owned">Dans ma collection</option>
              <option value="missing">Pas dans ma collection</option>
            </select>
            {isAmiibo ? (
              <>
                <select aria-label="Jeu compatible" value={compatGame} onChange={(e) => setCompatGame(e.target.value)} className={selectClass}>
                  <option value="">Compatible avec…</option>
                  {compatOptions?.mine.length ? (
                    <optgroup label="Mes jeux">
                      {compatOptions.mine.map((o) => (
                        <option key={o.i} value={o.i}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {compatOptions ? (
                    <optgroup label="Autres jeux">
                      {compatOptions.others.map((o) => (
                        <option key={o.i} value={o.i}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
                <select aria-label="Série" value={series} onChange={(e) => setSeries(e.target.value)} className={selectClass}>
                  <option value="">Toutes les séries</option>
                  {seriesList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
            {isAmiibo ? null : (
              <>
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
            )}
          </>
        }
      >
        {isAmiibo ? (
          <ChipRow label="Type d’amiibo">
            {AMIIBO_TYPE_GROUPS.map((g) => (
              <Chip key={g.id} active={amiiboType === g.id} onClick={() => setAmiiboType(g.id)} count={entries ? typeCounts[g.id] : undefined}>
                {g.label}
              </Chip>
            ))}
          </ChipRow>
        ) : null}
      </FilterBar>

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
              <span className="font-medium text-text">{filtered.length.toLocaleString("fr-FR")}</span> {isAmiibo ? "amiibo" : `jeu${filtered.length > 1 ? "x" : ""}`} sur{" "}
              {entries.length.toLocaleString("fr-FR")} référencés
              {shown.length < filtered.length ? ` · ${shown.length} affichés` : ""}
            </span>
            {anyFilter ? (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            ) : null}
          </div>
          {shown.length === 0 ? (
            <EmptyState title={isAmiibo ? "Aucun amiibo ne correspond" : "Aucun jeu ne correspond"} icon={<CatalogIcon size={18} />}>
              {isAmiibo ? "Essayez un autre type, un autre mot ou moins de filtres." : "Essayez une autre console, un autre mot ou moins de filtres."}
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
                    <div className="cover-lift relative overflow-hidden rounded-lg ring-1 ring-[var(--cover-ring)]">
                      <CoverImage
                        src={remoteCover(e)}
                        fallback={e.img ? localCover(e) : null}
                        alt={`Jaquette de ${e.t}`}
                        ratio={frameRatio}
                        width={frameRatio > 1.25 ? 320 : 240}
                        rounded="rounded-none"
                      />
                      {/* pastilles posées sur la jaquette (même logique que les cartes de la collection) */}
                      {tier ? (
                        <div className="absolute left-1.5 top-1.5">
                          <TierBadge tier={tier} className="shadow-[var(--shadow-sm)]" />
                        </div>
                      ) : null}
                      {e.b ? (
                        <div className="absolute right-1.5 top-1.5 rounded-md bg-bg-elev/90 shadow-[var(--shadow-sm)] backdrop-blur-sm">
                          <BoxBadge code={e.b} />
                        </div>
                      ) : null}
                      {link?.statuses.length ? (
                        <div className="absolute inset-x-1.5 bottom-1.5 flex flex-wrap gap-1">
                          {link.statuses.map((s) => (
                            <span key={s} className="rounded-md bg-bg-elev/90 shadow-[var(--shadow-sm)] backdrop-blur-sm">
                              <StatusBadge status={s} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 px-0.5">
                      <span className="line-clamp-2 text-[13px] font-medium leading-snug transition group-hover:text-accent" title={e.t}>
                        {e.t}
                      </span>
                      <div className="mt-1">
                        <span className="block min-w-0 truncate text-xs text-muted">
                          {e.s
                            ? `${e.ty ?? "amiibo"} · ${e.s}${e.d && isUpcoming(e.d) ? " · à venir" : ""}`
                            : `${platform ? "" : `${PLATFORM_CODES[pid] ?? pid.toUpperCase()} · `}${e.r.join(", ") || "région inconnue"}`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {shown.length < filtered.length ? (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setLimit((l) => l + PAGE)}>
                Afficher {Math.min(PAGE, filtered.length - shown.length).toLocaleString("fr-FR")} de plus
              </Button>
            </div>
          ) : null}
        </>
      )}
      <p className="mt-8 text-xs text-muted">
        {isAmiibo
          ? "Sources : AmiiboAPI et Nintendo (noms français, images et amiibo annoncés). Un amiibo absent de la base s’ajoute depuis sa fiche."
          : "Sources : listes No-Intro et jaquettes libretro-thumbnails, eShop Nintendo Europe pour la Switch. Un jeu absent de la base s’ajoute depuis sa fiche."}
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
