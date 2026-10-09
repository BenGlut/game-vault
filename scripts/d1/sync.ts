/**
 * Synchronise le repo de données (data/*.json) et la base D1 « gamevault ».
 *
 *   pnpm d1 push [--local]   JSON → D1 (remplace tout le contenu de D1)
 *   pnpm d1 pull [--local]   D1 → JSON (sauvegarde, validation Zod, intégrité)
 *
 * Garde-fou : push refuse d'écraser D1 si la base contient des modifications
 * faites en ligne qui ne sont pas encore dans le change-log local (faire pull d'abord).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ChangeLogFileSchema } from "../../src/lib/schema";
import { CHANGE_LOG, COLLECTIONS } from "../../src/server/collections";
import { DATA_FILES, REPO_ROOT, backupVault, dataDir, integrityIssues, loadVault, type Vault } from "../vault/lib/store";

const DB_NAME = "gamevault";
const WRANGLER = path.join(REPO_ROOT, "node_modules", ".bin", "wrangler");

const [command, ...rest] = process.argv.slice(2);
const target = rest.includes("--local") ? "--local" : "--remote";

/** table D1 → clé du Vault (DATA_FILES) */
const TABLES: { table: string; key: keyof typeof DATA_FILES }[] = [
  ...Object.values(COLLECTIONS).map((def) => ({
    table: def.table,
    key: (Object.entries(DATA_FILES).find(([, f]) => f.file === def.file)?.[0] ?? "") as keyof typeof DATA_FILES,
  })),
  { table: CHANGE_LOG.table, key: "changeLog" },
];

function wrangler(args: string[]): string {
  const res = spawnSync(WRANGLER, ["d1", "execute", DB_NAME, target, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });
  if (res.status !== 0) throw new Error(`wrangler a échoué :\n${res.stderr || res.stdout}`);
  return res.stdout;
}

function query<T>(sql: string): T[] {
  const out = JSON.parse(wrangler(["--json", "--command", sql])) as { results: T[] }[];
  return out.flatMap((r) => r.results);
}

const sqlString = (s: string) => `'${s.replace(/'/g, "''")}'`;

function push(): void {
  const vault = loadVault();
  const issues = integrityIssues(vault);
  if (issues.length) throw new Error(`Intégrité locale en échec, push annulé :\n- ${issues.join("\n- ")}`);

  const localLog = new Set(vault.changeLog.map((e) => e.id));
  const remoteOnly = query<{ id: string }>(`SELECT id FROM ${CHANGE_LOG.table}`).filter((r) => !localLog.has(r.id));
  if (remoteOnly.length) {
    throw new Error(
      `D1 contient ${remoteOnly.length} modification(s) faite(s) en ligne absente(s) du repo local. Lancer « pnpm d1 pull » d'abord.`,
    );
  }

  const lines: string[] = [];
  for (const { table, key } of TABLES) {
    lines.push(`DELETE FROM ${table};`);
    for (const rec of vault[key] as { id: string }[]) {
      lines.push(`INSERT INTO ${table} (id, data) VALUES (${sqlString(rec.id)}, ${sqlString(JSON.stringify(rec))});`);
    }
  }
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "gamevault-d1-")), "push.sql");
  fs.writeFileSync(file, lines.join("\n") + "\n", "utf8");
  wrangler(["--yes", "--file", file]);
  fs.rmSync(path.dirname(file), { recursive: true, force: true });

  const counts = TABLES.map(({ table, key }) => `${table} ${(vault[key] as unknown[]).length}`).join(", ");
  console.log(`D1 (${target.slice(2)}) remplacée par le repo local : ${counts}`);
}

function pull(): void {
  const before = loadVault();
  const after = { ...before } as Vault;
  for (const { table, key } of TABLES) {
    const rows = query<{ data: string }>(`SELECT data FROM ${table} ORDER BY rowid`).map((r) => JSON.parse(r.data));
    const schema = key === "changeLog" ? ChangeLogFileSchema : DATA_FILES[key].schema;
    const parsed = schema.safeParse(rows);
    if (!parsed.success) throw new Error(`${table} invalide dans D1 : ${parsed.error.issues[0]?.message}`);
    (after as unknown as Record<string, unknown>)[key] = parsed.data;
  }
  const issues = integrityIssues(after);
  if (issues.length) throw new Error(`Intégrité D1 en échec, pull annulé :\n- ${issues.join("\n- ")}`);

  const changed = TABLES.filter(({ key }) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
  if (!changed.length) {
    console.log("Repo local déjà à jour avec D1.");
    return;
  }
  console.log(`Sauvegarde : ${backupVault()}`);
  const dir = path.join(dataDir(), "data");
  for (const { key } of changed) {
    fs.writeFileSync(path.join(dir, DATA_FILES[key].file), JSON.stringify(after[key], null, 2) + "\n", "utf8");
    console.log(`${DATA_FILES[key].file} mis à jour depuis D1`);
  }
}

if (command === "push") push();
else if (command === "pull") pull();
else {
  console.error("usage: pnpm d1 push|pull [--local]");
  process.exit(1);
}
