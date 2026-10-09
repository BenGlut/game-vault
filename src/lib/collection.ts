/**
 * Règles de possession — module pur, partagé par l'application et les tests.
 * Règle n°4 : commandé ≠ possédé ; une commande annulée ne donne jamais de stock.
 */

export interface StatusLike {
  status: string;
}

/** Exemplaire physiquement là. */
export const POSSESSION = ["owned", "delivered", "duplicate"];

/** Possédé ou en route : le besoin est couvert, le jeu n'est plus à acheter. */
const ACQUIRED = new Set(["owned", "ordered", "fulfilled", "delivered", "duplicate"]);

/** Lignes d'archive : historique seulement, ni possession ni acheminement. */
const ARCHIVE = new Set(["cancelled", "refunded", "sold", "wishlist"]);

export function isOwned(item: StatusLike): boolean {
  return POSSESSION.includes(item.status);
}

export function isIncoming(item: StatusLike): boolean {
  return item.status === "ordered" || item.status === "fulfilled";
}

/**
 * Encore à acheter : une ligne wishlist ET aucun exemplaire possédé ou en route.
 * Le jeu y revient dès que la commande tombe (annulée, remboursée).
 */
export function stillWanted(items: StatusLike[]): boolean {
  return items.some((i) => i.status === "wishlist") && !items.some((i) => ACQUIRED.has(i.status));
}

/** Le jeu a sa place dans la collection : au moins un exemplaire réel ou en route. */
export function inCollection(kind: string, items: StatusLike[]): boolean {
  return kind !== "hardware" && items.some((i) => !ARCHIVE.has(i.status));
}

export type GameState = "owned" | "incoming" | "wanted" | "none";

export function gameState(items: StatusLike[]): GameState {
  if (items.some(isOwned)) return "owned";
  if (items.some(isIncoming)) return "incoming";
  if (stillWanted(items)) return "wanted";
  return "none";
}

export const GAME_STATE_LABELS: Record<GameState, string> = {
  owned: "Possédé",
  incoming: "En route",
  wanted: "À acheter",
  none: "Catalogue",
};
