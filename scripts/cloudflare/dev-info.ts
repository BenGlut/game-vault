#!/usr/bin/env tsx
/**
 * Fiche technique du projet, figée à chaque déploiement : versions, code, tests,
 * données, poids du build et consommation Cloudflare. Lue par la page « </> Dev ».
 *
 *   pnpm exec tsx scripts/cloudflare/dev-info.ts [dossier de sortie, défaut out/]
 *
 * Lancé par `pnpm deploy:cf` juste après le build (les tailles du bundle sont
 * alors connues). Aucune donnée personnelle : seulement des comptes et des tailles.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { REPO_ROOT, dataDir } from "../vault/lib/store";

const outDir = path.resolve(REPO_ROOT, process.argv[2] ?? "out");
const bin = (name: string) => path.join(REPO_ROOT, "node_modules", ".bin", name);

function sh(cmd: string, args: string[], cwd = REPO_ROOT): string {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch {
    return "";
  }
}

function walk(dir: string, filter: (f: string) => boolean = () => true): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const size = (files: string[]) => files.reduce((s, f) => s + fs.statSync(f).size, 0);
const lines = (files: string[]) => files.reduce((s, f) => s + fs.readFileSync(f, "utf8").split("\n").length, 0);

function installed(pkg: string): string | null {
  const file = path.join(REPO_ROOT, "node_modules", pkg, "package.json");
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as { version: string }).version : null;
}

const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
};

// code, par zone
const CODE_AREAS: [string, string][] = [
  ["Pages (src/app)", "src/app"],
  ["Composants (src/components)", "src/components"],
  ["Règles et calculs (src/lib)", "src/lib"],
  ["Cœur de l'API (src/server)", "src/server"],
  ["API Cloudflare (functions)", "functions"],
  ["CLI et scripts (scripts)", "scripts"],
  ["Tests unitaires (tests)", "tests"],
  ["Tests e2e (e2e)", "e2e"],
];
const isCode = (f: string) => /\.(tsx?|mjs|css|sql)$/.test(f);
const code = CODE_AREAS.map(([label, dir]) => {
  const files = walk(path.join(REPO_ROOT, dir), isCode);
  return { label, dir, files: files.length, lines: lines(files), bytes: size(files) };
});

const testCount = (dir: string, re: RegExp) =>
  walk(path.join(REPO_ROOT, dir), (f) => /\.(test|spec)\.ts$/.test(f)).reduce((s, f) => s + (fs.readFileSync(f, "utf8").match(re)?.length ?? 0), 0);

// données privées : tailles et nombres d'enregistrements (pas leur contenu)
let data: { file: string; records: number; bytes: number }[] = [];
let dataCommits = 0;
let backups = 0;
try {
  const dir = path.join(dataDir(), "data");
  data = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      return { file, records: Array.isArray(parsed) ? parsed.length : 1, bytes: Buffer.byteLength(raw) };
    });
  dataCommits = Number(sh("git", ["rev-list", "--count", "HEAD"], dataDir())) || 0;
  const b = path.join(dataDir(), "backups");
  backups = fs.existsSync(b) ? fs.readdirSync(b).length : 0;
} catch {
  data = [];
}

// ressources statiques
const catalogDir = path.join(REPO_ROOT, "public", "catalog");
const catalog = fs.existsSync(catalogDir)
  ? fs
      .readdirSync(catalogDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const entries = JSON.parse(fs.readFileSync(path.join(catalogDir, f), "utf8")) as { u?: string }[];
        return {
          platform: f.replace(/\.json$/, ""),
          entries: entries.length,
          withSource: entries.filter((e) => e.u).length,
          bytes: fs.statSync(path.join(catalogDir, f)).size,
        };
      })
  : [];
const covers = walk(path.join(REPO_ROOT, "public", "covers"), (f) => f.endsWith(".jpg"));
const catalogCovers = walk(path.join(REPO_ROOT, "public", "catalog-covers"), (f) => f.endsWith(".jpg"));
const sourcesFile = path.join(REPO_ROOT, "public", "covers", "sources.json");
const coverSources = fs.existsSync(sourcesFile) ? Object.keys(JSON.parse(fs.readFileSync(sourcesFile, "utf8"))).length : 0;

// build
const outFiles = walk(outDir).filter((f) => !f.includes(`${path.sep}catalog-covers${path.sep}`));
const jsFiles = outFiles.filter((f) => f.endsWith(".js"));
const cssFiles = outFiles.filter((f) => f.endsWith(".css"));

// Cloudflare (consommation réelle, via wrangler)
const d1Raw = sh(bin("wrangler"), ["d1", "info", "gamevault", "--json"]);
const deploymentsRaw = sh(bin("wrangler"), ["pages", "deployment", "list", "--project-name", "gamevault", "--json"]);
let deployments = 0;
try {
  deployments = (JSON.parse(deploymentsRaw) as unknown[]).length;
} catch {
  deployments = 0;
}

const info = {
  generatedAt: new Date().toISOString(),
  version: pkg.version,
  git: {
    commit: sh("git", ["rev-parse", "--short", "HEAD"]),
    branch: sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
    commits: Number(sh("git", ["rev-list", "--count", "HEAD"])) || 0,
    lastCommitAt: sh("git", ["log", "-1", "--format=%cI"]),
    dataCommits,
  },
  runtime: {
    node: process.version.replace(/^v/, ""),
    pnpm: sh("pnpm", ["--version"]),
  },
  packages: Object.fromEntries(
    [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)].map((name) => [name, installed(name) ?? pkg.dependencies[name] ?? pkg.devDependencies[name]]),
  ),
  scripts: pkg.scripts,
  code,
  tests: { unit: testCount("tests", /\bit\(/g), e2e: testCount("e2e", /\btest\(/g) },
  data,
  backups,
  catalog,
  assets: {
    covers: { files: covers.length, bytes: size(covers), withHiResSource: coverSources },
    catalogCovers: { files: catalogCovers.length, bytes: size(catalogCovers) },
  },
  build: {
    files: outFiles.length,
    bytes: size(outFiles),
    js: { files: jsFiles.length, bytes: size(jsFiles) },
    css: { files: cssFiles.length, bytes: size(cssFiles) },
    pages: outFiles.filter((f) => f.endsWith("index.html")).length,
  },
  cloudflare: {
    d1: d1Raw ? (JSON.parse(d1Raw) as Record<string, unknown>) : null,
    pagesDeployments: deployments,
  },
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "dev-info.json"), JSON.stringify(info, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, fichier: path.relative(REPO_ROOT, path.join(outDir, "dev-info.json")) }));
