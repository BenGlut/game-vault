#!/usr/bin/env tsx
/**
 * Catalogue des amiibo et compatibilité amiibo ↔ jeux, depuis AmiiboAPI
 * (https://amiiboapi.org, base communautaire : nom, série, image, sorties, et pour
 * chaque jeu Switch / Switch 2 / 3DS / Wii U ce que l'amiibo y débloque).
 *
 *   pnpm exec tsx scripts/catalog/fetch-amiibo.ts
 *
 * Produit :
 * - public/catalog/amiibo.json : une entrée de catalogue par amiibo (même forme que
 *   les autres consoles, plus `s` série, `ty` type, `d` sortie européenne) ;
 * - public/catalog/amiibo-compat.json : { games, usages, links } où links[idAmiibo]
 *   liste des paires [indexJeu, indexUsage] — les usages se répètent beaucoup, on
 *   les stocke une fois.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const SOURCE = "https://amiiboapi.org/api/amiibo/?showusage";

interface ApiUsage {
  Usage: string;
}
interface ApiGame {
  gameName: string;
  amiiboUsage?: ApiUsage[];
}
interface ApiAmiibo {
  amiiboSeries: string;
  character: string;
  gameSeries: string;
  head: string;
  tail: string;
  image: string;
  name: string;
  type: string;
  release: Record<string, string | null>;
  gamesSwitch?: ApiGame[];
  gamesSwitch2?: ApiGame[];
  games3DS?: ApiGame[];
  gamesWiiU?: ApiGame[];
}

const TYPES: Record<string, string> = { Figure: "Figurine", Card: "Carte", Yarn: "Laine", Band: "Bracelet", Block: "Bloc" };

async function main(): Promise<void> {
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`AmiiboAPI : HTTP ${res.status}`);
  const all = ((await res.json()) as { amiibo: ApiAmiibo[] }).amiibo;

  // un même personnage existe dans plusieurs séries : la série départage les homonymes
  const byName = new Map<string, number>();
  for (const a of all) byName.set(a.name, (byName.get(a.name) ?? 0) + 1);

  const games: { t: string; p: string }[] = [];
  const gameIndex = new Map<string, number>();
  const usages: string[] = [];
  const usageIndex = new Map<string, number>();
  const intern = <T>(map: Map<string, number>, list: T[], key: string, value: T): number => {
    let i = map.get(key);
    if (i === undefined) {
      i = list.length;
      list.push(value);
      map.set(key, i);
    }
    return i;
  };

  const entries = [];
  const links: Record<string, [number, number][]> = {};
  const seen = new Set<string>();
  for (const a of all) {
    const id = `amiibo-${a.head}${a.tail}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const t = (byName.get(a.name) ?? 0) > 1 ? `${a.name} (${a.amiiboSeries})` : a.name;
    entries.push({
      id,
      t,
      n: normalizeTitle(t),
      r: a.release.eu ? ["Europe"] : [],
      img: false,
      u: a.image,
      s: a.amiiboSeries,
      ty: TYPES[a.type] ?? a.type,
      ...(a.release.eu ? { d: a.release.eu } : {}),
    });
    const pairs: [number, number][] = [];
    for (const [p, list] of [
      ["switch2", a.gamesSwitch2],
      ["switch", a.gamesSwitch],
      ["3ds", a.games3DS],
      ["wiiu", a.gamesWiiU],
    ] as const) {
      for (const g of list ?? []) {
        const gi = intern(gameIndex, games, `${p}|${g.gameName}`, { t: g.gameName, p });
        const text = (g.amiiboUsage ?? []).map((u) => u.Usage).join(" / ") || "Compatible";
        pairs.push([gi, intern(usageIndex, usages, text, text)]);
      }
    }
    if (pairs.length) links[id] = pairs;
  }
  entries.sort((x, y) => x.t.localeCompare(y.t, "fr"));

  fs.writeFileSync(path.join(CATALOG_DIR, "amiibo.json"), JSON.stringify(entries) + "\n", "utf8");
  fs.writeFileSync(path.join(CATALOG_DIR, "amiibo-compat.json"), JSON.stringify({ games, usages, links }) + "\n", "utf8");
  console.log(JSON.stringify({ ok: true, amiibo: entries.length, jeux: games.length, usages: usages.length, avecJeux: Object.keys(links).length }));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
