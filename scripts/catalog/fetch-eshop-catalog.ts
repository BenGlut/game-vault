#!/usr/bin/env tsx
/**
 * Catalogue Switch / Switch 2 depuis l'API publique de l'eShop européen (FR).
 *
 * Avantage sur nswdb : titres officiels français, éditeur, date de sortie, et
 * surtout le **packshot** (vraie jaquette de boîte) plutôt que l'icône carrée
 * du menu console. Les images sont converties en 160px JPEG et stockées en local.
 *
 * Reprise sur relance : les jaquettes déjà présentes sont sautées.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const COVERS_ROOT = path.join(ROOT, "public", "catalog-covers");

const SYSTEMS: Record<string, string> = {
  switch: "Nintendo Switch",
  switch2: "Nintendo Switch 2",
};

interface Doc {
  title?: string;
  image_url?: string;
  image_url_sq_s?: string;
  publisher?: string;
  date_from?: string;
  system_names_txt?: string[];
  physical_version_b?: boolean;
}

interface CatalogEntry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
}

async function fetchPage(system: string, start: number, rows: number): Promise<{ docs: Doc[]; total: number }> {
  const url =
    `https://search.nintendo-europe.com/fr/select?q=*&fq=type:GAME AND system_names_txt:"${system}"` +
    `&start=${start}&rows=${rows}&wt=json&sort=title asc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} (${system} @${start})`);
  const json = (await res.json()) as { response?: { docs?: Doc[]; numFound?: number } };
  return { docs: json.response?.docs ?? [], total: json.response?.numFound ?? 0 };
}

async function download(url: string, dest: string): Promise<boolean> {
  if (fs.existsSync(dest)) return true;
  const tmp = `${dest}.tmp`;
  try {
    const full = url.startsWith("//") ? `https:${url}` : url;
    const res = await fetch(full);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
    await execFileP("sips", ["-Z", "160", "-s", "format", "jpeg", "-s", "formatOptions", "72", tmp, "--out", dest]);
    return fs.existsSync(dest);
  } catch {
    return false;
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) await fn(items[i++]!);
    }),
  );
}

async function main(): Promise<void> {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  const QUALITY = JSON.parse(
    fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "quality-map.json"), "utf8"),
  ) as Record<string, Record<string, string>>;
  const summary: Record<string, unknown> = {};

  for (const [platformId, systemName] of Object.entries(SYSTEMS)) {
    const coversDir = path.join(COVERS_ROOT, platformId);
    fs.mkdirSync(coversDir, { recursive: true });

    const docs: Doc[] = [];
    let start = 0;
    let total = Infinity;
    while (start < total) {
      const page = await fetchPage(systemName, start, 200);
      total = page.total;
      docs.push(...page.docs);
      start += 200;
      if (start % 2000 === 0) console.error(`${platformId}: ${docs.length}/${total} fiches…`);
      if (!page.docs.length) break;
    }

    // dédup par titre normalisé, le premier gagne (tri alphabétique)
    const seen = new Set<string>();
    const entries: CatalogEntry[] = [];
    const tasks: { entry: CatalogEntry; url: string }[] = [];
    for (const d of docs) {
      if (!d.title) continue;
      const n = normalizeTitle(d.title);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      let slug = n.replace(/\s+/g, "-").slice(0, 80);
      while (entries.some((e) => e.id === `${platformId}-${slug}`)) slug += "-x";
      const q = QUALITY[platformId]?.[n];
      const entry: CatalogEntry = {
        id: `${platformId}-${slug}`,
        t: d.title,
        n,
        r: ["Europe"],
        img: false,
        ...(q ? { q } : {}),
      };
      entries.push(entry);
      const url = d.image_url ?? d.image_url_sq_s;
      if (url) tasks.push({ entry, url });
    }

    let done = 0;
    await pool(tasks, 12, async ({ entry, url }) => {
      const slug = entry.id.slice(platformId.length + 1);
      if (await download(url, path.join(coversDir, `${slug}.jpg`))) entry.img = true;
      if (++done % 1000 === 0) console.error(`${platformId}: ${done}/${tasks.length} jaquettes…`);
    });

    fs.writeFileSync(path.join(CATALOG_DIR, `${platformId}.json`), JSON.stringify(entries) + "\n", "utf8");
    summary[platformId] = { entries: entries.length, covers: entries.filter((e) => e.img).length };
  }

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
