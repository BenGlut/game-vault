#!/usr/bin/env tsx
/**
 * Jaquette ORIGINALE de chaque jeu de la collection, par rapprochement avec le
 * catalogue (même matching 3 niveaux que la page Catalogue).
 *
 *   pnpm exec tsx scripts/covers/build-sources.ts
 *
 * Produit public/covers/sources.json : { gameId: { u, sq? } }. L'application
 * affiche l'original redimensionné et garde public/covers/<id>.jpg en repli.
 * Lancé par `pnpm deploy:cf` avant chaque build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEntryLinks, type CatalogEntryLite } from "../../src/lib/catalog-match";
import type { Game } from "../../src/lib/schema";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(ROOT, "../game-vault-data");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");

interface Entry extends CatalogEntryLite {
  u?: string;
  sq?: boolean;
}

const games = JSON.parse(fs.readFileSync(path.join(DATA_REPO, "data", "games.json"), "utf8")) as Game[];
const byPlatform = new Map<string, Entry[]>();
for (const file of fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith(".json"))) {
  byPlatform.set(file.replace(/\.json$/, ""), JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, file), "utf8")) as Entry[]);
}
const entries = new Map([...byPlatform.values()].flat().map((e) => [e.id, e]));

// entrée catalogue → jeu ; on inverse pour obtenir la source de chaque jeu
const links = buildEntryLinks(
  byPlatform,
  games.map((game) => ({ game, items: [] })),
);
const sources: Record<string, { u: string; sq?: true }> = {};
for (const [entryId, link] of Object.entries(links)) {
  const e = entries.get(entryId);
  if (!e?.u || sources[link.id]) continue;
  // une boîte physique prime sur l'icône carrée du catalogue dématérialisé
  sources[link.id] = e.sq ? { u: e.u, sq: true } : { u: e.u };
}
for (const [entryId, link] of Object.entries(links)) {
  const e = entries.get(entryId);
  if (e?.u && !e.sq && sources[link.id]?.sq) sources[link.id] = { u: e.u };
}

fs.writeFileSync(path.join(ROOT, "public", "covers", "sources.json"), JSON.stringify(sources) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, jeux: games.length, avecSource: Object.keys(sources).length }));
