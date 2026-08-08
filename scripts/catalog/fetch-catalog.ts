#!/usr/bin/env tsx
/**
 * Catalogue de référence complet DS + 3DS (listes No-Intro via libretro-thumbnails).
 *
 * Produit :
 *  - public/catalog/<plateforme>.json          — entrées dédupliquées {id, t, r[], img}
 *  - public/catalog-covers/<plateforme>/<slug>.jpg — TOUTES les jaquettes (160px)
 *
 * Le catalogue sert à la RECHERCHE (page /catalogue) ; il est distinct de la
 * collection (games.json) — règle n°10 : on n'ajoute jamais un jeu à la collection
 * depuis le catalogue sans décision explicite.
 *
 * Reprise sur erreur : les images déjà présentes sont sautées (relancer suffit).
 */
import fs from "node:fs";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const COVERS_DIR = path.join(ROOT, "public", "catalog-covers");

const REPOS: Record<string, string> = {
  "3ds": "Nintendo_-_Nintendo_3DS",
  ds: "Nintendo_-_Nintendo_DS",
  gba: "Nintendo_-_Game_Boy_Advance",
};

const REGION_TAGS = [
  "France", "Europe", "World", "USA", "Japan", "Germany", "Spain", "Italy",
  "Netherlands", "Australia", "Canada", "Korea", "China", "Asia", "Scandinavia",
] as const;

function regionScore(name: string): number {
  if (name.includes("(France)")) return 5;
  if (name.includes("(Europe)")) return 4;
  if (name.includes("(World)")) return 3;
  if (name.includes("(USA)")) return 2;
  if (name.includes("(Japan)")) return 1;
  return 0;
}

function regionsOf(name: string): string[] {
  const found = new Set<string>();
  for (const m of name.matchAll(/\(([^)]+)\)/g)) {
    for (const part of m[1]!.split(",").map((s) => s.trim())) {
      if ((REGION_TAGS as readonly string[]).includes(part)) found.add(part);
    }
  }
  return [...found];
}

interface CatalogEntry {
  id: string; // <plateforme>-<slug>
  t: string; // titre d'affichage (No-Intro, articles remis en tête)
  n: string; // titre normalisé (recherche)
  r: string[]; // régions connues
  img: boolean;
}

/** "Legend of Zelda, The - Phantom Hourglass" → "The Legend of Zelda - Phantom Hourglass" */
function displayTitle(base: string): string {
  return base.replace(/^([^,-]+), (The|A|An|La|Le|Les|L'|Der|Die|Das|El|Los|Las|Il)( |$)/, "$2 $1$3");
}

function listBoxarts(repo: string): { raw: string; base: string }[] {
  const tree = JSON.parse(
    execFileSync("gh", ["api", `repos/libretro-thumbnails/${repo}/git/trees/master`], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    }),
  ) as { tree: { path: string; sha: string }[] };
  const boxarts = tree.tree.find((t) => t.path === "Named_Boxarts");
  if (!boxarts) throw new Error(`Named_Boxarts introuvable dans ${repo}`);
  const sub = JSON.parse(
    execFileSync("gh", ["api", `repos/libretro-thumbnails/${repo}/git/trees/${boxarts.sha}`], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    }),
  ) as { tree: { path: string }[] };
  return sub.tree
    .filter((t) => t.path.endsWith(".png"))
    .map((t) => ({ raw: t.path, base: t.path.replace(/\.png$/, "").split(" (")[0] ?? "" }));
}

async function downloadCover(repo: string, remoteName: string, platformId: string, slug: string): Promise<boolean> {
  const dir = path.join(COVERS_DIR, platformId);
  fs.mkdirSync(dir, { recursive: true });
  const finalJpg = path.join(dir, `${slug}.jpg`);
  if (fs.existsSync(finalJpg)) return true;
  const tmpPng = path.join(dir, `${slug}.tmp.png`);
  try {
    const url = `https://raw.githubusercontent.com/libretro-thumbnails/${repo}/master/Named_Boxarts/${encodeURIComponent(remoteName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(tmpPng, Buffer.from(await res.arrayBuffer()));
    await execFileP("sips", ["-Z", "160", "-s", "format", "jpeg", "-s", "formatOptions", "72", tmpPng, "--out", finalJpg]);
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(tmpPng, { force: true });
  }
}

/** Pool de téléchargements concurrents. */
async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const item = items[i++]!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

async function main(): Promise<void> {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  const summary: Record<string, { entries: number; covers: number; failed: number }> = {};

  for (const [platformId, repo] of Object.entries(REPOS)) {
    const files = listBoxarts(repo);
    // dédup par titre normalisé — garde le meilleur fichier (région préférée) et agrège les régions
    const byNorm = new Map<string, { best: { raw: string; score: number }; title: string; regions: Set<string> }>();
    for (const f of files) {
      const disp = displayTitle(f.base);
      const norm = normalizeTitle(disp);
      if (!norm) continue;
      const score = regionScore(f.raw);
      const existing = byNorm.get(norm);
      if (!existing) {
        byNorm.set(norm, { best: { raw: f.raw, score }, title: disp, regions: new Set(regionsOf(f.raw)) });
      } else {
        for (const r of regionsOf(f.raw)) existing.regions.add(r);
        if (score > existing.best.score) {
          existing.best = { raw: f.raw, score };
          existing.title = disp;
        }
      }
    }

    const entries: CatalogEntry[] = [];
    const seen = new Set<string>();
    for (const [norm, v] of byNorm) {
      let slug = norm.replace(/\s+/g, "-").slice(0, 80);
      while (seen.has(slug)) slug += "-x";
      seen.add(slug);
      entries.push({ id: `${platformId}-${slug}`, t: v.title, n: norm, r: [...v.regions].sort(), img: false });
    }
    entries.sort((a, b) => a.t.localeCompare(b.t, "fr"));

    // téléchargement de TOUTES les jaquettes (concurrence 12, reprise auto)
    let done = 0;
    let failed = 0;
    const tasks = entries.map((e) => ({ e, raw: byNorm.get(e.n)!.best.raw }));
    await pool(tasks, 12, async ({ e, raw }) => {
      const ok = await downloadCover(repo, raw, platformId, e.id.slice(platformId.length + 1));
      if (ok) e.img = true;
      else failed++;
      done++;
      if (done % 500 === 0) console.error(`${platformId}: ${done}/${entries.length}…`);
    });

    fs.writeFileSync(
      path.join(CATALOG_DIR, `${platformId}.json`),
      JSON.stringify(entries) + "\n",
      "utf8",
    );
    summary[platformId] = { entries: entries.length, covers: entries.filter((e) => e.img).length, failed };
  }

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
