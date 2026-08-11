import fs from "node:fs";
import path from "node:path";
import { normalizeTitle } from "./normalize";
import { POSSESSION, stillWanted } from "./data";
import type { GameRow } from "./data";

/**
 * Associe chaque entrée du catalogue No-Intro à un jeu de la base (possédé ou
 * wishlist) — matching 3 niveaux comme les jaquettes : titre normalisé exact,
 * mêmes mots réordonnés, puis mots du jeu ⊆ mots de l'entrée (sous-titres).
 * Calculé au build ; le client reçoit un simple mapping entryId → lien.
 */

export interface CatalogGameLink {
  id: string;
  owned: boolean;
  wishlist: boolean;
  quality: string | null;
}

interface CatalogEntryLite {
  id: string;
  n: string;
}

function words(s: string): string[] {
  return s.split(" ").filter(Boolean);
}
function sortedKey(s: string): string {
  return [...words(s)].sort().join(" ");
}

export function buildEntryLinks(rows: GameRow[]): Record<string, CatalogGameLink> {
  const catalogDir = path.join(process.cwd(), "public", "catalog");
  if (!fs.existsSync(catalogDir)) return {};

  const entryLinks: Record<string, CatalogGameLink> = {};
  const byPlatform = new Map<string, CatalogEntryLite[]>();
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"))) {
    const platformId = file.replace(/\.json$/, "");
    byPlatform.set(
      platformId,
      JSON.parse(fs.readFileSync(path.join(catalogDir, file), "utf8")) as CatalogEntryLite[],
    );
  }

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
        owned: row.items.some((i) => POSSESSION.includes(i.status)),
        wishlist: stillWanted(row),
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
