import type { Game } from "./schema";
import { normalizeTitle } from "./normalize";

/** Document de recherche compact (titre, normalisé, alias, franchise, plateforme). */
export interface SearchDoc {
  id: string;
  t: string;
  n: string;
  a: string[];
  f: string | null;
  p: string;
  r?: string;
  q?: string | null;
}

export function toSearchDoc(game: Game): SearchDoc {
  return {
    id: game.id,
    t: game.canonicalTitle,
    n: game.normalizedTitle || normalizeTitle(game.canonicalTitle),
    a: game.aliases,
    f: game.franchise,
    p: game.platformId,
    r: game.region,
    q: game.qualityTier,
  };
}
