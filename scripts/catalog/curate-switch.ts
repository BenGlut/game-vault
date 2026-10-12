#!/usr/bin/env tsx
/**
 * Curation du catalogue Switch / Switch 2, après fetch-eshop-catalog.ts.
 *
 *   pnpm exec tsx scripts/catalog/curate-switch.ts
 *
 * - remonte dans `switch` les jeux que l'eShop range en dématérialisé alors qu'ils
 *   existent en cartouche (Persona 5 Royal, Return to Monkey Island…), jaquette comprise ;
 * - pose la pastille boîte `b` sur chaque jeu Switch physique : fr / eu / etr ;
 * - ajoute les jeux en boîte absents de l'eShop (`extras`) ;
 * - applique les tiers S à D de quality-map.json.
 *
 * Idempotent : se relance sans rien casser.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const COVERS_ROOT = path.join(ROOT, "public", "catalog-covers");

export type BoxCode = "fr" | "eu" | "etr";

interface Entry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
  u?: string;
  sq?: boolean;
  b?: BoxCode;
}

interface Curation {
  boxes: Record<string, BoxCode>;
  extras: { t: string; b: BoxCode }[];
}

const read = (platformId: string): Entry[] =>
  JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, `${platformId}.json`), "utf8")) as Entry[];
const write = (platformId: string, entries: Entry[]): void =>
  fs.writeFileSync(path.join(CATALOG_DIR, `${platformId}.json`), JSON.stringify(entries) + "\n", "utf8");

/** Réordonne les clés pour garder des JSON stables d'un passage à l'autre. */
function withFields(e: Entry, q: string | undefined, b: BoxCode | undefined): Entry {
  const rest: Entry = { ...e };
  delete rest.q;
  delete rest.b;
  return { ...rest, ...(q ? { q } : {}), ...(b ? { b } : {}) };
}

export function curateSwitch(): Record<string, number> {
  const quality = JSON.parse(fs.readFileSync(path.join(HERE, "quality-map.json"), "utf8")) as Record<
    string,
    Record<string, string>
  >;
  const curation = JSON.parse(fs.readFileSync(path.join(HERE, "switch-curation.json"), "utf8")) as Curation;
  const physical = read("switch");
  const digital = read("switch-digital");

  // 1. cartouches rangées en dématérialisé : l'entrée change d'id, la jaquette suit
  let moved = 0;
  const keptDigital: Entry[] = [];
  for (const e of digital) {
    if (!curation.boxes[e.n] || physical.some((p) => p.n === e.n)) {
      keptDigital.push(e);
      continue;
    }
    const slug = e.id.slice("switch-digital-".length);
    let newSlug = slug;
    while (physical.some((p) => p.id === `switch-${newSlug}`)) newSlug += "-x";
    const from = path.join(COVERS_ROOT, "switch-digital", `${slug}.jpg`);
    const to = path.join(COVERS_ROOT, "switch", `${newSlug}.jpg`);
    if (fs.existsSync(from) && !fs.existsSync(to)) fs.renameSync(from, to);
    physical.push({ ...e, id: `switch-${newSlug}`, img: fs.existsSync(to) });
    moved++;
  }

  // 2. jeux en boîte que l'eShop ne connaît pas (pas de jaquette)
  let added = 0;
  for (const x of curation.extras) {
    const n = normalizeTitle(x.t);
    if (physical.some((p) => p.n === n)) continue;
    physical.push({ id: `switch-${n.replace(/\s+/g, "-").slice(0, 80)}`, t: x.t, n, r: ["Europe"], img: false, b: x.b });
    added++;
  }
  physical.sort((a, b) => a.t.localeCompare(b.t, "fr"));

  // 3. pastille boîte + tiers ; le catalogue physique eShop FR vaut « boîte FR »
  const extraBox = new Map(curation.extras.map((x) => [normalizeTitle(x.t), x.b]));
  const tier = (platformId: string, n: string): string | undefined =>
    quality[platformId]?.[n] ?? (platformId === "switch-digital" ? quality.switch?.[n] : undefined);
  const out = {
    switch: physical.map((e) => withFields(e, tier("switch", e.n), curation.boxes[e.n] ?? extraBox.get(e.n) ?? "fr")),
    "switch-digital": keptDigital.map((e) => withFields(e, tier("switch-digital", e.n), undefined)),
    switch2: read("switch2").map((e) => withFields(e, tier("switch2", e.n), undefined)),
  };
  for (const [platformId, entries] of Object.entries(out)) write(platformId, entries);

  const count = (es: Entry[], k: "q" | "b", v?: string) => es.filter((e) => (v ? e[k] === v : e[k])).length;
  return {
    moved,
    added,
    switch: out.switch.length,
    "switch-digital": out["switch-digital"].length,
    switchTiers: count(out.switch, "q") + count(out["switch-digital"], "q"),
    switch2Tiers: count(out.switch2, "q"),
    boxFr: count(out.switch, "b", "fr"),
    boxEu: count(out.switch, "b", "eu"),
    boxEtr: count(out.switch, "b", "etr"),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify({ ok: true, summary: curateSwitch() }, null, 2));
}
