#!/usr/bin/env tsx
/**
 * Catalogue Nintendo Switch — libretro ne couvre pas la Switch, on combine :
 *  - nswdb.com (base des CARTOUCHES physiques : titre, région, langues, titleid)
 *  - titledb (icônes officielles via titleid, téléchargées en local, 160px JPEG)
 *
 * Produit public/catalog/switch.json + public/catalog-covers/switch/<slug>.jpg
 * — même format que fetch-catalog.ts, reprise auto sur relance.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const COVERS_DIR = path.join(ROOT, "public", "catalog-covers", "switch");

const REGION_MAP: Record<string, string[]> = {
  WLD: ["World"],
  EUR: ["Europe"],
  USA: ["USA"],
  JPN: ["Japan"],
  FRA: ["France"],
  GER: ["Germany"],
  ITA: ["Italy"],
  SPA: ["Spain"],
  KOR: ["Korea"],
  CHN: ["China"],
  ASA: ["Asia"],
  AUS: ["Australia"],
  UKV: ["Europe"],
  HOL: ["Netherlands"],
  CAN: ["Canada"],
};

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m?.[1]?.trim() ?? "";
}

interface CatalogEntry {
  id: string;
  t: string;
  n: string;
  r: string[];
  img: boolean;
  q?: string;
}

async function main(): Promise<void> {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  console.error("téléchargement nswdb…");
  const xml = await (await fetch("https://nswdb.com/xml.php", { redirect: "follow" })).text();
  const releases = [...xml.matchAll(/<release>([\s\S]*?)<\/release>/g)].map((m) => m[1]!);
  console.error(`${releases.length} releases nswdb`);

  const iconByTitleId = new Map<string, string>();
  const iconByName = new Map<string, string>();
  for (const region of ["FR.fr", "US.en", "GB.en", "JP.ja", "DE.de", "ES.es", "IT.it", "AU.en", "KR.ko", "HK.zh", "RU.ru", "NL.nl"]) {
    console.error(`téléchargement titledb ${region}…`);
    try {
      const raw = await (
        await fetch(`https://raw.githubusercontent.com/blawar/titledb/master/${region}.json`)
      ).text();
      const db = JSON.parse(raw) as Record<string, { id?: string; name?: string; iconUrl?: string }>;
      for (const v of Object.values(db)) {
        if (!v?.iconUrl) continue;
        if (v.id && !iconByTitleId.has(v.id.toUpperCase())) iconByTitleId.set(v.id.toUpperCase(), v.iconUrl);
        if (v.name) {
          const n = normalizeTitle(v.name);
          if (n && !iconByName.has(n)) iconByName.set(n, v.iconUrl);
        }
      }
    } catch (e) {
      console.error(`titledb ${region} indisponible: ${e}`);
    }
  }
  console.error(`${iconByTitleId.size} icônes titledb indexées (${iconByName.size} par nom)`);

  // dédup par titre normalisé, agrégation des régions, premier titleid avec icône
  const byNorm = new Map<string, { title: string; regions: Set<string>; titleIds: string[] }>();
  for (const rel of releases) {
    const name = tag(rel, "name")
      .replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    if (!name) continue;
    const norm = normalizeTitle(name);
    if (!norm) continue;
    const regions = REGION_MAP[tag(rel, "region")] ?? [];
    const titleId = tag(rel, "titleid").toUpperCase();
    const existing = byNorm.get(norm);
    if (!existing) {
      byNorm.set(norm, { title: name, regions: new Set(regions), titleIds: titleId ? [titleId] : [] });
    } else {
      for (const r of regions) existing.regions.add(r);
      if (titleId) existing.titleIds.push(titleId);
    }
  }

  const QUALITY_MAP = JSON.parse(
    fs.readFileSync(path.join(__dirname, "quality-map.json"), "utf8"),
  ) as Record<string, Record<string, string>>;

  const entries: CatalogEntry[] = [];
  const seen = new Set<string>();
  const tasks: { entry: CatalogEntry; iconUrl: string }[] = [];
  for (const [norm, v] of byNorm) {
    let slug = norm.replace(/\s+/g, "-").slice(0, 80);
    while (seen.has(slug)) slug += "-x";
    seen.add(slug);
    const q = QUALITY_MAP["switch"]?.[norm];
    const entry: CatalogEntry = {
      id: `switch-${slug}`,
      t: v.title,
      n: norm,
      r: [...v.regions].sort(),
      img: false,
      ...(q ? { q } : {}),
    };
    entries.push(entry);
    const iconUrl = v.titleIds.map((id) => iconByTitleId.get(id)).find(Boolean) ?? iconByName.get(norm);
    if (iconUrl) tasks.push({ entry, iconUrl });
  }
  entries.sort((a, b) => a.t.localeCompare(b.t, "fr"));
  console.error(`${entries.length} jeux Switch, ${tasks.length} avec icône`);

  let done = 0;
  let failed = 0;
  let i = 0;
  const workers = Array.from({ length: 12 }, async () => {
    while (i < tasks.length) {
      const { entry, iconUrl } = tasks[i++]!;
      const slug = entry.id.slice("switch-".length);
      const finalJpg = path.join(COVERS_DIR, `${slug}.jpg`);
      if (fs.existsSync(finalJpg)) {
        entry.img = true;
        done++;
        continue;
      }
      const tmp = path.join(COVERS_DIR, `${slug}.tmp`);
      try {
        const res = await fetch(iconUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
        await execFileP("sips", ["-Z", "160", "-s", "format", "jpeg", "-s", "formatOptions", "72", tmp, "--out", finalJpg]);
        entry.img = true;
      } catch {
        failed++;
      } finally {
        fs.rmSync(tmp, { force: true });
      }
      done++;
      if (done % 500 === 0) console.error(`switch: ${done}/${tasks.length}…`);
    }
  });
  await Promise.all(workers);

  fs.writeFileSync(path.join(CATALOG_DIR, "switch.json"), JSON.stringify(entries) + "\n", "utf8");
  console.log(
    JSON.stringify(
      { ok: true, entries: entries.length, covers: entries.filter((e) => e.img).length, failed },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
