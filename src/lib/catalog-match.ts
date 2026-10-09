import { normalizeTitle } from "./normalize";
import { isOwned, stillWanted, type StatusLike } from "./collection";

/**
 * Associe chaque entrée du catalogue No-Intro à un jeu de la base (possédé ou
 * wishlist) — matching 3 niveaux : titre normalisé exact, mêmes mots réordonnés,
 * puis mots du jeu ⊆ mots de l'entrée (sous-titres). Calculé dans le navigateur à
 * partir de la base en direct.
 */

export interface CatalogGameLink {
  id: string;
  owned: boolean;
  wishlist: boolean;
  quality: string | null;
}

export interface CatalogEntryLite {
  id: string;
  n: string;
}

export interface MatchRow {
  game: { id: string; platformId: string; normalizedTitle: string; aliases: string[]; qualityTier: string | null };
  items: StatusLike[];
}

function words(s: string): string[] {
  return s.split(" ").filter(Boolean);
}
function sortedKey(s: string): string {
  return [...words(s)].sort().join(" ");
}

export function buildEntryLinks(
  byPlatform: Map<string, CatalogEntryLite[]>,
  rows: MatchRow[],
): Record<string, CatalogGameLink> {
  const entryLinks: Record<string, CatalogGameLink> = {};
  for (const [platformId, entries] of byPlatform) {
    const exact = new Map<string, string>();
    const sorted = new Map<string, string>();
    for (const e of entries) {
      if (!exact.has(e.n)) exact.set(e.n, e.id);
      const key = sortedKey(e.n);
      if (!sorted.has(key)) sorted.set(key, e.id);
    }

    // Le drapeau « sorti en boîte » de l'eShop est européen : un titre acheté en
    // import peut être physique alors que le catalogue FR le dit dématérialisé.
    // Un jeu de la base est donc confronté aux deux catalogues de sa console.
    const basePlatformId = platformId.replace(/-digital$/, "");

    for (const row of rows) {
      if (row.game.platformId !== basePlatformId) continue;
      const link: CatalogGameLink = {
        id: row.game.id,
        owned: row.items.some(isOwned),
        wishlist: stillWanted(row.items),
        quality: row.game.qualityTier,
      };
      const candidates = [row.game.normalizedTitle, ...row.game.aliases.map(normalizeTitle)];

      let entryId: string | undefined;
      for (const cand of candidates) {
        entryId = exact.get(cand);
        if (entryId) break;
      }
      if (!entryId) {
        for (const cand of candidates) {
          entryId = sorted.get(sortedKey(cand));
          if (entryId) break;
        }
      }
      if (!entryId) {
        // sous-ensemble : le moins de mots en trop gagne (max 6)
        let best: { id: string; extra: number } | undefined;
        for (const cand of candidates) {
          const cw = new Set(words(cand));
          if (cw.size < 2) continue;
          for (const e of entries) {
            const ew = words(e.n);
            if (![...cw].every((w) => ew.includes(w))) continue;
            const extra = ew.filter((w) => !cw.has(w)).length;
            if (extra > 6) continue;
            if (!best || extra < best.extra) best = { id: e.id, extra };
          }
          if (best) break;
        }
        entryId = best?.id;
      }
      if (entryId && !entryLinks[entryId]) entryLinks[entryId] = link;
    }
  }
  return entryLinks;
}
