/**
 * Compatibilité amiibo ↔ jeux (public/catalog/amiibo-compat.json, produit par
 * scripts/catalog/fetch-amiibo.ts depuis AmiiboAPI). Les jeux y portent leur titre
 * anglais ; ceux de la base sont souvent en français : on rapproche par titre
 * normalisé, alias, puis une petite table FR → EN pour les titres qui diffèrent.
 */
import { normalizeTitle } from "./normalize";

export interface AmiiboCompat {
  games: { t: string; p: string }[];
  usages: string[];
  /** id d'amiibo → paires [index du jeu, index de l'usage] */
  links: Record<string, [number, number][]>;
}

export interface CompatGameLike {
  canonicalTitle: string;
  aliases: string[];
  platformId: string;
}

/** Titres français de la base → titre anglais d'AmiiboAPI (normalisés). */
const FR_TO_EN: Record<string, string[]> = {
  "kirby et le monde oublie": ["kirby and the forgotten land"],
  "hyrule warriors l ere du fleau": ["hyrule warriors age of calamity"],
  "mario the lapins cretins kingdom battle": ["mario rabbids kingdom battle"],
  "mario lapins cretins kingdom battle": ["mario rabbids kingdom battle"],
  "super mario galaxy super mario galaxy 2": ["super mario galaxy", "super mario galaxy 2"],
  "monster hunter stories 2": ["monster hunter stories 2 wings of ruin"],
  "yoshi s woolly world": ["poochy yoshi s woolly world"],
};

const NS2_SUFFIX = / nintendo switch 2 edition.*$/;

function keysOf(game: CompatGameLike): Set<string> {
  const keys = new Set<string>();
  for (const title of [game.canonicalTitle, ...game.aliases]) {
    const n = normalizeTitle(title).replace(NS2_SUFFIX, "");
    if (!n) continue;
    keys.add(n);
    for (const en of FR_TO_EN[n] ?? []) keys.add(en);
  }
  return keys;
}

/** Une console de la base correspond-elle à la console d'un jeu d'AmiiboAPI ? */
function samePlatform(platformId: string, apiPlatform: string): boolean {
  // une cartouche Switch 2 Edition reste le jeu Switch : les amiibo des deux valent
  if (platformId === "switch2") return apiPlatform === "switch2" || apiPlatform === "switch";
  return platformId === apiPlatform;
}

/** Index des jeux d'AmiiboAPI qui correspondent à ce jeu de la base. */
export function compatGameIndexes(game: CompatGameLike, compat: AmiiboCompat): number[] {
  const keys = keysOf(game);
  const out: number[] = [];
  compat.games.forEach((g, i) => {
    if (samePlatform(game.platformId, g.p) && keys.has(normalizeTitle(g.t))) out.push(i);
  });
  return out;
}

/** Amiibo compatibles avec un jeu de la base, avec ce qu'ils débloquent. */
export function amiiboForGame(game: CompatGameLike, compat: AmiiboCompat): { id: string; usage: string }[] {
  const wanted = new Set(compatGameIndexes(game, compat));
  if (!wanted.size) return [];
  const out: { id: string; usage: string }[] = [];
  for (const [id, pairs] of Object.entries(compat.links)) {
    const hit = pairs.find(([g]) => wanted.has(g));
    if (hit) out.push({ id, usage: compat.usages[hit[1]] ?? "" });
  }
  return out;
}

/** Jeux compatibles avec un amiibo, console et usage compris. */
export function gamesForAmiibo(id: string, compat: AmiiboCompat): { t: string; p: string; usage: string; index: number }[] {
  return (compat.links[id] ?? []).map(([g, u]) => ({ ...compat.games[g]!, usage: compat.usages[u] ?? "", index: g }));
}

export const AMIIBO_PLATFORM = "amiibo";

/** Entrée de public/catalog/amiibo.json (écrite par scripts/catalog/fetch-amiibo.ts). */
export interface AmiiboCatalogEntry {
  id: string;
  /** nom affiché (français officiel quand il existe) */
  t: string;
  /** t normalisé */
  n: string;
  r: string[];
  /** copie locale dans public/catalog-covers/amiibo/ */
  img: boolean;
  u?: string;
  /** série */
  s: string;
  /** type : Figurine, Carte, Laine, Bracelet, Bloc */
  ty: string;
  /** sortie européenne (ou annoncée : « 2027 » si seule l'année est connue) */
  d?: string;
  /** autres titres normalisés (anglais, ancien titre) : recherche et rapprochement avec la base */
  a?: string[];
  /** précision affichée sur la fiche (édition spéciale…) */
  note?: string;
}

/** Tous les titres normalisés sous lesquels un amiibo peut être cherché ou enregistré. */
export function entryKeys(e: { n: string; a?: string[] }): string[] {
  return [e.n, ...(e.a ?? [])];
}

/**
 * Groupes de type du catalogue : les figurines d'abord (choix par défaut), les cartes
 * à part pour qu'elles ne noient pas les figurines (laine comprise), le reste (bracelets
 * Power-Up, blocs en bois) ensemble.
 */
export const AMIIBO_TYPE_GROUPS = [
  { id: "figurine", label: "Figurines", types: ["Figurine", "Laine"] },
  { id: "carte", label: "Cartes", types: ["Carte"] },
  { id: "autre", label: "Autres", types: ["Bracelet", "Bloc"] },
  { id: "tous", label: "Tous", types: [] as string[] },
] as const;

export type AmiiboTypeGroup = (typeof AMIIBO_TYPE_GROUPS)[number]["id"];
export const DEFAULT_AMIIBO_TYPE: AmiiboTypeGroup = "figurine";

export function isAmiiboTypeGroup(v: string | null | undefined): v is AmiiboTypeGroup {
  return AMIIBO_TYPE_GROUPS.some((g) => g.id === v);
}

/** Groupe d'un type d'amiibo (un type inconnu compte comme « autre »). */
export function typeGroupOf(type: string | undefined): Exclude<AmiiboTypeGroup, "tous"> {
  // les Yoshi de laine et Poochy sont des statuettes comme les autres, juste en tissu
  if (!type || type === "Figurine" || type === "Laine") return "figurine";
  return type === "Carte" ? "carte" : "autre";
}

export function inTypeGroup(type: string | undefined, group: AmiiboTypeGroup): boolean {
  return group === "tous" || typeGroupOf(type) === group;
}

/** Rang d'affichage : figurines, autres objets, puis cartes. */
export function typeRank(type: string | undefined): number {
  return { figurine: 0, autre: 1, carte: 2 }[typeGroupOf(type)];
}

/** Amiibo annoncé mais pas encore sorti (date future ou année seule à venir). */
export function isUpcoming(d: string | undefined, today = new Date().toISOString().slice(0, 10)): boolean {
  if (!d) return false;
  return d.length === 4 ? d > today.slice(0, 4) : d > today;
}

/** « 12 nov. 2026 », ou l'année seule quand la date exacte n'est pas annoncée. */
export function formatRelease(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Titres affichés, sans homonymes : même nom → série entre parenthèses (Mario de
 * Super Mario / de Super Smash Bros.) ; même nom et même série → le type pour ce qui
 * n'est pas une figurine (Luke figurine / Luke carte) ; encore homonymes (cartes
 * Street Fighter 6 des deux vagues) → numéro de vague dans l'ordre de sortie.
 */
export function displayTitles(drafts: { id: string; name: string; series: string; type: string; release?: string }[]): Map<string, string> {
  type D = (typeof drafts)[number];
  const counts = (keyOf: (d: D) => string) => {
    const m = new Map<string, number>();
    for (const d of drafts) m.set(keyOf(d), (m.get(keyOf(d)) ?? 0) + 1);
    return (d: D) => m.get(keyOf(d)) ?? 0;
  };
  const sameName = counts((d) => d.name);
  const sameSeries = counts((d) => `${d.name}|${d.series}`);
  const sameType = counts((d) => `${d.name}|${d.series}|${d.type}`);
  const qualifiers = (d: D): string[] => {
    if (sameName(d) < 2) return [];
    const q = [d.series];
    if (sameSeries(d) > 1 && sameType(d) < sameSeries(d) && d.type !== "Figurine") q.push(d.type.toLowerCase());
    return q;
  };
  const base = (d: D) => {
    const q = qualifiers(d);
    return q.length ? `${d.name} (${q.join(", ")})` : d.name;
  };
  const groups = new Map<string, D[]>();
  for (const d of drafts) groups.set(base(d), [...(groups.get(base(d)) ?? []), d]);
  const out = new Map<string, string>();
  for (const [t, list] of groups) {
    if (list.length === 1) {
      out.set(list[0]!.id, t);
      continue;
    }
    list
      .sort((x, y) => (x.release ?? "9999").localeCompare(y.release ?? "9999") || x.id.localeCompare(y.id))
      .forEach((d, i) => out.set(d.id, t.endsWith(")") ? `${t.slice(0, -1)}, vague ${i + 1})` : `${t} (vague ${i + 1})`));
  }
  return out;
}

/** Libellés des consoles d'AmiiboAPI. */
export const COMPAT_PLATFORM_LABELS: Record<string, string> = {
  switch2: "Switch 2",
  switch: "Switch",
  "3ds": "3DS",
  wiiu: "Wii U",
};
