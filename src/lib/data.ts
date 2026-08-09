import fs from "node:fs";
import path from "node:path";
import type { Game, Platform } from "./schema";

export {
  STATUS_LABELS,
  CONDITION_LABELS,
  COMPLETENESS_LABELS,
  POSSESSION,
  euro,
} from "./labels";

/**
 * Lecture (build-time) de l'export public filtré — data/public/.
 * L'interface est strictement en lecture seule : aucune écriture ici.
 */

export interface PublicInventoryItem {
  id: string;
  gameId: string;
  status: string;
  quantity: number;
  condition?: string;
  completeness?: string;
  purchasePrice: { amount: number; currency: string } | null;
  currentEstimate: { low: number; median: number; high: number; currency: string; source: string; observedAt: string } | null;
  verificationStatus: string;
  quantityNeedsReview: boolean;
  acquiredAt: string | null;
  orderId: string | null;
  updatedAt: string;
}

export interface PublicOrder {
  id: string;
  marketplace: string;
  status: string;
  itemCount: number;
  gameIds: string[];
  orderedAt: string;
  fulfilledAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  totalPaid: number | null;
}

export interface PublicStats {
  generatedAt: string;
  totalGames: number;
  ownedItems: number;
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
  needsReview: number;
  estimateTotal: number | null;
}

export interface ChangeLogPublicEntry {
  at: string;
  command: string;
  message: string;
}

export interface SearchDoc {
  id: string;
  t: string;
  n: string;
  a: string[];
  f: string | null;
  p: string;
  r?: string;
  q?: string | null;
}

export interface GameRow {
  game: Game;
  items: PublicInventoryItem[];
  platform: Platform | undefined;
  coverUrl: string | null;
}

/** Préfixe de chemin (GitHub Pages sert le site sous /game-vault). */
export const BASE_PATH = process.env.GITHUB_PAGES === "true" ? "/game-vault" : "";

/** URL de la jaquette si elle existe dans public/covers/, sinon null. */
export function coverUrl(gameId: string): string | null {
  const file = path.join(process.cwd(), "public", "covers", `${gameId}.jpg`);
  return fs.existsSync(file) ? `${BASE_PATH}/covers/${gameId}.jpg` : null;
}

const dataDir = path.join(process.cwd(), "data", "public");

function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8")) as T;
}

export function getGames(): Game[] {
  return readJson<Game[]>("games.json");
}
export function getInventory(): PublicInventoryItem[] {
  return readJson<PublicInventoryItem[]>("inventory.json");
}
export function getOrders(): PublicOrder[] {
  return readJson<PublicOrder[]>("orders.json");
}
export function getPlatforms(): Platform[] {
  return readJson<Platform[]>("platforms.json");
}
export function getStats(): PublicStats {
  return readJson<PublicStats>("stats.json");
}
export function getChangeLog(): ChangeLogPublicEntry[] {
  return readJson<ChangeLogPublicEntry[]>("change-log.json");
}
export function getSearchIndex(): SearchDoc[] {
  return readJson<SearchDoc[]>("search-index.json");
}

export function getQuotes(): Record<string, import("./schema").GameQuotes> {
  const file = path.join(dataDir, "quotes.json");
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, import("./schema").GameQuotes>) : {};
}

export function getGameRows(): GameRow[] {
  const games = getGames();
  const inventory = getInventory();
  const platforms = getPlatforms();
  const byGame = new Map<string, PublicInventoryItem[]>();
  for (const i of inventory) {
    const arr = byGame.get(i.gameId) ?? [];
    arr.push(i);
    byGame.set(i.gameId, arr);
  }
  return games
    .map((game) => ({
      game,
      items: byGame.get(game.id) ?? [],
      platform: platforms.find((p) => p.id === game.platformId),
      coverUrl: coverUrl(game.id),
    }))
    .sort((a, b) => a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr"));
}

