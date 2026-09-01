#!/usr/bin/env tsx
/**
 * Pose manuellement la jaquette d'un jeu depuis une URL.
 *
 * Sert aux titres qu'aucun dépôt automatique ne couvre : éditions physiques absentes
 * de l'eShop (compilations, éditions spéciales), consoles, jeux Switch 2, PlayStation 3
 * (le dépôt libretro n'a que 67 jaquettes PS3), et cas où l'illustration trouvée
 * automatiquement est la mauvaise — l'icône carrée de l'eShop au lieu de la boîte,
 * par exemple sur Final Fantasy IX.
 *
 * Usage : pnpm exec tsx scripts/covers/set-cover.ts <gameId> <url> [--force]
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import type { Game } from "../../src/lib/schema";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(ROOT, "../game-vault-data");
const COVERS = path.join(ROOT, "public", "covers");

async function main(): Promise<void> {
  const [gameId, url] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const force = process.argv.includes("--force");
  if (!gameId || !url) {
    console.error(JSON.stringify({ ok: false, error: "usage: set-cover <gameId> <url> [--force]" }));
    process.exit(1);
  }

  const games = JSON.parse(
    fs.readFileSync(path.join(DATA_REPO, "data", "games.json"), "utf8"),
  ) as Game[];
  const jeu = games.find((g) => g.id === gameId);
  if (!jeu) {
    console.error(JSON.stringify({ ok: false, error: `jeu inconnu : ${gameId}` }));
    process.exit(1);
  }

  const dest = path.join(COVERS, `${gameId}.jpg`);
  if (fs.existsSync(dest) && !force) {
    console.error(
      JSON.stringify({ ok: false, error: "jaquette déjà présente, --force pour remplacer" }),
    );
    process.exit(1);
  }

  fs.mkdirSync(COVERS, { recursive: true });
  const tmp = path.join(COVERS, `${gameId}.tmp`);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
    await execFileP("sips", [
      "-Z", "400", "-s", "format", "jpeg", "-s", "formatOptions", "78",
      tmp, "--out", dest,
    ]);
    if (!fs.existsSync(dest)) throw new Error("conversion sips échouée");
    const { size } = fs.statSync(dest);
    console.log(JSON.stringify({ ok: true, jeu: jeu.canonicalTitle, fichier: `${gameId}.jpg`, octets: size }));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }));
    process.exit(1);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

main();
