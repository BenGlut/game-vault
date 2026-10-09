/**
 * Règles métier partagées par l'écran de gestion — mêmes conventions que le CLI.
 */
import type { Game, InventoryItem, InventoryStatus } from "@/lib/schema";
import { normalizeTitle } from "@/lib/normalize";

/** Premier id d'inventaire libre : inv_x, inv_x-2, inv_x-3… (cf. freeInventoryId du CLI). */
export function freeInventoryId(inventory: InventoryItem[], gameId: string): string {
  const base = gameId.replace(/^game_/, "inv_");
  const taken = new Set(inventory.map((i) => i.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function newInventoryLine(
  inventory: InventoryItem[],
  gameId: string,
  status: Extract<InventoryStatus, "wishlist" | "owned">,
): InventoryItem {
  const now = new Date().toISOString();
  return {
    id: freeInventoryId(inventory, gameId),
    gameId,
    status,
    quantity: status === "wishlist" ? 0 : 1,
    condition: "unknown",
    completeness: "unknown",
    purchasePrice: null,
    currentEstimate: null,
    verificationStatus: status === "owned" ? "verified" : "needs_review",
    quantityNeedsReview: false,
    evidenceIds: [],
    orderId: null,
    privateNotes: null,
    acquiredAt: status === "owned" ? now.slice(0, 10) : null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Statuts qui valent possession ou achat engagé (cf. ACQUIS dans src/lib/data.ts). */
const ACQUIRED = new Set(["owned", "ordered", "fulfilled", "delivered", "duplicate"]);

export type GameState = "owned" | "incoming" | "wanted" | "none";

export function gameState(items: InventoryItem[]): GameState {
  if (items.some((i) => ["owned", "delivered", "duplicate"].includes(i.status))) return "owned";
  if (items.some((i) => ["ordered", "fulfilled"].includes(i.status))) return "incoming";
  if (items.some((i) => i.status === "wishlist") && !items.some((i) => ACQUIRED.has(i.status))) return "wanted";
  return "none";
}

/** Recherche tolérante : chaque mot de la requête doit apparaître dans le titre ou un alias. */
export function matches(game: Game, query: string): boolean {
  const words = normalizeTitle(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = [game.normalizedTitle, ...game.aliases.map(normalizeTitle), normalizeTitle(game.franchise ?? "")].join(
    " ",
  );
  return words.every((w) => hay.includes(w));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
