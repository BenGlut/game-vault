import { describe, it, expect } from "vitest";
import {
  GameSchema,
  InventoryItemSchema,
  OrderSchema,
  PublishConfigSchema,
  POSSESSION_STATUSES,
} from "../src/lib/schema";

const validGame = {
  id: "game_3ds_pokemon-lune",
  canonicalTitle: "Pokémon Lune",
  normalizedTitle: "pokemon lune",
  aliases: ["Pokémon Moon"],
  franchise: "Pokémon",
  platformId: "3ds",
  region: "PAL-FR",
  languages: ["fr"],
  publisher: null,
  developer: null,
  releaseYear: null,
  genres: [],
  edition: null,
  mediaType: "cartridge",
  externalIds: {},
};

describe("GameSchema", () => {
  it("accepte un jeu valide", () => {
    expect(GameSchema.safeParse(validGame).success).toBe(true);
  });
  it("rejette un id mal formé", () => {
    expect(GameSchema.safeParse({ ...validGame, id: "pokemon lune" }).success).toBe(false);
  });
  it("rejette une région inconnue", () => {
    expect(GameSchema.safeParse({ ...validGame, region: "PAL-XX" }).success).toBe(false);
  });
});

describe("InventoryItemSchema", () => {
  const validItem = {
    id: "inv_3ds_pokemon-lune",
    gameId: "game_3ds_pokemon-lune",
    status: "owned",
    quantity: 1,
    condition: "very_good",
    completeness: "CIB",
    purchasePrice: { amount: 20, currency: "EUR", includesShipping: true },
    currentEstimate: null,
    verificationStatus: "needs_review",
    quantityNeedsReview: false,
    evidenceIds: [],
    orderId: null,
    privateNotes: null,
    acquiredAt: "2026-08-07",
    createdAt: "2026-08-07T10:00:00.000Z",
    updatedAt: "2026-08-07T10:00:00.000Z",
  };

  it("accepte un item valide", () => {
    expect(InventoryItemSchema.safeParse(validItem).success).toBe(true);
  });
  it("rejette un statut inconnu", () => {
    expect(InventoryItemSchema.safeParse({ ...validItem, status: "maybe" }).success).toBe(false);
  });
  it("rejette une quantité négative", () => {
    expect(InventoryItemSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false);
  });
  it("distingue code_in_box (règle n°8)", () => {
    expect(
      InventoryItemSchema.safeParse({ ...validItem, completeness: "code_in_box" }).success,
    ).toBe(true);
  });
});

describe("règles de possession", () => {
  it("ordered n'est jamais un statut de possession (règle n°4)", () => {
    expect(POSSESSION_STATUSES).not.toContain("ordered");
    expect(POSSESSION_STATUSES).not.toContain("cancelled");
    expect(POSSESSION_STATUSES).toContain("owned");
  });
});

describe("OrderSchema", () => {
  it("exige au moins un item", () => {
    const order = {
      id: "order_x1",
      marketplace: "vinted",
      status: "ordered",
      items: [],
      currency: "EUR",
      orderedAt: "2026-08-07",
    };
    expect(OrderSchema.safeParse(order).success).toBe(false);
  });
});

describe("PublishConfigSchema", () => {
  it("valide la config par défaut du repo privé", () => {
    const cfg = {
      publish: {
        purchase_price: false,
        seller_name: false,
        order_reference: false,
        private_notes: false,
        acquisition_date: true,
        condition: true,
        ownership_status: true,
        estimates: true,
        marketplace: true,
      },
    };
    expect(PublishConfigSchema.safeParse(cfg).success).toBe(true);
  });
});
