import type Fuse from "fuse.js";
import type { SearchDoc } from "./data";
import { expandAbbreviations } from "./abbreviations";

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Ensemble des mots (titre + alias + franchise) d'un document de recherche. */
function wordSet(d: SearchDoc): Set<string> {
  const words = new Set<string>();
  for (const src of [d.n, ...d.a.map(norm), norm(d.f ?? "")]) {
    for (const w of src.split(" ")) if (w) words.add(w);
  }
  return words;
}

/**
 * Recherche hybride : les jeux contenant TOUS les mots de la requête (mots entiers)
 * passent devant les résultats fuzzy — « pokemon rouge » doit classer
 * « Pokémon Version Rouge » avant les faux amis du fuzzy.
 */
export function searchDocs(
  docs: SearchDoc[],
  fuse: Fuse<SearchDoc>,
  query: string,
  limit: number,
): { item: SearchDoc; score: number }[] {
  const q = expandAbbreviations(norm(query));
  if (!q) return [];
  const qWords = q.split(" ").filter(Boolean);

  const exact = docs
    .filter((d) => {
      const words = wordSet(d);
      return qWords.every((w) => words.has(w));
    })
    .sort((a, b) => a.n.length - b.n.length) // le titre le plus court = le plus spécifique
    .map((item) => ({ item, score: 1 }));

  const seen = new Set(exact.map((r) => r.item.id));
  const fuzzy = fuse
    .search(q)
    .filter((h) => !seen.has(h.item.id))
    .map((h) => ({ item: h.item, score: Math.round((1 - (h.score ?? 0)) * 100) / 100 }));

  return [...exact, ...fuzzy].slice(0, limit);
}
