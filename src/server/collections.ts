/**
 * Collections exposed by the API: D1 table, Zod schema of one record, and the
 * data/*.json file it mirrors (used by the change log and by scripts/d1/sync.ts).
 */
import type { z } from "zod";
import {
  EvidenceSchema,
  GameSchema,
  InventoryItemSchema,
  ListingSchema,
  OrderSchema,
  PlatformSchema,
  PriceObservationSchema,
  SellerSchema,
} from "../lib/schema";

export interface CollectionDef {
  table: string;
  file: string;
  schema: z.ZodType<{ id: string }>;
}

export const COLLECTIONS: Record<string, CollectionDef> = {
  games: { table: "games", file: "games.json", schema: GameSchema },
  inventory: { table: "inventory", file: "inventory.json", schema: InventoryItemSchema },
  orders: { table: "orders", file: "orders.json", schema: OrderSchema },
  platforms: { table: "platforms", file: "platforms.json", schema: PlatformSchema },
  sellers: { table: "sellers", file: "sellers.json", schema: SellerSchema },
  listings: { table: "listings", file: "listings.json", schema: ListingSchema },
  "price-observations": {
    table: "price_observations",
    file: "price-observations.json",
    schema: PriceObservationSchema,
  },
  evidence: { table: "evidence", file: "evidence.json", schema: EvidenceSchema },
};

/** Read-only through the API: written as a side effect of every mutation. */
export const CHANGE_LOG = { table: "change_log", file: "change-log.json" } as const;
