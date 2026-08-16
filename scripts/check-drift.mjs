#!/usr/bin/env node
/**
 * Drift checker — échoue quand une doc affirme quelque chose que le code/les données
 * contredisent. Branché sur le hook pre-commit (.githooks/pre-commit).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

// 1. version : CHANGELOG top == package.json (exacte) OU package.json == patch suivant (worklog en cours)
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const changelog = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const topVersion = changelog.match(/^## v(\d+\.\d+\.\d+)/m)?.[1];
if (!topVersion) {
  errors.push("CHANGELOG.md : aucune entrée '## vX.Y.Z' trouvée");
} else {
  const [ma, mi, pa] = topVersion.split(".").map(Number);
  const nextPatch = `${ma}.${mi}.${pa + 1}`;
  if (pkg.version !== topVersion && pkg.version !== nextPatch) {
    errors.push(`version drift : package.json=${pkg.version}, CHANGELOG=${topVersion} (attendu ${topVersion} ou ${nextPatch})`);
  }
}

// 2. chemins cités dans les docs → doivent exister
const docFiles = ["README.md", "CLAUDE.md", "AGENTS.md", ...fs.readdirSync(path.join(ROOT, "docs")).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`)];
const pathRe = /(?:`|\()((?:src|scripts|docs|data|public|\.agents|\.github|\.claude)\/[A-Za-z0-9_\-./[\]]+?)(?:`|\))/g;
for (const doc of docFiles) {
  const content = fs.readFileSync(path.join(ROOT, doc), "utf8");
  for (const m of content.matchAll(pathRe)) {
    const p = m[1].replace(/\/$/, "");
    if (!fs.existsSync(path.join(ROOT, p))) errors.push(`${doc} : chemin cité introuvable — ${p}`);
  }
}

// 3. cohérence de l'export public
const pub = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "data/public", name), "utf8"));
try {
  const games = pub("games.json");
  const index = pub("search-index.json");
  const stats = pub("stats.json");
  if (games.length !== index.length) errors.push(`export : games (${games.length}) ≠ search-index (${index.length})`);
  // le materiel partage la table des jeux mais n'est pas compte comme un jeu
  const jeux = games.filter((g) => g.kind !== "hardware");
  if (stats.totalGames !== jeux.length)
    errors.push(`export : stats.totalGames (${stats.totalGames}) ≠ jeux hors matériel (${jeux.length})`);
  const materiel = games.length - jeux.length;
  if ((stats.totalHardware ?? 0) !== materiel)
    errors.push(`export : stats.totalHardware (${stats.totalHardware ?? 0}) ≠ entrées matériel (${materiel})`);
  // 4. clés interdites dans l'export public
  for (const f of ["inventory.json", "orders.json", "games.json"]) {
    const raw = fs.readFileSync(path.join(ROOT, "data/public", f), "utf8");
    for (const forbidden of ["privateNotes", "sellerId", "\"reference\""]) {
      if (raw.includes(forbidden)) errors.push(`export ${f} : clé interdite présente — ${forbidden}`);
    }
  }
} catch (e) {
  errors.push(`export public illisible : ${e.message}`);
}

// 5. toute commande d'une place de marché porte sa référence de transaction.
// Sans elle, la réconciliation retombe sur vendeur + date + montant, et une
// commande peut rester invisible des semaines (cas jerome80250, 2026-08-13).
// Le dépôt privé n'est pas toujours là (sessions cloud) : on ne vérifie que s'il existe.
const ORDERS_PRIVE = path.join(ROOT, "..", "game-vault-data", "data", "orders.json");
if (fs.existsSync(ORDERS_PRIVE)) {
  try {
    const sansRef = JSON.parse(fs.readFileSync(ORDERS_PRIVE, "utf8")).filter(
      (o) => o.marketplace && !o.reference,
    );
    for (const o of sansRef) {
      errors.push(`commande ${o.id} (${o.marketplace}, ${o.orderedAt}) : référence de transaction absente`);
    }
  } catch (e) {
    errors.push(`orders.json privé illisible : ${e.message}`);
  }
}

if (errors.length) {
  console.error("✗ check-drift : " + errors.length + " problème(s)\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log("✓ check-drift OK (version, chemins docs, export public)");
