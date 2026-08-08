#!/usr/bin/env tsx
/**
 * Récupère les jaquettes (boxarts) depuis libretro-thumbnails et les installe
 * dans public/covers/<gameId>.png.
 *
 * Matching : titre normalisé + alias (FR/EN), préférence région France > Europe > World > USA.
 * Aucune jaquette incertaine : seuls les matchs exacts (titre normalisé) sont retenus.
 * Rapport JSON en sortie avec la liste des jeux sans jaquette.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";
import type { Game } from "../../src/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(ROOT, "../game-vault-data");
const OUT_DIR = path.join(ROOT, "public", "covers");

const REPOS: Record<string, string> = {
  "3ds": "Nintendo_-_Nintendo_3DS",
  ds: "Nintendo_-_Nintendo_DS",
  gba: "Nintendo_-_Game_Boy_Advance",
  n64: "Nintendo_-_Nintendo_64",
  gamecube: "Nintendo_-_GameCube",
  gb: "Nintendo_-_Game_Boy",
  gbc: "Nintendo_-_Game_Boy_Color",
  // switch : pas de repo libretro — icônes via titledb (voir scripts/catalog/fetch-switch.ts)
};

interface RemoteEntry {
  raw: string; // "Pokemon - Moon (Europe) (En,Fr,...).png"
  base: string; // "pokemon moon"
  regionScore: number;
}

function regionScore(name: string): number {
  if (name.includes("(France)")) return 4;
  if (name.includes("(Europe)")) return 3;
  if (name.includes("(World)")) return 2;
  if (name.includes("(USA)")) return 1;
  return 0;
}

function listBoxarts(repo: string): RemoteEntry[] {
  const tree = JSON.parse(
    execFileSync("gh", ["api", `repos/libretro-thumbnails/${repo}/git/trees/master`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }),
  ) as { tree: { path: string; sha: string }[] };
  const boxarts = tree.tree.find((t) => t.path === "Named_Boxarts");
  if (!boxarts) throw new Error(`Named_Boxarts introuvable dans ${repo}`);
  const sub = JSON.parse(
    execFileSync("gh", ["api", `repos/libretro-thumbnails/${repo}/git/trees/${boxarts.sha}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    }),
  ) as { tree: { path: string }[] };
  return sub.tree
    .filter((t) => t.path.endsWith(".png"))
    .map((t) => {
      const noExt = t.path.replace(/\.png$/, "");
      const baseName = noExt.split(" (")[0] ?? noExt;
      return { raw: t.path, base: normalizeTitle(baseName), regionScore: regionScore(noExt) };
    });
}

function words(s: string): string[] {
  return s.split(" ").filter(Boolean);
}

function sortedKey(s: string): string {
  return [...words(s)].sort().join(" ");
}

/**
 * Matching en 3 niveaux :
 * 1. égalité exacte du titre normalisé
 * 2. mêmes mots dans un ordre différent (inversion d'article No-Intro : "Zelda, The …")
 * 3. mots du candidat ⊆ mots de la jaquette (sous-titres No-Intro), le moins de mots en trop gagne
 */
function pickMatch(candidates: string[], entries: RemoteEntry[]): RemoteEntry | null {
  for (const cand of candidates) {
    let best: RemoteEntry | null = null;
    for (const e of entries) {
      if (e.base === cand && (!best || e.regionScore > best.regionScore)) best = e;
    }
    if (best) return best;
  }
  for (const cand of candidates) {
    const key = sortedKey(cand);
    let best: RemoteEntry | null = null;
    for (const e of entries) {
      if (sortedKey(e.base) === key && (!best || e.regionScore > best.regionScore)) best = e;
    }
    if (best) return best;
  }
  for (const cand of candidates) {
    const cw = new Set(words(cand));
    if (cw.size === 0) continue;
    let best: { e: RemoteEntry; extra: number } | null = null;
    for (const e of entries) {
      const ew = words(e.base);
      if (![...cw].every((w) => ew.includes(w))) continue;
      const extra = ew.filter((w) => !cw.has(w)).length;
      if (extra > 6) continue;
      if (!best || extra < best.extra || (extra === best.extra && e.regionScore > best.e.regionScore)) {
        best = { e, extra };
      }
    }
    if (best) return best.e;
  }
  return null;
}

async function download(repo: string, remoteName: string, dest: string): Promise<void> {
  // GitHub raw, puis CDN libretro (certains fichiers GitHub sont des pointeurs LFS)
  const urls = [
    `https://raw.githubusercontent.com/libretro-thumbnails/${repo}/master/Named_Boxarts/${encodeURIComponent(remoteName)}`,
    `http://thumbnails.libretro.com/${encodeURIComponent(repo.replace(/_/g, " "))}/Named_Boxarts/${encodeURIComponent(remoteName)}`,
  ];
  let lastErr: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function main(): Promise<void> {
  const games = JSON.parse(
    fs.readFileSync(path.join(DATA_REPO, "data", "games.json"), "utf8"),
  ) as Game[];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const matched: string[] = [];
  const missing: { id: string; title: string }[] = [];
  const skipped: string[] = [];

  for (const [platformId, repo] of Object.entries(REPOS)) {
    const entries = listBoxarts(repo);
    const platformGames = games.filter((g) => g.platformId === platformId);
    for (const g of platformGames) {
      const dest = path.join(OUT_DIR, `${g.id}.png`);
      const finalJpg = path.join(OUT_DIR, `${g.id}.jpg`);
      if (fs.existsSync(finalJpg) && !process.argv.includes("--force")) {
        skipped.push(g.id);
        continue;
      }
      const candidates = [g.canonicalTitle, ...g.aliases].map(normalizeTitle);
      const match = pickMatch(candidates, entries);
      if (!match) {
        missing.push({ id: g.id, title: g.canonicalTitle });
        continue;
      }
      try {
        await download(repo, match.raw, dest);
        // réduction + conversion JPEG (macOS sips) — ~60 Ko par jaquette
        try {
          execSync(`sips -Z 400 "${dest}" >/dev/null 2>&1`);
          execSync(`sips -s format jpeg -s formatOptions 78 "${dest}" --out "${finalJpg}" >/dev/null 2>&1`);
          fs.rmSync(dest);
        } catch {
          /* sips indisponible : on garde le PNG original */
        }
        matched.push(g.id);
      } catch (e) {
        missing.push({ id: g.id, title: `${g.canonicalTitle} (échec: ${e instanceof Error ? e.message : e})` });
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        matched: matched.length,
        skipped: skipped.length,
        missing: missing.length,
        missingList: missing,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
