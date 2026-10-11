/**
 * Création d'une commande, partagée par la CLI (`pnpm vault add-order`) et par
 * l'API (`POST /api/add-order`, utilisée par le serveur MCP) : mêmes règles,
 * donc mêmes identifiants et même bascule wishlist → commandé.
 */
import { normalizeTitle } from "./normalize";
import type { InventoryItem, Marketplace, Order, Seller } from "./schema";

/**
 * Référence de transaction fabriquée pour les achats sans identifiant fourni
 * (remise en main propre, vente de particulier hors plateforme). Horodatage en
 * base 36 + suffixe aléatoire : unique, trié chronologiquement, non devinable.
 * Ex. `LBC-msxt6x24-4f71`.
 */
const CODES_MARKETPLACE: Record<string, string> = {
  vinted: "VNT",
  leboncoin: "LBC",
  ebay: "EBY",
  amazon: "AMZ",
};

export function referenceSynthetique(marketplace: string): string {
  const code = CODES_MARKETPLACE[marketplace] ?? marketplace.slice(0, 3).toUpperCase();
  const horodatage = Date.now().toString(36);
  const alea = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  return `${code}-${horodatage}-${alea}`;
}

/**
 * Premier id d'inventaire libre pour un jeu : inv_x, inv_x-2, inv_x-3… Compter
 * les exemplaires ne suffit pas : `luigi-s-mansion` + `-2` tombait sur l'id déjà
 * pris par `luigi-s-mansion-2` (doublons corrigés le 2026-10-09).
 */
export function freeInventoryId(taken: Set<string>, gameId: string): string {
  const base = gameId.replace(/^game_/, "inv_");
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function sellerIdFor(name: string): string {
  return `seller_${normalizeTitle(name).replace(/\s+/g, "-")}`;
}

export interface AddOrderInput {
  marketplace: Marketplace;
  items: { gameId: string; unitPrice: number | null }[];
  seller?: string | null;
  reference?: string | null;
  total?: number | null;
  shipping?: number | null;
  protection?: number | null;
  discount?: number | null;
  date?: string | null;
  eta?: string | null;
  notes?: string | null;
}

export interface AddOrderState {
  /** Ligne wishlist existante par jeu (au plus une est consommée par article). */
  wishlist: InventoryItem[];
  /** Tous les identifiants d'inventaire déjà pris. */
  takenInventoryIds: Set<string>;
  /** Vendeur déjà connu pour ce nom et cette place de marché. */
  existingSeller: Seller | null;
}

export interface AddOrderPlan {
  order: Order;
  /** Lignes wishlist basculées en « commandé ». */
  updatedInventory: InventoryItem[];
  /** Lignes créées pour les jeux absents de la wishlist. */
  newInventory: InventoryItem[];
  newSeller: Seller | null;
}

export function planAddOrder(input: AddOrderInput, state: AddOrderState, now = new Date()): AddOrderPlan {
  const nowIso = now.toISOString();
  const orderId = `order_${now.getTime().toString(36)}`;
  const taken = new Set(state.takenInventoryIds);
  const wishlist = [...state.wishlist];
  const updatedInventory: InventoryItem[] = [];
  const newInventory: InventoryItem[] = [];

  const items = input.items.map((it) => {
    const idx = wishlist.findIndex((x) => x.gameId === it.gameId && x.status === "wishlist");
    if (idx >= 0) {
      const line = { ...wishlist.splice(idx, 1)[0]!, status: "ordered" as const, orderId, updatedAt: nowIso };
      updatedInventory.push(line);
      return { gameId: it.gameId, unitPrice: it.unitPrice, quantity: 1, inventoryId: line.id };
    }
    const id = freeInventoryId(taken, it.gameId);
    taken.add(id);
    newInventory.push({
      id,
      gameId: it.gameId,
      status: "ordered",
      quantity: 1,
      condition: "unknown",
      completeness: "unknown",
      purchasePrice: it.unitPrice !== null ? { amount: it.unitPrice, currency: "EUR" } : null,
      currentEstimate: null,
      verificationStatus: "needs_review",
      quantityNeedsReview: false,
      evidenceIds: [],
      orderId,
      privateNotes: null,
      acquiredAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    return { gameId: it.gameId, unitPrice: it.unitPrice, quantity: 1, inventoryId: id };
  });

  let sellerId: string | null = null;
  let newSeller: Seller | null = null;
  if (input.seller) {
    if (state.existingSeller) sellerId = state.existingSeller.id;
    else {
      sellerId = sellerIdFor(input.seller);
      newSeller = {
        id: sellerId,
        name: input.seller,
        marketplace: input.marketplace,
        profileUrl: null,
        rating: null,
        privateNotes: null,
      };
    }
  }

  const order: Order = {
    id: orderId,
    marketplace: input.marketplace,
    sellerId,
    // Toute commande de place de marché doit porter une référence : sans elle
    // la réconciliation retombe sur vendeur + date + montant et la commande peut
    // rester invisible des semaines (cas jerome80250, 2026-08-13).
    reference: input.reference ?? referenceSynthetique(input.marketplace),
    status: "ordered",
    items,
    itemsTotal: items.every((i) => i.unitPrice !== null) ? items.reduce((s, i) => s + (i.unitPrice ?? 0), 0) : null,
    shippingCost: input.shipping ?? null,
    buyerProtection: input.protection ?? null,
    lotDiscount: input.discount ?? null,
    totalPaid: input.total ?? null,
    currency: "EUR",
    orderedAt: input.date ?? nowIso.slice(0, 10),
    fulfilledAt: null,
    deliveredAt: null,
    estimatedDeliveryAt: input.eta ?? null,
    cancelledAt: null,
    refundedAt: null,
    listingIds: [],
    evidenceIds: [],
    privateNotes: input.notes ?? null,
  };

  return { order, updatedInventory, newInventory, newSeller };
}
