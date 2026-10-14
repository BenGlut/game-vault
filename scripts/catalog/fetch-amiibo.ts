#!/usr/bin/env tsx
/**
 * Catalogue des amiibo et compatibilité amiibo ↔ jeux, depuis AmiiboAPI
 * (https://amiiboapi.org, base communautaire : nom, série, image, sorties, et pour
 * chaque jeu Switch / Switch 2 / 3DS / Wii U ce que l'amiibo y débloque), complété
 * par la curation versionnée scripts/catalog/amiibo-extras.json (noms français
 * officiels, libellés de série, amiibo annoncés qu'AmiiboAPI n'a pas encore).
 *
 *   pnpm exec tsx scripts/catalog/fetch-amiibo.ts            # catalogue + images manquantes
 *   pnpm exec tsx scripts/catalog/fetch-amiibo.ts --no-covers
 *   pnpm exec tsx scripts/catalog/fetch-amiibo.ts --refresh-curated   # après un changement d'image dans la curation
 *
 * Produit :
 * - public/catalog/amiibo.json : une entrée de catalogue par amiibo (même forme que
 *   les autres consoles, plus `s` série, `ty` type, `d` sortie européenne ou annoncée,
 *   `a` anciens titres / titres anglais normalisés, pour la recherche et le
 *   rapprochement avec la base) ;
 * - public/catalog/amiibo-compat.json : { games, usages, links } où links[idAmiibo]
 *   liste des paires [indexJeu, indexUsage] — les usages se répètent beaucoup, on
 *   les stocke une fois ;
 * - public/catalog-covers/amiibo/<id>.jpg : copie locale de chaque image (400 px,
 *   figurine posée sur un fond clair uni, carte aplatie) servie par GitHub Pages
 *   comme les jaquettes des autres consoles. Une image déjà présente n'est pas
 *   retéléchargée : supprimer le fichier pour la régénérer.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { normalizeTitle } from "../../src/lib/normalize";
import { displayTitles, type AmiiboCatalogEntry } from "../../src/lib/amiibo";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG_DIR = path.join(ROOT, "public", "catalog");
const COVERS_DIR = path.join(ROOT, "public", "catalog-covers", "amiibo");
const EXTRAS = path.join(ROOT, "scripts", "catalog", "amiibo-extras.json");
const SOURCE = "https://amiiboapi.org/api/amiibo/?showusage";
/** même hôte que les jaquettes des autres consoles (cf. COVERS_BASE de CatalogView) */
const COVERS_URL = "https://benglut.github.io/game-vault/catalog-covers/amiibo";

/** Fond uni des figurines (gris très clair, lisible en thème clair comme sombre). */
const TILE = { hex: "0xf3f4f6", r: 243, g: 244, b: 246 };
const SIZE = 400;
const FIGURE_BOX = 368; // marge autour de la figurine

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

interface ExtraAmiibo {
  slug: string;
  name: string;
  nameEn: string;
  series: string;
  type: string;
  release?: string;
  note?: string;
  image?: string;
  source: string;
  games: { t: string; p: string; usage: string }[];
}
interface Extras {
  names: Record<string, string>;
  series: Record<string, string>;
  /** image de remplacement quand celle d'AmiiboAPI est défectueuse (fond opaque…) ; key : couleur de fond à retirer */
  images: Record<string, { url?: string; key?: string; why: string }>;
  add: ExtraAmiibo[];
}

const TYPES: Record<string, string> = { Figure: "Figurine", Card: "Carte", Yarn: "Laine", Band: "Bracelet", Block: "Bloc" };

interface Draft {
  id: string;
  /** nom affiché avant désambiguïsation */
  name: string;
  /** anciens titres (anglais) : alias de recherche et de rapprochement */
  legacy: string[];
  series: string;
  type: string;
  release?: string;
  europe: boolean;
  image?: string;
  /** couleur de fond à rendre transparente */
  key?: string;
  note?: string;
}

async function download(url: string): Promise<Buffer> {
  let last: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      last = e;
    }
  }
  throw new Error(`${url} : ${String(last)}`);
}

/** Transparence réelle : PNG RGBA / gris+alpha, PNG à palette avec tRNS, ou WebP. */
function hasAlpha(buf: Buffer): boolean {
  if (buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    const colorType = buf[25];
    if (colorType === 6 || colorType === 4) return true;
    return colorType === 3 && buf.includes(Buffer.from("tRNS"));
  }
  return buf.subarray(8, 12).toString() === "WEBP";
}

/**
 * Copie locale : la figurine est aplatie sur le fond uni ; une photo opaque (studio
 * nintendo.com sur blanc, ou fond coloré signalé par `key`) voit d'abord ce fond rendu
 * transparent. La figurine est centrée dans un carré ; une carte est seulement aplatie
 * et réduite. Le blanc éventuel de la figurine devient le gris très clair du fond :
 * différence invisible à cette taille.
 */
async function makeCover(src: Buffer, dest: string, opts: { card: boolean; key?: string }): Promise<void> {
  const tmp = `${dest}.src`;
  fs.writeFileSync(tmp, src);
  const box = opts.card ? SIZE : FIGURE_BOX;
  const key = opts.key ?? (opts.card || hasAlpha(src) ? null : "0xFFFFFF");
  const filters = [
    "format=rgba",
    ...(key ? [`colorkey=${key}:${key === "0xFFFFFF" ? 0.06 : 0.12}:0.04`] : []),
    `scale=${box}:${box}:force_original_aspect_ratio=decrease:flags=lanczos`,
    `geq=r='(r(X,Y)*alpha(X,Y)+${TILE.r}*(255-alpha(X,Y)))/255':g='(g(X,Y)*alpha(X,Y)+${TILE.g}*(255-alpha(X,Y)))/255':b='(b(X,Y)*alpha(X,Y)+${TILE.b}*(255-alpha(X,Y)))/255':a=255`,
    ...(opts.card ? [] : [`pad=${SIZE}:${SIZE}:(ow-iw)/2:(oh-ih)/2:color=${TILE.hex}`]),
    "format=yuvj420p",
  ];
  try {
    await execFileP("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", tmp, "-vf", filters.join(","), "-frames:v", "1", "-q:v", "5", dest]);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  if (!fs.existsSync(dest)) throw new Error(`conversion ffmpeg échouée : ${dest}`);
}


async function main(): Promise<void> {
  const withCovers = !process.argv.includes("--no-covers");
  const extras = JSON.parse(fs.readFileSync(EXTRAS, "utf8")) as Extras;
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`AmiiboAPI : HTTP ${res.status}`);
  const all = ((await res.json()) as { amiibo: ApiAmiibo[] }).amiibo;

  // ancien titre (anglais, série entre parenthèses pour les homonymes) : la base et
  // les liens existants s'y réfèrent encore
  const byEnName = new Map<string, number>();
  for (const a of all) byEnName.set(a.name, (byEnName.get(a.name) ?? 0) + 1);

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

  const drafts: Draft[] = [];
  const links: Record<string, [number, number][]> = {};
  const seen = new Set<string>();
  const seriesLabel = (s: string) => extras.series[s] ?? s;
  for (const a of all) {
    const id = `amiibo-${a.head}${a.tail}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const legacy = (byEnName.get(a.name) ?? 0) > 1 ? `${a.name} (${a.amiiboSeries})` : a.name;
    const release = a.release.eu ?? a.release.na ?? a.release.jp ?? a.release.au ?? undefined;
    drafts.push({
      id,
      name: extras.names[id] ?? a.name,
      // pas le nom anglais seul d'un homonyme : « Mario » désignerait deux amiibo
      legacy: [legacy],
      series: seriesLabel(a.amiiboSeries),
      type: TYPES[a.type] ?? a.type,
      release: release ?? undefined,
      europe: !!a.release.eu,
      image: extras.images[id]?.url ?? a.image,
      key: extras.images[id]?.key,
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

  // noms de curation qui ne correspondent plus à rien : AmiiboAPI a changé d'id
  const staleNames = [...Object.keys(extras.names), ...Object.keys(extras.images)].filter((id) => !seen.has(id));

  // ajouts manuels : un amiibo qu'AmiiboAPI publie entre-temps doit sortir de la curation
  const apiKeys = new Set(all.map((a) => `${normalizeTitle(a.name)}|${normalizeTitle(a.amiiboSeries)}`));
  const nowInApi: string[] = [];
  for (const x of extras.add) {
    const id = `amiibo-x-${x.slug}`;
    if (apiKeys.has(`${normalizeTitle(x.nameEn)}|${normalizeTitle(x.series)}`)) nowInApi.push(x.slug);
    drafts.push({
      id,
      name: x.name,
      legacy: [x.nameEn],
      series: seriesLabel(x.series),
      type: x.type,
      release: x.release,
      europe: true,
      image: x.image,
      note: x.note,
    });
    links[id] = x.games.map((g) => [intern(gameIndex, games, `${g.p}|${g.t}`, { t: g.t, p: g.p }), intern(usageIndex, usages, g.usage, g.usage)]);
  }

  // copies locales des images
  let made = 0;
  const failed: string[] = [];
  if (withCovers) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
    // --refresh-curated : régénère les images que la curation remplace ou ajoute
    const refresh = new Set(process.argv.includes("--refresh-curated") ? [...Object.keys(extras.images), ...extras.add.map((x) => `amiibo-x-${x.slug}`)] : []);
    const queue = drafts.filter((d) => d.image && (refresh.has(d.id) || !fs.existsSync(path.join(COVERS_DIR, `${d.id.slice("amiibo-".length)}.jpg`))));
    const worker = async () => {
      for (let d = queue.shift(); d; d = queue.shift()) {
        try {
          await makeCover(await download(d.image!), path.join(COVERS_DIR, `${d.id.slice("amiibo-".length)}.jpg`), {
            card: d.type === "Carte",
            key: d.key,
          });
          made++;
        } catch (e) {
          failed.push(`${d.id} : ${String(e)}`);
        }
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
  }

  const titles = displayTitles(drafts);
  const entries: AmiiboCatalogEntry[] = drafts.map((d) => {
    const t = titles.get(d.id)!;
    const n = normalizeTitle(t);
    const local = fs.existsSync(path.join(COVERS_DIR, `${d.id.slice("amiibo-".length)}.jpg`));
    const aliases = [...new Set(d.legacy.map(normalizeTitle))].filter((x) => x && x !== n);
    return {
      id: d.id,
      t,
      n,
      r: d.europe ? ["Europe"] : [],
      img: local,
      // la copie locale fait référence : plus de dépendance à l'hébergeur d'origine
      ...(local ? { u: `${COVERS_URL}/${d.id.slice("amiibo-".length)}.jpg` } : d.image ? { u: d.image } : {}),
      s: d.series,
      ty: d.type,
      ...(d.release ? { d: d.release } : {}),
      ...(aliases.length ? { a: aliases } : {}),
      ...(d.note ? { note: d.note } : {}),
    };
  });
  entries.sort((x, y) => x.t.localeCompare(y.t, "fr"));

  fs.writeFileSync(path.join(CATALOG_DIR, "amiibo.json"), JSON.stringify(entries) + "\n", "utf8");
  fs.writeFileSync(path.join(CATALOG_DIR, "amiibo-compat.json"), JSON.stringify({ games, usages, links }) + "\n", "utf8");
  const types: Record<string, number> = {};
  for (const e of entries) types[e.ty] = (types[e.ty] ?? 0) + 1;
  console.log(
    JSON.stringify({
      ok: failed.length === 0,
      amiibo: entries.length,
      types,
      ajouts: extras.add.length,
      nomsFr: Object.keys(extras.names).filter((id) => seen.has(id)).length,
      imagesRemplacees: Object.keys(extras.images).filter((id) => seen.has(id)).length,
      jeux: games.length,
      usages: usages.length,
      avecJeux: Object.keys(links).length,
      imagesLocales: entries.filter((e) => e.img).length,
      imagesCreees: made,
      ...(failed.length ? { echecs: failed } : {}),
      ...(staleNames.length ? { nomsSansAmiibo: staleNames } : {}),
      ...(nowInApi.length ? { ajoutsDesormaisDansAmiiboAPI: nowInApi } : {}),
    }),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
