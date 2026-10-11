import { describe, expect, it } from "vitest";
import { freeInventoryId, planAddOrder } from "../src/lib/orders";
import { InventoryItemSchema, OrderSchema, SellerSchema, type InventoryItem } from "../src/lib/schema";

const NOW = new Date("2026-10-11T10:00:00.000Z");

const wishlistLine: InventoryItem = InventoryItemSchema.parse({
  id: "inv_switch_luigi-s-mansion-2-hd",
  gameId: "game_switch_luigi-s-mansion-2-hd",
  status: "wishlist",
  quantity: 0,
  condition: "unknown",
  completeness: "unknown",
  purchasePrice: null,
  currentEstimate: null,
  verificationStatus: "needs_review",
  quantityNeedsReview: false,
  evidenceIds: [],
  orderId: null,
  privateNotes: null,
  acquiredAt: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
});

describe("freeInventoryId", () => {
  it("prend le premier suffixe libre", () => {
    expect(freeInventoryId(new Set(), "game_ds_x")).toBe("inv_ds_x");
    expect(freeInventoryId(new Set(["inv_ds_x", "inv_ds_x-2"]), "game_ds_x")).toBe("inv_ds_x-3");
  });
});

describe("planAddOrder", () => {
  it("bascule la ligne wishlist et crée les autres, avec un vendeur nouveau", () => {
    const plan = planAddOrder(
      {
        marketplace: "vinted",
        items: [
          { gameId: "game_switch_luigi-s-mansion-2-hd", unitPrice: 22 },
          { gameId: "game_ds_hotel-dusk", unitPrice: null },
        ],
        seller: "morgane13032011",
        reference: "23059935938",
        total: 26.5,
      },
      { wishlist: [wishlistLine], takenInventoryIds: new Set([wishlistLine.id]), existingSeller: null },
      NOW,
    );
    expect(OrderSchema.parse(plan.order)).toBeTruthy();
    expect(plan.order.id).toBe(`order_${NOW.getTime().toString(36)}`);
    expect(plan.order.reference).toBe("23059935938");
    expect(plan.order.itemsTotal).toBeNull();
    expect(plan.order.orderedAt).toBe("2026-10-11");
    expect(plan.updatedInventory).toHaveLength(1);
    expect(plan.updatedInventory[0]).toMatchObject({ status: "ordered", orderId: plan.order.id });
    expect(plan.newInventory.map((i) => i.id)).toEqual(["inv_ds_hotel-dusk"]);
    expect(plan.order.items.map((i) => i.inventoryId)).toEqual([wishlistLine.id, "inv_ds_hotel-dusk"]);
    expect(SellerSchema.parse(plan.newSeller)).toMatchObject({ id: "seller_morgane13032011", marketplace: "vinted" });
  });

  it("réutilise un vendeur connu et fabrique une référence quand il n'y en a pas", () => {
    const plan = planAddOrder(
      { marketplace: "leboncoin", items: [{ gameId: "game_ds_x", unitPrice: 10 }], seller: "Paul" },
      {
        wishlist: [],
        takenInventoryIds: new Set(["inv_ds_x"]),
        existingSeller: { id: "seller_paul", name: "Paul", marketplace: "leboncoin", profileUrl: null, rating: null, privateNotes: null },
      },
      NOW,
    );
    expect(plan.newSeller).toBeNull();
    expect(plan.order.sellerId).toBe("seller_paul");
    expect(plan.order.reference).toMatch(/^LBC-[0-9a-z]+-[0-9a-f]{4}$/);
    expect(plan.order.itemsTotal).toBe(10);
    expect(plan.newInventory[0]).toMatchObject({ id: "inv_ds_x-2", purchasePrice: { amount: 10, currency: "EUR" } });
  });
});
