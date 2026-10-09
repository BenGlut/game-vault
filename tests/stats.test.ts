import { describe, it, expect } from "vitest";
import { quotesByGame } from "../src/lib/quotes";
import { computeStats, monthRange } from "../src/lib/stats";
import type { Game, InventoryItem, Order, PriceObservation } from "../src/lib/schema";

const game = (id: string, platformId = "ds", extra: Partial<Game> = {}): Game => ({
  id,
  kind: "game",
  canonicalTitle: id,
  normalizedTitle: id,
  aliases: [],
  franchise: null,
  platformId,
  region: "PAL-FR",
  languages: ["fr"],
  publisher: null,
  developer: null,
  releaseYear: null,
  genres: [],
  edition: null,
  playsOn: [],
  mediaType: "cartridge",
  externalIds: {},
  qualityTier: null,
  buyPriority: null,
  ...extra,
});

const item = (id: string, gameId: string, status: InventoryItem["status"], extra: Partial<InventoryItem> = {}): InventoryItem => ({
  id,
  gameId,
  status,
  quantity: status === "wishlist" ? 0 : 1,
  condition: "unknown",
  completeness: "CIB",
  purchasePrice: null,
  currentEstimate: null,
  verificationStatus: "verified",
  quantityNeedsReview: false,
  evidenceIds: [],
  orderId: null,
  privateNotes: null,
  acquiredAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...extra,
});

const price = (id: string, gameId: string, variant: PriceObservation["variant"], median: number, observedAt: string): PriceObservation => ({
  id,
  gameId,
  variant,
  low: median - 5,
  median,
  high: median + 5,
  currency: "EUR",
  source: "test",
  url: null,
  observedAt,
  notes: null,
});

const order = (id: string, status: Order["status"], orderedAt: string, totalPaid: number): Order => ({
  id,
  marketplace: "vinted",
  sellerId: null,
  reference: id,
  status,
  items: [{ gameId: "game_a", inventoryId: null, quantity: 1, unitPrice: totalPaid }],
  itemsTotal: totalPaid,
  shippingCost: 2,
  buyerProtection: 1,
  lotDiscount: null,
  totalPaid,
  currency: "EUR",
  orderedAt,
  fulfilledAt: null,
  deliveredAt: null,
  estimatedDeliveryAt: null,
  cancelledAt: null,
  refundedAt: null,
  listingIds: [],
  evidenceIds: [],
  privateNotes: null,
});

describe("quotesByGame", () => {
  it("prend la dernière observation de chaque variante, « any » seulement en repli", () => {
    const q = quotesByGame([
      price("price_1", "game_a", "cib", 20, "2026-08-01"),
      price("price_2", "game_a", "cib", 30, "2026-09-01"),
      price("price_3", "game_a", "any", 99, "2026-10-01"),
      price("price_4", "game_b", "any", 12, "2026-09-01"),
    ]);
    expect(q.get("game_a")?.cib?.median).toBe(30);
    expect(q.get("game_a")?.loose?.median).toBe(99);
    expect(q.get("game_b")?.cib?.median).toBe(12);
  });
});

describe("computeStats", () => {
  const stats = computeStats(
    {
      games: [game("game_a"), game("game_b", "3ds"), game("game_c"), game("game_hw", "ds", { kind: "hardware" })],
      inventory: [
        item("inv_a", "game_a", "owned", { acquiredAt: "2026-08-10", purchasePrice: { amount: 10, currency: "EUR" } }),
        item("inv_a-2", "game_a", "delivered", { acquiredAt: "2026-09-02", completeness: "loose" }),
        item("inv_b", "game_b", "ordered"),
        item("inv_c", "game_c", "wishlist"),
        item("inv_hw", "game_hw", "owned"),
      ],
      orders: [
        order("order_1", "delivered", "2026-08-05", 10),
        order("order_2", "fulfilled", "2026-09-20", 25),
        order("order_3", "cancelled", "2026-09-21", 99),
      ],
      platforms: [],
      quotes: quotesByGame([price("price_a", "game_a", "cib", 30, "2026-09-01"), price("price_al", "game_a", "loose", 12, "2026-09-01")]),
    },
    "2026-10-09",
  );

  it("compte les jeux possédés sans le matériel ni ce qui est en route", () => {
    expect(stats.ownedGames).toBe(1);
    expect(stats.ownedItems).toBe(2);
    expect(stats.ownedHardware).toBe(1);
    expect(stats.wishlist).toBe(1);
  });

  it("valorise chaque exemplaire à la cote de sa complétude", () => {
    expect(stats.collectionValue).toBe(42);
    expect(stats.costOfOwned).toBe(10);
    expect(stats.bestGains[0]?.gain).toBe(20);
  });

  it("ignore les commandes annulées dans les dépenses", () => {
    expect(stats.spentTotal).toBe(35);
    expect(stats.incomingOrders.map((o) => o.id)).toEqual(["order_2"]);
    expect(stats.incomingAmount).toBe(25);
  });

  it("produit une série mensuelle continue jusqu'au mois courant", () => {
    expect(stats.months.map((m) => m.month)).toEqual(["2026-08", "2026-09", "2026-10"]);
    expect(stats.months.map((m) => m.ownedTotal)).toEqual([1, 2, 2]);
    expect(stats.months.map((m) => m.spentTotal)).toEqual([10, 35, 35]);
    expect(stats.months.map((m) => m.valueTotal)).toEqual([30, 42, 42]);
  });
});

describe("monthRange", () => {
  it("franchit le changement d'année", () => {
    expect(monthRange("2025-11", "2026-02")).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
  });
});
