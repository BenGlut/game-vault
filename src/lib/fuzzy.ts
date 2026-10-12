import type Fuse from "fuse.js";
import type { SearchDoc } from "./search";
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

  const head = qWords.slice(0, -1);
  const last = qWords[qWords.length - 1]!;
  const exact: SearchDoc[] = [];
  const prefix: SearchDoc[] = [];
  for (const d of docs) {
    const words = wordSet(d);
    if (!head.every((w) => words.has(w))) continue;
    if (words.has(last)) exact.push(d);
    // dernier mot en cours de frappe : « perso » trouve Persona
    else if ([...words].some((w) => w.startsWith(last))) prefix.push(d);
  }
  // le titre le plus court = le plus spécifique
  const byLength = (a: SearchDoc, b: SearchDoc) => a.n.length - b.n.length;
  const ranked = [
    ...exact.sort(byLength).map((item) => ({ item, score: 1 })),
    ...prefix.sort(byLength).map((item) => ({ item, score: 0.95 })),
  ];

  // des résultats par mots existent : le fuzzy ne complète qu'avec des quasi-homonymes
  // (sinon « persona » remonterait « Superstars »)
  const maxScore = ranked.length ? 0.15 : 1;
  const seen = new Set(ranked.map((r) => r.item.id));
  const fuzzy = fuse
    .search(q)
    .filter((h) => !seen.has(h.item.id) && (h.score ?? 0) <= maxScore)
    .map((h) => ({ item: h.item, score: Math.round((1 - (h.score ?? 0)) * 100) / 100 }));

  return [...ranked, ...fuzzy].slice(0, limit);
}
