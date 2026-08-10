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

/**
 * Une console eShop donne deux catalogues : les jeux sortis en boîte
 * (`physical_version_b`) et les exclusivités dématérialisées. Les séparer évite
 * de noyer une collection physique sous des milliers de titres qu'on ne peut pas
 * acheter d'occasion (demande de benglut).
 */
const SYSTEMS: { system: string; physical: string; digital: string }[] = [
  { system: "nintendoswitch", physical: "switch", digital: "switch-digital" },
  { system: "nintendoswitch2", physical: "switch2", digital: "switch2-digital" },
];

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
  // system_type est le seul champ filtrable fiable (les espaces cassent system_names_txt)
  const params = new URLSearchParams({
    q: "*",
    fq: `type:GAME AND system_type:${system}`,
    start: String(start),
    rows: String(rows),
    wt: "json",
    sort: "title asc",
  });
  const url = `https://search.nintendo-europe.com/fr/select?${params}`;
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

  for (const { system, physical, digital } of SYSTEMS) {
    const docs: Doc[] = [];
    let start = 0;
    let total = Infinity;
    while (start < total) {
      const page = await fetchPage(system, start, 200);
      total = page.total;
      docs.push(...page.docs);
      start += 200;
      if (start % 2000 === 0) console.error(`${system}: ${docs.length}/${total} fiches…`);
      if (!page.docs.length) break;
    }

    // L'eShop ne renseigne `physical_version_b` que sur certains systèmes (Switch
    // oui, Switch 2 non : 0 fiche sur 500, toutes locales confondues). Sans ce
    // signal, découper serait inventer : tout reste alors sur un seul catalogue.
    const splittable = docs.some((d) => d.physical_version_b);
    if (!splittable) console.error(`${system}: pas de drapeau physique, catalogue non découpé`);

    // dédup par titre normalisé, le premier gagne (tri alphabétique)
    const seen = new Set<string>();
    const byPlatform = new Map<string, CatalogEntry[]>(
      splittable
        ? [
            [physical, []],
            [digital, []],
          ]
        : [[physical, []]],
    );
    const tasks: { entry: CatalogEntry; platformId: string; url: string }[] = [];
    for (const d of docs) {
      if (!d.title) continue;
      const n = normalizeTitle(d.title);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      const platformId = !splittable || d.physical_version_b ? physical : digital;
      const entries = byPlatform.get(platformId)!;
      let slug = n.replace(/\s+/g, "-").slice(0, 80);
      while (entries.some((e) => e.id === `${platformId}-${slug}`)) slug += "-x";
      const q = QUALITY[platformId]?.[n] ?? QUALITY[physical]?.[n];
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
      if (url) tasks.push({ entry, platformId, url });
    }

    for (const platformId of byPlatform.keys())
      fs.mkdirSync(path.join(COVERS_ROOT, platformId), { recursive: true });

    let done = 0;
    await pool(tasks, 12, async ({ entry, platformId, url }) => {
      const slug = entry.id.slice(platformId.length + 1);
      const dest = path.join(COVERS_ROOT, platformId, `${slug}.jpg`);
      // les jaquettes du catalogue non découpé sont recyclées, pas re-téléchargées
      const legacy = path.join(COVERS_ROOT, physical, `${slug}.jpg`);
      if (!fs.existsSync(dest) && legacy !== dest && fs.existsSync(legacy)) fs.renameSync(legacy, dest);
      if (await download(url, dest)) entry.img = true;
      if (++done % 2000 === 0) console.error(`${system}: ${done}/${tasks.length} jaquettes…`);
    });

    for (const [platformId, entries] of byPlatform) {
      fs.writeFileSync(
        path.join(CATALOG_DIR, `${platformId}.json`),
        JSON.stringify(entries) + "\n",
        "utf8",
      );
      summary[platformId] = { entries: entries.length, covers: entries.filter((e) => e.img).length };
    }
  }

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
