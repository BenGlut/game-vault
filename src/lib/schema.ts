import { z } from "zod";

/**
 * Source de vérité du modèle de données GameVault.
 * Toute mutation passe par ces schémas (règle d'intégrité n°11).
 */

export const REGIONS = ["PAL-FR", "PAL-EU", "PAL-UK", "PAL-AUS", "NTSC-U", "NTSC-J", "other"] as const;
export const RegionSchema = z.enum(REGIONS);

export const INVENTORY_STATUSES = [
  "owned",
  "ordered", // commandé
  "fulfilled", // expédié par le vendeur
  "delivered", // reçu
  "wishlist",
  "duplicate",
  "sold",
  "cancelled",
  "refunded",
] as const;
export const InventoryStatusSchema = z.enum(INVENTORY_STATUSES);

export const ORDER_STATUSES = ["ordered", "fulfilled", "delivered", "cancelled", "refunded"] as const;
export const OrderStatusSchema = z.enum(ORDER_STATUSES);

export const CONDITIONS = [
  "new",
  "like_new",
  "very_good",
  "good",
  "acceptable",
  "poor",
  "unknown",
] as const;
export const ConditionSchema = z.enum(CONDITIONS);

export const COMPLETENESS = [
  "CIB", // complete in box
  "loose",
  "no_manual",
  "box_only",
  "sealed",
  "code_in_box", // règle n°8 : distinct d'une vraie cartouche/disque
  "unknown",
] as const;
export const CompletenessSchema = z.enum(COMPLETENESS);

export const MEDIA_TYPES = ["cartridge", "disc", "card", "code_in_box", "digital", "other"] as const;
export const MediaTypeSchema = z.enum(MEDIA_TYPES);

export const VERIFICATION_STATUSES = ["verified", "needs_review"] as const;
export const VerificationStatusSchema = z.enum(VERIFICATION_STATUSES);

/** Niveau de qualité du jeu (consensus critique) : S = incontournable … D = faible. */
export const QUALITY_TIERS = ["S", "A", "B", "C", "D"] as const;
export const QualityTierSchema = z.enum(QUALITY_TIERS);

/** Priorité d'achat (surtout pour la wishlist / recommandations). */
export const BUY_PRIORITIES = ["haute", "moyenne", "basse"] as const;
export const BuyPrioritySchema = z.enum(BUY_PRIORITIES);

export const MARKETPLACES = [
  "vinted",
  "leboncoin",
  "ebay",
  "amazon",
  "cdiscount",
  "rakuten",
  "retro_shop",
  "in_person",
  "other",
] as const;
export const MarketplaceSchema = z.enum(MARKETPLACES);

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date au format YYYY-MM-DD");
const IsoDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "datetime ISO 8601");

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default("EUR"),
  includesShipping: z.boolean().optional(),
});

export const EstimateSchema = z.object({
  low: z.number().nonnegative(),
  median: z.number().nonnegative(),
  high: z.number().nonnegative(),
  currency: z.string().length(3).default("EUR"),
  source: z.string(),
  observedAt: IsoDate,
});

export const PlatformSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  brand: z.string().min(1),
  generation: z.number().int().optional(),
  mediaTypes: z.array(MediaTypeSchema).min(1),
});

/**
 * Nature de l'entrée. Une console ou un accessoire partage la même table que les
 * jeux — donc le même inventaire, les mêmes commandes, le même historique d'achat —
 * mais ne doit jamais être compté comme un jeu ni valorisé avec les cotes de jeux.
 */
export const ENTRY_KINDS = ["game", "hardware"] as const;
export const EntryKindSchema = z.enum(ENTRY_KINDS);

export const GameSchema = z.object({
  id: z.string().regex(/^game_[a-z0-9_-]+$/),
  kind: EntryKindSchema.default("game"),
  canonicalTitle: z.string().min(1),
  normalizedTitle: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  franchise: z.string().nullable().default(null),
  platformId: z.string(),
  region: RegionSchema.default("PAL-FR"),
  languages: z.array(z.string()).default(["fr"]),
  publisher: z.string().nullable().default(null),
  developer: z.string().nullable().default(null),
  releaseYear: z.number().int().min(1970).max(2030).nullable().default(null),
  genres: z.array(z.string()).default([]),
  edition: z.string().nullable().default(null),
  mediaType: MediaTypeSchema.default("cartridge"),
  externalIds: z.record(z.string(), z.string()).default({}),
  qualityTier: QualityTierSchema.nullable().default(null),
  buyPriority: BuyPrioritySchema.nullable().default(null),
});

export const InventoryItemSchema = z.object({
  id: z.string().regex(/^inv_[a-z0-9_-]+$/),
  gameId: z.string(),
  status: InventoryStatusSchema,
  // modèle ERP : 1 article physique = 1 entrée de stock (0 = wishlist, pas d'objet)
  quantity: z.number().int().min(0).max(1),
  condition: ConditionSchema.default("unknown"),
  completeness: CompletenessSchema.default("unknown"),
  purchasePrice: MoneySchema.nullable().default(null),
  currentEstimate: EstimateSchema.nullable().default(null),
  verificationStatus: VerificationStatusSchema.default("needs_review"),
  quantityNeedsReview: z.boolean().default(false),
  evidenceIds: z.array(z.string()).default([]),
  orderId: z.string().nullable().default(null),
  privateNotes: z.string().nullable().default(null),
  acquiredAt: IsoDate.nullable().default(null),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});

export const OrderItemSchema = z.object({
  gameId: z.string(),
  inventoryId: z.string().nullable().default(null),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().nonnegative().nullable().default(null),
});

export const OrderSchema = z.object({
  id: z.string().regex(/^order_[a-z0-9_-]+$/),
  marketplace: MarketplaceSchema,
  sellerId: z.string().nullable().default(null),
  reference: z.string().nullable().default(null),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema).min(1),
  itemsTotal: z.number().nonnegative().nullable().default(null),
  shippingCost: z.number().nonnegative().nullable().default(null),
  buyerProtection: z.number().nonnegative().nullable().default(null),
  lotDiscount: z.number().nonnegative().nullable().default(null),
  totalPaid: z.number().nonnegative().nullable().default(null),
  currency: z.string().length(3).default("EUR"),
  orderedAt: IsoDate,
  fulfilledAt: IsoDate.nullable().default(null),
  deliveredAt: IsoDate.nullable().default(null),
  estimatedDeliveryAt: IsoDate.nullable().default(null),
  cancelledAt: IsoDate.nullable().default(null),
  refundedAt: IsoDate.nullable().default(null),
  listingIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  privateNotes: z.string().nullable().default(null),
});

export const SellerSchema = z.object({
  id: z.string().regex(/^seller_[a-z0-9_-]+$/),
  name: z.string().min(1),
  marketplace: MarketplaceSchema,
  profileUrl: z.string().url().nullable().default(null),
  rating: z.number().min(0).max(5).nullable().default(null),
  privateNotes: z.string().nullable().default(null),
});

export const ListingSchema = z.object({
  id: z.string().regex(/^listing_[a-z0-9_-]+$/),
  marketplace: MarketplaceSchema,
  url: z.string().url().nullable().default(null),
  title: z.string().min(1),
  askingPrice: z.number().nonnegative().nullable().default(null),
  currency: z.string().length(3).default("EUR"),
  gameIds: z.array(z.string()).default([]),
  status: z.enum(["watching", "purchased", "expired", "ignored"]).default("watching"),
  capturedAt: IsoDate,
  privateNotes: z.string().nullable().default(null),
});

/** Variante de cote : avec boîte (cib), sans boîte (loose), ou indifférencié (any). */
export const QUOTE_VARIANTS = ["cib", "loose", "any"] as const;
export const QuoteVariantSchema = z.enum(QUOTE_VARIANTS);

export const PriceObservationSchema = z.object({
  id: z.string().regex(/^price_[a-z0-9_-]+$/),
  gameId: z.string(),
  variant: QuoteVariantSchema.default("any"),
  low: z.number().nonnegative().nullable().default(null),
  median: z.number().nonnegative().nullable().default(null),
  high: z.number().nonnegative().nullable().default(null),
  currency: z.string().length(3).default("EUR"),
  source: z.string().min(1),
  url: z.string().url().nullable().default(null),
  observedAt: IsoDate,
  notes: z.string().nullable().default(null),
});

export const EvidenceSchema = z.object({
  id: z.string().regex(/^evidence_[a-z0-9_-]+$/),
  type: z.enum(["photo", "screenshot", "receipt", "message", "link", "other"]),
  path: z.string().nullable().default(null),
  url: z.string().url().nullable().default(null),
  description: z.string().nullable().default(null),
  capturedAt: IsoDate.nullable().default(null),
  relatedIds: z.array(z.string()).default([]),
});

export const ChangeLogEntrySchema = z.object({
  id: z.string(),
  at: IsoDateTime,
  actor: z.string().default("agent"),
  command: z.string(),
  message: z.string(),
  affected: z
    .array(z.object({ file: z.string(), ids: z.array(z.string()).default([]) }))
    .default([]),
});

export const PublishConfigSchema = z.object({
  publish: z.object({
    purchase_price: z.boolean().default(false),
    seller_name: z.boolean().default(false),
    order_reference: z.boolean().default(false),
    private_notes: z.boolean().default(false),
    acquisition_date: z.boolean().default(true),
    condition: z.boolean().default(true),
    ownership_status: z.boolean().default(true),
    estimates: z.boolean().default(true),
    marketplace: z.boolean().default(true),
  }),
});

export const GamesFileSchema = z.array(GameSchema);
export const InventoryFileSchema = z.array(InventoryItemSchema);
export const OrdersFileSchema = z.array(OrderSchema);
export const PlatformsFileSchema = z.array(PlatformSchema);
export const SellersFileSchema = z.array(SellerSchema);
export const ListingsFileSchema = z.array(ListingSchema);
export const PriceObservationsFileSchema = z.array(PriceObservationSchema);
export const EvidenceFileSchema = z.array(EvidenceSchema);
export const ChangeLogFileSchema = z.array(ChangeLogEntrySchema);

export type Region = z.infer<typeof RegionSchema>;
export type InventoryStatus = z.infer<typeof InventoryStatusSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Completeness = z.infer<typeof CompletenessSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type Marketplace = z.infer<typeof MarketplaceSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Estimate = z.infer<typeof EstimateSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Game = z.infer<typeof GameSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Seller = z.infer<typeof SellerSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type PriceObservation = z.infer<typeof PriceObservationSchema>;
export type QuoteVariant = z.infer<typeof QuoteVariantSchema>;
export type QualityTier = z.infer<typeof QualityTierSchema>;
export type BuyPriority = z.infer<typeof BuyPrioritySchema>;

/** Cote publiée d'un jeu pour une variante donnée. */
export interface Quote {
  low: number;
  median: number;
  high: number;
  currency: string;
  source: string;
  observedAt: string;
}
export type GameQuotes = Partial<Record<"cib" | "loose", Quote>>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type ChangeLogEntry = z.infer<typeof ChangeLogEntrySchema>;
export type PublishConfig = z.infer<typeof PublishConfigSchema>;

/** Statuts considérés comme "physiquement possédé". Règle n°4 : ordered ≠ owned. */
export const POSSESSION_STATUSES: readonly InventoryStatus[] = ["owned", "delivered", "duplicate"];
