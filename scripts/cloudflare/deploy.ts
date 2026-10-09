/**
 * Build + déploiement Cloudflare Pages (projet « gamevault », site privé).
 *
 *   pnpm deploy:cf
 *
 * Les 35 000 jaquettes du catalogue dépassent le plafond de 20 000 fichiers par
 * déploiement : le build les référence sur GitHub Pages et elles sont mises de
 * côté pendant l'envoi, puis remises en place.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { REPO_ROOT } from "../vault/lib/store";

const COVERS_ORIGIN = "https://benglut.github.io/game-vault";
const bin = (name: string) => path.join(REPO_ROOT, "node_modules", ".bin", name);

function run(cmd: string, args: string[], env: Record<string, string> = {}): void {
  const res = spawnSync(cmd, args, { cwd: REPO_ROOT, stdio: "inherit", env: { ...process.env, ...env } });
  if (res.status !== 0) throw new Error(`${path.basename(cmd)} ${args[0]} a échoué (code ${res.status})`);
}

run(bin("next"), ["build"], { CATALOG_COVERS_BASE: COVERS_ORIGIN });

const covers = path.join(REPO_ROOT, "out", "catalog-covers");
const parked = path.join(REPO_ROOT, ".catalog-covers-parked");
const hasCovers = fs.existsSync(covers);
if (hasCovers) fs.renameSync(covers, parked);
try {
  run(bin("wrangler"), ["pages", "deploy", "out", "--project-name", "gamevault", "--branch", "main", "--commit-dirty=true"]);
} finally {
  if (hasCovers) fs.renameSync(parked, covers);
}
