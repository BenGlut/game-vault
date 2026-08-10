#!/usr/bin/env tsx
/**
 * Complète les jaquettes de la collection à partir du catalogue déjà téléchargé.
 *
 * `fetch-covers.ts` interroge libretro (pas de Switch) ; ce script comble le reste
 * en copiant les images déjà présentes dans `public/catalog-covers/<plateforme>/`.
 * À lancer après tout `add-game`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";
import type { Game } from "../../src/lib/schema";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(ROOT, "../game-vault-data");

interface CatalogEntry {
  id: string;
  n: string;
  img: boolean;
}

function words(s: string): string[] {
  return s.split(" ").filter(Boolean);
}
function sortedKey(s: string): string {
  return [...words(s)].sort().join(" ");
}

function main(): void {
  const games = JSON.parse(
    fs.readFileSync(path.join(DATA_REPO, "data", "games.json"), "utf8"),
  ) as Game[];
  const catalogDir = path.join(ROOT, "public", "catalog");
  const coversDir = path.join(ROOT, "public", "covers");

  const copied: string[] = [];
  const missing: string[] = [];

  const byPlatform = new Map<string, CatalogEntry[]>();
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"))) {
    byPlatform.set(
      file.replace(/\.json$/, ""),
      JSON.parse(fs.readFileSync(path.join(catalogDir, file), "utf8")) as CatalogEntry[],
    );
  }

  for (const g of games) {
    const dest = path.join(coversDir, `${g.id}.jpg`);
    if (fs.existsSync(dest)) continue;
    const entries = byPlatform.get(g.platformId);
    if (!entries) {
      missing.push(`${g.canonicalTitle} (pas de catalogue ${g.platformId})`);
      continue;
    }
    const candidates = [g.normalizedTitle, ...g.aliases.map(normalizeTitle)];
    // exact, puis mots réordonnés, puis compact (apostrophes)
    let hit: CatalogEntry | undefined;
    for (const c of candidates) {
      hit =
        entries.find((e) => e.img && e.n === c) ??
        entries.find((e) => e.img && sortedKey(e.n) === sortedKey(c)) ??
        entries.find((e) => e.img && e.n.replace(/\s/g, "") === c.replace(/\s/g, ""));
      if (hit) break;
    }
    if (!hit) {
      missing.push(`${g.canonicalTitle} [${g.platformId}]`);
      continue;
    }
    const src = path.join(
      ROOT,
      "public",
      "catalog-covers",
      g.platformId,
      `${hit.id.slice(g.platformId.length + 1)}.jpg`,
    );
    if (!fs.existsSync(src)) {
      missing.push(`${g.canonicalTitle} (fichier catalogue absent)`);
      continue;
    }
    fs.copyFileSync(src, dest);
    copied.push(g.id);
  }

  console.log(JSON.stringify({ ok: true, copied: copied.length, missing }, null, 2));
}

main();
