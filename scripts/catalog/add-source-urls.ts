#!/usr/bin/env tsx
/**
 * Ajoute à chaque entrée du catalogue l'adresse de sa jaquette ORIGINALE (`u`),
 * sans toucher aux identifiants. Les copies locales (160 px) restent un repli ;
 * l'application affiche l'original redimensionné à la volée à la taille voulue.
 *
 *   pnpm exec tsx scripts/catalog/add-source-urls.ts
 *
 * - consoles libretro : thumbnails.libretro.com (PNG pleine résolution) ;
 * - Switch / Switch 2 : packshot de l'eShop européen (`image_url`), sinon l'image carrée.
 * Les entrées carrées (icône eShop, pas de boîte) portent `sq: true`.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");

const LIBRETRO: Record<string, string> = {
  "3ds": "Nintendo_-_Nintendo_3DS",
  ds: "Nintendo_-_Nintendo_DS",
  gba: "Nintendo_-_Game_Boy_Advance",
  n64: "Nintendo_-_Nintendo_64",
  gamecube: "Nintendo_-_GameCube",
  gb: "Nintendo_-_Game_Boy",
  gbc: "Nintendo_-_Game_Boy_Color",
};

const ESHOP: { system: string; physical: string; digital: string }[] = [
  { system: "nintendoswitch", physical: "switch", digital: "switch-digital" },
  { system: "nintendoswitch2", physical: "switch2", digital: "switch2-digital" },
];

interface Entry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
  u?: string;
  sq?: boolean;
}

/** Mêmes règles que fetch-catalog.ts : titre d'affichage puis score de région. */
function displayTitle(base: string): string {
  return base.replace(/^([^,-]+), (The|A|An|La|Le|Les|L'|Der|Die|Das|El|Los|Las|Il)( |$)/, "$2 $1$3");
}
function regionScore(name: string): number {
  if (name.includes("(France)")) return 5;
  if (name.includes("(Europe)")) return 4;
  if (name.includes("(World)")) return 3;
  if (name.includes("(USA)")) return 2;
  if (name.includes("(Japan)")) return 1;
  return 0;
}

function gh(pathname: string): { tree: { path: string; sha: string }[] } {
  return JSON.parse(execFileSync("gh", ["api", pathname], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }));
}

function readCatalog(platformId: string): Entry[] | null {
  const file = path.join(CATALOG_DIR, `${platformId}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Entry[]) : null;
}

function writeCatalog(platformId: string, entries: Entry[]): void {
  fs.writeFileSync(path.join(CATALOG_DIR, `${platformId}.json`), JSON.stringify(entries) + "\n", "utf8");
}

function libretro(platformId: string, repo: string): { total: number; withUrl: number } {
  const entries = readCatalog(platformId);
  if (!entries) return { total: 0, withUrl: 0 };
  const root = gh(`repos/libretro-thumbnails/${repo}/git/trees/master`);
  const boxarts = root.tree.find((t) => t.path === "Named_Boxarts");
  if (!boxarts) throw new Error(`Named_Boxarts introuvable dans ${repo}`);
  const files = gh(`repos/libretro-thumbnails/${repo}/git/trees/${boxarts.sha}`).tree.filter((t) => t.path.endsWith(".png"));

  const best = new Map<string, { raw: string; score: number }>();
  for (const f of files) {
    const base = f.path.replace(/\.png$/, "").split(" (")[0] ?? "";
    const norm = normalizeTitle(displayTitle(base));
    if (!norm) continue;
    const score = regionScore(f.path);
    const cur = best.get(norm);
    if (!cur || score > cur.score) best.set(norm, { raw: f.path, score });
  }
  const system = repo.replace(/_/g, " ");
  let withUrl = 0;
  for (const e of entries) {
    const hit = best.get(e.n);
    if (!hit) continue;
    e.u = `https://thumbnails.libretro.com/${encodeURIComponent(system)}/Named_Boxarts/${encodeURIComponent(hit.raw)}`;
    withUrl++;
  }
  writeCatalog(platformId, entries);
  return { total: entries.length, withUrl };
}

interface Doc {
  title?: string;
  image_url?: string | null;
  image_url_sq_s?: string | null;
}

async function eshop(system: string, platformIds: string[]): Promise<Record<string, { total: number; withUrl: number }>> {
  const docs: Doc[] = [];
  for (let start = 0, total = Infinity; start < total; start += 200) {
    const params = new URLSearchParams({
      q: "*",
      fq: `type:GAME AND system_type:${system}`,
      start: String(start),
      rows: "200",
      wt: "json",
      sort: "title asc",
    });
    const res = await fetch(`https://search.nintendo-europe.com/fr/select?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} (${system} @${start})`);
    const json = (await res.json()) as { response?: { docs?: Doc[]; numFound?: number } };
    total = json.response?.numFound ?? 0;
    docs.push(...(json.response?.docs ?? []));
    if (!json.response?.docs?.length) break;
  }
  const byNorm = new Map<string, { url: string; square: boolean }>();
  for (const d of docs) {
    if (!d.title) continue;
    const n = normalizeTitle(d.title);
    if (!n || byNorm.has(n)) continue;
    const raw = d.image_url ?? d.image_url_sq_s;
    if (!raw) continue;
    const url = raw.startsWith("//") ? `https:${raw}` : raw;
    byNorm.set(n, { url, square: /\/SQ_|11_square_images|\/1x1_/i.test(url) });
  }
  const out: Record<string, { total: number; withUrl: number }> = {};
  for (const platformId of platformIds) {
    const entries = readCatalog(platformId);
    if (!entries) continue;
    let withUrl = 0;
    for (const e of entries) {
      const hit = byNorm.get(e.n);
      if (!hit) continue;
      e.u = hit.url;
      if (hit.square) e.sq = true;
      else delete e.sq;
      withUrl++;
    }
    writeCatalog(platformId, entries);
    out[platformId] = { total: entries.length, withUrl };
  }
  return out;
}

async function main(): Promise<void> {
  const summary: Record<string, unknown> = {};
  for (const [platformId, repo] of Object.entries(LIBRETRO)) {
    summary[platformId] = libretro(platformId, repo);
    console.error(`${platformId} ok`);
  }
  for (const { system, physical, digital } of ESHOP) {
    Object.assign(summary, await eshop(system, [physical, digital]));
    console.error(`${system} ok`);
  }
  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
