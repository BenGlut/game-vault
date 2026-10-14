#!/usr/bin/env tsx
/**
 * Prix Amazon.fr des amiibo, à partir d'un relevé des pages de résultats
 * (`amazon-amiibo-raw.tsv` : ASIN, prix affiché HT, prix « autres offres », titre) et
 * d'une correspondance ASIN → amiibo vérifiée à la main (`amazon-amiibo-map.json`).
 *
 *   pnpm exec tsx scripts/catalog/amazon-amiibo.ts [AAAA-MM-JJ du relevé]
 *
 * Produit public/catalog/amiibo-amazon.json : { at, prices: { idCatalogue: { p, asin, imp? } } }.
 * Pour chaque amiibo, l'offre la moins chère ; une version européenne passe toujours
 * avant un import japonais, même plus chère (pas la même boîte).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "scripts", "catalog");
const at = process.argv[2] ?? new Date().toISOString().slice(0, 10);

const { map, imports } = JSON.parse(fs.readFileSync(path.join(DIR, "amazon-amiibo-map.json"), "utf8")) as {
  map: Record<string, string>;
  imports: string[];
};
const isImport = new Set(imports);
const catalog = new Set(
  (JSON.parse(fs.readFileSync(path.join(ROOT, "public", "catalog", "amiibo.json"), "utf8")) as { id: string }[]).map((e) => e.id),
);

// relevé fait depuis un compte Amazon Business : prix affichés hors taxes, on stocke le TTC
const VAT = 1.2;
const num = (s?: string) => (s && s !== "-" ? Math.round(Number(s) * VAT * 100) / 100 : NaN);
const best = new Map<string, { p: number; asin: string; imp?: true }>();
const unknown: string[] = [];
for (const line of fs.readFileSync(path.join(DIR, "amazon-amiibo-raw.tsv"), "utf8").split("\n")) {
  const [asin, shown, others] = line.split("\t");
  const suffix = asin && map[asin];
  if (!suffix) continue;
  const id = `amiibo-${suffix}`;
  if (!catalog.has(id)) {
    unknown.push(`${asin} → ${id}`);
    continue;
  }
  const p = Math.min(...[num(shown), num(others)].filter((n) => !Number.isNaN(n)));
  if (!Number.isFinite(p)) continue;
  const offer = { p, asin, ...(isImport.has(asin) ? { imp: true as const } : {}) };
  const cur = best.get(id);
  // version européenne d'abord, puis le prix
  if (!cur || (cur.imp && !offer.imp) || (!!cur.imp === !!offer.imp && p < cur.p)) best.set(id, offer);
}
if (unknown.length) throw new Error(`Ids absents du catalogue :\n${unknown.join("\n")}`);

const prices = Object.fromEntries([...best.entries()].sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(path.join(ROOT, "public", "catalog", "amiibo-amazon.json"), JSON.stringify({ at, prices }) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, amiibo: best.size, imports: [...best.values()].filter((o) => o.imp).length }));
