#!/usr/bin/env tsx
/**
 * Vraies jaquettes de boîte Switch (packshots) via l'API publique de l'eShop
 * européen — les icônes titledb sont carrées (menu console), pas des jaquettes.
 *
 * search.nintendo-europe.com renvoie `image_url` = packshot « PS_NSwitch_… »,
 * c'est-à-dire la boîte telle qu'elle est vendue, en version FR.
 * Repli sur l'image carrée si aucun packshot n'existe.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";
import type { Game } from "../../src/lib/schema";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(ROOT, "../game-vault-data");
const COVERS = path.join(ROOT, "public", "covers");

interface Doc {
  title?: string;
  image_url?: string;
  image_url_sq_s?: string;
}

async function search(q: string): Promise<Doc[]> {
  // system_type est le seul champ filtrable fiable (system_names_txt échoue avec les espaces)
  const params = new URLSearchParams({
    q,
    fq: "type:GAME AND system_type:nintendoswitch",
    rows: "8",
    wt: "json",
  });
  const url = `https://search.nintendo-europe.com/fr/select?${params}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { response?: { docs?: Doc[] } };
  return json.response?.docs ?? [];
}

/** Le packshot est préféré ; l'image carrée ne sert que de dernier recours. */
function pickImage(doc: Doc): string | undefined {
  const url = doc.image_url ?? doc.image_url_sq_s;
  if (!url) return undefined;
  return url.startsWith("//") ? `https:${url}` : url;
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const games = (
    JSON.parse(fs.readFileSync(path.join(DATA_REPO, "data", "games.json"), "utf8")) as Game[]
  ).filter((g) => g.platformId === "switch");

  const done: string[] = [];
  const missing: string[] = [];

  for (const g of games) {
    const dest = path.join(COVERS, `${g.id}.jpg`);
    if (fs.existsSync(dest) && !force) continue;

    let picked: string | undefined;
    for (const candidate of [g.canonicalTitle, ...g.aliases]) {
      const docs = await search(candidate);
      const target = normalizeTitle(candidate);
      const exact = docs.find((d) => d.title && normalizeTitle(d.title) === target);
      picked = pickImage(exact ?? docs[0] ?? {});
      if (picked) break;
    }
    if (!picked) {
      missing.push(g.canonicalTitle);
      continue;
    }

    const tmp = path.join(COVERS, `${g.id}.tmp`);
    try {
      const res = await fetch(picked);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
      await execFileP("sips", ["-Z", "400", "-s", "format", "jpeg", "-s", "formatOptions", "78", tmp, "--out", dest]);
      if (!fs.existsSync(dest)) throw new Error("conversion sips échouée");
      done.push(g.id);
    } catch (e) {
      missing.push(`${g.canonicalTitle} (${e instanceof Error ? e.message : e})`);
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  }

  console.log(JSON.stringify({ ok: true, packshots: done.length, missing }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
