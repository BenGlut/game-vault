import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  GamesFileSchema,
  InventoryFileSchema,
  OrdersFileSchema,
  PlatformsFileSchema,
  SellersFileSchema,
  ListingsFileSchema,
  PriceObservationsFileSchema,
  EvidenceFileSchema,
  ChangeLogFileSchema,
  PublishConfigSchema,
  type Game,
  type InventoryItem,
  type Order,
  type Platform,
  type Seller,
  type Listing,
  type PriceObservation,
  type Evidence,
  type ChangeLogEntry,
  type PublishConfig,
} from "../../../src/lib/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Repo privé : VAULT_DATA_DIR ou ../game-vault-data à côté du repo public. */
export function dataDir(): string {
  const dir = process.env.VAULT_DATA_DIR
    ? path.resolve(process.env.VAULT_DATA_DIR)
    : path.resolve(REPO_ROOT, "../game-vault-data");
  if (!fs.existsSync(path.join(dir, "data"))) {
    throw new Error(
      `Repo de données introuvable: ${dir} (définir VAULT_DATA_DIR ou cloner benglut/game-vault-data à côté du repo public)`,
    );
  }
  return dir;
}

export const DATA_FILES = {
  games: { file: "games.json", schema: GamesFileSchema },
  inventory: { file: "inventory.json", schema: InventoryFileSchema },
  orders: { file: "orders.json", schema: OrdersFileSchema },
  platforms: { file: "platforms.json", schema: PlatformsFileSchema },
  sellers: { file: "sellers.json", schema: SellersFileSchema },
  listings: { file: "listings.json", schema: ListingsFileSchema },
  priceObservations: { file: "price-observations.json", schema: PriceObservationsFileSchema },
  evidence: { file: "evidence.json", schema: EvidenceFileSchema },
  changeLog: { file: "change-log.json", schema: ChangeLogFileSchema },
} as const;

export interface Vault {
  games: Game[];
  inventory: InventoryItem[];
  orders: Order[];
  platforms: Platform[];
  sellers: Seller[];
  listings: Listing[];
  priceObservations: PriceObservation[];
  evidence: Evidence[];
  changeLog: ChangeLogEntry[];
  publishConfig: PublishConfig;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** Charge et valide TOUT le vault (échec = on n'écrit rien). */
export function loadVault(): Vault {
  const dir = path.join(dataDir(), "data");
  const out: Record<string, unknown> = {};
  for (const [key, { file, schema }] of Object.entries(DATA_FILES)) {
    const parsed = schema.safeParse(readJson(path.join(dir, file)));
    if (!parsed.success) {
      throw new Error(`Validation Zod échouée pour ${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    }
    out[key] = parsed.data;
  }
  const cfg = PublishConfigSchema.safeParse(readJson(path.join(dataDir(), "publish.config.json")));
  if (!cfg.success) throw new Error(`publish.config.json invalide: ${cfg.error.message}`);
  out.publishConfig = cfg.data;
  return out as unknown as Vault;
}

function atomicWrite(file: string, content: string): void {
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, content, "utf8");
  fs.renameSync(tmp, file); // rename = atomique sur le même volume (règle n°13)
}

/** Sauvegarde datée de tous les fichiers data avant mutation. */
export function backupVault(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dataDir(), "backups", stamp);
  fs.mkdirSync(dest, { recursive: true });
  const dir = path.join(dataDir(), "data");
  for (const { file } of Object.values(DATA_FILES)) {
    fs.copyFileSync(path.join(dir, file), path.join(dest, file));
  }
  return dest;
}

export interface FileDiff {
  file: string;
  added: string[];
  removed: string[];
  changed: string[];
}

function idsOf(rows: { id: string }[]): Map<string, string> {
  return new Map(rows.map((r) => [r.id, JSON.stringify(r)]));
}

/** Diff par id entre l'état disque et l'état muté (règle n°14 : afficher avant écriture). */
export function diffVault(before: Vault, after: Vault): FileDiff[] {
  const diffs: FileDiff[] = [];
  for (const key of Object.keys(DATA_FILES) as (keyof typeof DATA_FILES)[]) {
    const b = idsOf(before[key] as { id: string }[]);
    const a = idsOf(after[key] as { id: string }[]);
    const added = [...a.keys()].filter((id) => !b.has(id));
    const removed = [...b.keys()].filter((id) => !a.has(id));
    const changed = [...a.keys()].filter((id) => b.has(id) && b.get(id) !== a.get(id));
    if (added.length || removed.length || changed.length) {
      diffs.push({ file: DATA_FILES[key].file, added, removed, changed });
    }
  }
  return diffs;
}

/** Valide chaque collection mutée puis écrit atomiquement + changelog. */
export function writeVault(vault: Vault, entry: Omit<ChangeLogEntry, "id" | "at">): void {
  const dir = path.join(dataDir(), "data");
  // validation complète AVANT toute écriture (règle n°15)
  for (const [key, { schema }] of Object.entries(DATA_FILES)) {
    if (key === "changeLog") continue;
    const parsed = schema.safeParse(vault[key as keyof Vault]);
    if (!parsed.success) {
      throw new Error(`Refus d'écriture — ${key} invalide: ${parsed.error.issues[0]?.message}`);
    }
  }
  const fullEntry: ChangeLogEntry = {
    ...entry,
    id: `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    actor: entry.actor ?? "agent",
    affected: entry.affected ?? [],
  };
  vault.changeLog.push(fullEntry);
  for (const [key, { file }] of Object.entries(DATA_FILES)) {
    atomicWrite(path.join(dir, file), JSON.stringify(vault[key as keyof Vault], null, 2) + "\n");
  }
}

/** Intégrité référentielle au-delà de Zod. */
export function integrityIssues(v: Vault): string[] {
  const issues: string[] = [];
  const gameIds = new Set(v.games.map((g) => g.id));
  const platformIds = new Set(v.platforms.map((p) => p.id));
  const orderIds = new Set(v.orders.map((o) => o.id));
  const sellerIds = new Set(v.sellers.map((s) => s.id));

  const seenGameKey = new Map<string, string>();
  for (const g of v.games) {
    if (!platformIds.has(g.platformId)) issues.push(`${g.id}: plateforme inconnue ${g.platformId}`);
    const key = `${g.platformId}::${g.normalizedTitle}::${g.edition ?? ""}::${g.region}`;
    const dup = seenGameKey.get(key);
    if (dup) issues.push(`doublon de jeu: ${g.id} et ${dup} (${g.canonicalTitle})`);
    else seenGameKey.set(key, g.id);
  }
  for (const i of v.inventory) {
    if (!gameIds.has(i.gameId)) issues.push(`${i.id}: jeu inconnu ${i.gameId}`);
    if (i.orderId && !orderIds.has(i.orderId)) issues.push(`${i.id}: commande inconnue ${i.orderId}`);
    if (i.status === "cancelled" && i.quantity > 0 && !i.orderId)
      issues.push(`${i.id}: item annulé sans commande liée`);
  }
  for (const o of v.orders) {
    if (o.sellerId && !sellerIds.has(o.sellerId)) issues.push(`${o.id}: vendeur inconnu ${o.sellerId}`);
    for (const item of o.items) {
      if (!gameIds.has(item.gameId)) issues.push(`${o.id}: jeu inconnu ${item.gameId}`);
    }
    if (o.status === "received" && !o.receivedAt) issues.push(`${o.id}: received sans receivedAt`);
    if (o.status === "cancelled" && !o.cancelledAt) issues.push(`${o.id}: cancelled sans cancelledAt`);
  }
  for (const p of v.priceObservations) {
    if (!gameIds.has(p.gameId)) issues.push(`${p.id}: jeu inconnu ${p.gameId}`);
  }
  return issues;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// re-export pour les commandes
export { z };
