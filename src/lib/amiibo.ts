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

/** Libellés des consoles d'AmiiboAPI. */
export const COMPAT_PLATFORM_LABELS: Record<string, string> = {
  switch2: "Switch 2",
  switch: "Switch",
  "3ds": "3DS",
  wiiu: "Wii U",
};
