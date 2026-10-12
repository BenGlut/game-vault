/**
 * Base de démonstration réaliste servie à la place de /api/vault pour les captures
 * de revue de design et les parcours e2e « grandeur nature » : une cinquantaine de
 * jeux sur huit consoles (jaquettes locales réelles), des commandes à tous les
 * statuts, des cotes et un historique. Données fictives, générées de façon
 * déterministe (aucun aléa : les captures restent comparables d'une fois à l'autre).
 */

type Tier = "S" | "A" | "B" | "C" | "D" | null;

interface Seed {
  slug: string;
  title: string;
  platformId: string;
  tier: Tier;
  year?: number;
  aliases?: string[];
  franchise?: string;
  /** cote CIB médiane */
  quote?: number;
  /** owned (défaut), wishlist, ordered, fulfilled, double, none */
  status?: "owned" | "wishlist" | "ordered" | "fulfilled" | "double" | "cancelled" | "refunded";
  priority?: "haute" | "moyenne" | "basse";
  completeness?: string;
  condition?: string;
  review?: boolean;
}

const SEEDS: Seed[] = [
  // Nintendo 3DS
  { slug: "pokemon-lune", title: "Pokémon Lune", platformId: "3ds", tier: "A", year: 2016, aliases: ["Pokémon Moon"], franchise: "Pokémon", quote: 22 },
  { slug: "the-legend-of-zelda-a-link-between-worlds", title: "The Legend of Zelda: A Link Between Worlds", platformId: "3ds", tier: "S", year: 2013, franchise: "Zelda", quote: 28 },
  { slug: "fire-emblem-awakening", title: "Fire Emblem Awakening", platformId: "3ds", tier: "S", year: 2013, quote: 45, condition: "very_good" },
  { slug: "mario-kart-7", title: "Mario Kart 7", platformId: "3ds", tier: "A", year: 2011, quote: 16 },
  { slug: "kid-icarus-uprising", title: "Kid Icarus: Uprising", platformId: "3ds", tier: "A", year: 2012, quote: 24, status: "double" },
  { slug: "super-mario-3d-land", title: "Super Mario 3D Land", platformId: "3ds", tier: "A", year: 2011, quote: 15 },
  { slug: "luigi-s-mansion-2", title: "Luigi's Mansion 2", platformId: "3ds", tier: "A", year: 2013, aliases: ["Luigi's Mansion: Dark Moon"], quote: 19 },
  { slug: "xenoblade-chronicles-3d", title: "Xenoblade Chronicles 3D", platformId: "3ds", tier: "A", year: 2015, quote: 38, status: "fulfilled" },
  { slug: "metroid-samus-returns", title: "Metroid: Samus Returns", platformId: "3ds", tier: "A", year: 2017, quote: 34, status: "wishlist", priority: "haute" },
  { slug: "professeur-layton-et-le-masque-des-miracles", title: "Professeur Layton et le Masque des Miracles", platformId: "3ds", tier: "B", year: 2012, quote: 14, review: true },
  // Nintendo DS
  { slug: "super-mario-64-ds", title: "Super Mario 64 DS", platformId: "ds", tier: "A", year: 2005, franchise: "Super Mario", quote: 18 },
  { slug: "hotel-dusk-room-215", title: "Hotel Dusk : Room 215", platformId: "ds", tier: "B", year: 2007, quote: 21, status: "ordered" },
  { slug: "chrono-trigger", title: "Chrono Trigger", platformId: "ds", tier: "S", year: 2009, quote: 48, condition: "like_new" },
  { slug: "the-world-ends-with-you", title: "The World Ends with You", platformId: "ds", tier: "S", year: 2008, quote: 32 },
  { slug: "professeur-layton-et-l-etrange-village", title: "Professeur Layton et l'Étrange Village", platformId: "ds", tier: "A", year: 2008, quote: 9 },
  { slug: "mario-kart-ds", title: "Mario Kart DS", platformId: "ds", tier: "A", year: 2005, quote: 17, completeness: "loose" },
  { slug: "pokemon-version-platine", title: "Pokémon Version Platine", platformId: "ds", tier: "A", year: 2009, aliases: ["Pokémon Platinum"], quote: 62 },
  { slug: "phoenix-wright-ace-attorney", title: "Phoenix Wright: Ace Attorney", platformId: "ds", tier: "A", year: 2006, quote: 26 },
  { slug: "ghost-trick-detective-fantome", title: "Ghost Trick : Détective Fantôme", platformId: "ds", tier: "S", year: 2011, quote: 39, status: "wishlist", priority: "haute" },
  { slug: "castlevania-dawn-of-sorrow", title: "Castlevania: Dawn of Sorrow", platformId: "ds", tier: "A", year: 2005, quote: 35, status: "wishlist", priority: "moyenne" },
  // Game Boy Advance
  { slug: "the-legend-of-zelda-the-minish-cap", title: "The Legend of Zelda: The Minish Cap", platformId: "gba", tier: "S", year: 2004, quote: 85, status: "wishlist", priority: "haute" },
  { slug: "metroid-fusion", title: "Metroid Fusion", platformId: "gba", tier: "S", year: 2002, quote: 70 },
  { slug: "golden-sun", title: "Golden Sun", platformId: "gba", tier: "A", year: 2001, quote: 42, completeness: "no_manual" },
  { slug: "mario-luigi-superstar-saga", title: "Mario & Luigi: Superstar Saga", platformId: "gba", tier: "A", year: 2003, quote: 38 },
  { slug: "pokemon-version-emeraude", title: "Pokémon Version Émeraude", platformId: "gba", tier: "A", year: 2005, quote: 120, status: "wishlist", priority: "moyenne" },
  { slug: "castlevania-aria-of-sorrow", title: "Castlevania: Aria of Sorrow", platformId: "gba", tier: "S", year: 2003, quote: 55, completeness: "loose", review: true },
  // GameCube
  { slug: "the-legend-of-zelda-the-wind-waker", title: "The Legend of Zelda: The Wind Waker", platformId: "gamecube", tier: "S", year: 2003, quote: 75, status: "cancelled", priority: "haute" },
  { slug: "metroid-prime", title: "Metroid Prime", platformId: "gamecube", tier: "S", year: 2002, quote: 30 },
  { slug: "super-mario-sunshine", title: "Super Mario Sunshine", platformId: "gamecube", tier: "A", year: 2002, quote: 32 },
  { slug: "pikmin-2", title: "Pikmin 2", platformId: "gamecube", tier: "A", year: 2004, quote: 65, status: "wishlist", priority: "basse" },
  { slug: "tales-of-symphonia", title: "Tales of Symphonia", platformId: "gamecube", tier: "A", year: 2004, quote: 58 },
  // Nintendo 64
  { slug: "the-legend-of-zelda-ocarina-of-time", title: "The Legend of Zelda: Ocarina of Time", platformId: "n64", tier: "S", year: 1998, quote: 90, condition: "good" },
  { slug: "super-mario-64", title: "Super Mario 64", platformId: "n64", tier: "S", year: 1997, quote: 70 },
  { slug: "mario-kart-64", title: "Mario Kart 64", platformId: "n64", tier: "A", year: 1997, quote: 48, completeness: "loose" },
  { slug: "banjo-kazooie", title: "Banjo-Kazooie", platformId: "n64", tier: "S", year: 1998, quote: 55, status: "wishlist" },
  // Switch
  { slug: "the-legend-of-zelda-tears-of-the-kingdom", title: "The Legend of Zelda: Tears of the Kingdom", platformId: "switch", tier: "S", year: 2023, quote: 42 },
  { slug: "super-mario-odyssey", title: "Super Mario Odyssey", platformId: "switch", tier: "S", year: 2017, quote: 33 },
  { slug: "metroid-dread", title: "Metroid Dread", platformId: "switch", tier: "A", year: 2021, quote: 36 },
  { slug: "xenoblade-chronicles-3", title: "Xenoblade Chronicles 3", platformId: "switch", tier: "A", year: 2022, quote: 39, status: "ordered" },
  { slug: "persona-5-royal", title: "Persona 5 Royal", platformId: "switch", tier: "S", year: 2022, quote: 31 },
  { slug: "hades", title: "Hades", platformId: "switch", tier: "S", year: 2021, quote: 27 },
  { slug: "celeste", title: "Celeste", platformId: "switch", tier: "S", year: 2018, quote: 29, status: "fulfilled" },
  { slug: "octopath-traveler", title: "Octopath Traveler", platformId: "switch", tier: "B", year: 2018, quote: 26 },
  { slug: "paper-mario-the-origami-king", title: "Paper Mario: The Origami King", platformId: "switch", tier: "B", year: 2020, quote: 20, status: "refunded" },
  { slug: "professeur-layton-et-le-nouveau-monde-a-vapeur", title: "Professeur Layton et le Nouveau Monde à Vapeur", platformId: "switch", tier: null, year: 2025, status: "wishlist", priority: "moyenne" },
  { slug: "return-to-monkey-island", title: "Return to Monkey Island", platformId: "switch", tier: "A", year: 2023, quote: 30 },
  // Switch 2
  { slug: "mario-kart-world", title: "Mario Kart World", platformId: "switch2", tier: "A", year: 2025, quote: 58 },
  { slug: "donkey-kong-bananza", title: "Donkey Kong Bananza", platformId: "switch2", tier: "S", year: 2025, quote: 55, status: "wishlist", priority: "haute" },
  // Game Boy
  { slug: "pokemon-version-jaune", title: "Pokémon Version Jaune", platformId: "gb", tier: "A", year: 1999, quote: 45, completeness: "loose" },
  { slug: "tetris", title: "Tetris", platformId: "gb", tier: "A", year: 1990, completeness: "loose" },
];

const PLATFORMS = [
  ["3ds", "Nintendo 3DS", "3DS", "cartridge"],
  ["ds", "Nintendo DS", "DS", "cartridge"],
  ["gba", "Game Boy Advance", "GBA", "cartridge"],
  ["gb", "Game Boy", "GB", "cartridge"],
  ["gamecube", "Nintendo GameCube", "GC", "disc"],
  ["n64", "Nintendo 64", "N64", "cartridge"],
  ["switch", "Nintendo Switch", "Switch", "cartridge"],
  ["switch2", "Nintendo Switch 2", "Switch 2", "cartridge"],
] as const;

const SELLERS = ["lucie.retro", "gaming_nostalgie", "pixel-marchand", "ludo_59", "boutique-1up", "camille.collection", "mathis.games", "le_grenier_de_jeanne"];
const MARKETS = ["vinted", "vinted", "vinted", "leboncoin", "vinted", "ebay", "vinted", "rakuten"];

/** Pseudo-aléa stable : même entrée, même sortie. */
function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

function normalized(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isoDay(base: string, plusDays: number): string {
  const d = new Date(`${base}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + plusDays);
  return d.toISOString().slice(0, 10);
}

const games = SEEDS.map((s) => ({
  id: `game_${s.platformId}_${s.slug}`,
  kind: "game",
  canonicalTitle: s.title,
  normalizedTitle: normalized(s.title),
  aliases: s.aliases ?? [],
  franchise: s.franchise ?? null,
  platformId: s.platformId,
  region: "PAL-FR",
  languages: ["fr"],
  publisher: "Nintendo",
  developer: null,
  releaseYear: s.year ?? null,
  genres: [],
  edition: null,
  playsOn: [],
  mediaType: s.platformId === "gamecube" ? "disc" : "cartridge",
  externalIds: {},
  qualityTier: s.tier,
  buyPriority: s.priority ?? null,
}));

type Inv = Record<string, unknown> & { id: string; gameId: string; status: string; orderId: string | null };
type Ord = Record<string, unknown> & { id: string; status: string; items: { gameId: string; inventoryId: string; quantity: number; unitPrice: number }[] };

const inventory: Inv[] = [];
const orders: Ord[] = [];

const CONDITIONS = ["very_good", "like_new", "good", "very_good", "unknown"];

// Les exemplaires possédés arrivent par lots de 1 à 3, de mai 2025 à octobre 2026.
let orderIndex = 0;
let pending: { seed: Seed; gameId: string; price: number; extra?: boolean }[] = [];
const ownedSeeds = SEEDS.filter((s) => !s.status || s.status === "owned" || s.status === "double");

function flush(force = false) {
  if (!pending.length) return;
  if (!force && pending.length < 1 + Math.floor(hash(`lot${orderIndex}`) * 3)) return;
  const n = orderIndex++;
  const id = `order_demo_${String(n + 1).padStart(2, "0")}`;
  const ordered = isoDay("2025-05-04", Math.round((n / 30) * 520));
  const delivered = isoDay(ordered, 3 + Math.floor(hash(id) * 5));
  const sellerIdx = Math.floor(hash(`s${id}`) * SELLERS.length);
  const items = pending.map((p, k) => {
    const invId = `inv_${p.seed.platformId}_${p.seed.slug}${p.extra ? "-2" : ""}`;
    inventory.push({
      id: invId,
      gameId: p.gameId,
      status: p.extra ? "duplicate" : "owned",
      quantity: 1,
      condition: p.seed.condition ?? CONDITIONS[(n + k) % CONDITIONS.length],
      completeness: p.seed.completeness ?? (hash(`c${invId}`) > 0.85 ? "no_manual" : "CIB"),
      purchasePrice: { amount: p.price, currency: "EUR", includesShipping: true },
      currentEstimate: null,
      verificationStatus: p.seed.review ? "needs_review" : "verified",
      quantityNeedsReview: false,
      evidenceIds: [],
      orderId: id,
      privateNotes: null,
      acquiredAt: delivered,
      createdAt: `${ordered}T10:00:00.000Z`,
      updatedAt: `${delivered}T18:00:00.000Z`,
    });
    return { gameId: p.gameId, inventoryId: invId, quantity: 1, unitPrice: p.price };
  });
  const itemsTotal = Math.round(items.reduce((s, i) => s + i.unitPrice, 0) * 100) / 100;
  const shipping = MARKETS[sellerIdx] === "vinted" ? 3.29 : 4.9;
  const protection = MARKETS[sellerIdx] === "vinted" ? Math.round((0.7 + itemsTotal * 0.05) * 100) / 100 : 0;
  orders.push({
    id,
    marketplace: MARKETS[sellerIdx],
    sellerId: `seller_demo_${sellerIdx + 1}`,
    reference: `VNT-${48213 + n * 7}`,
    status: "delivered",
    items,
    itemsTotal,
    shippingCost: shipping,
    buyerProtection: protection || null,
    lotDiscount: null,
    totalPaid: Math.round((itemsTotal + shipping + protection) * 100) / 100,
    currency: "EUR",
    orderedAt: ordered,
    fulfilledAt: isoDay(ordered, 1),
    deliveredAt: delivered,
    estimatedDeliveryAt: null,
    cancelledAt: null,
    refundedAt: null,
    listingIds: [],
    evidenceIds: [],
    privateNotes: null,
  });
  pending = [];
}

for (const seed of ownedSeeds) {
  const gameId = `game_${seed.platformId}_${seed.slug}`;
  const ratio = 0.55 + hash(seed.slug) * 0.5;
  const price = Math.round((seed.quote ?? 12) * ratio * 2) / 2;
  pending.push({ seed, gameId, price });
  if (seed.status === "double") pending.push({ seed, gameId, price: Math.round(price * 0.8 * 2) / 2, extra: true });
  flush();
}
flush(true);

// Wishlist
for (const seed of SEEDS.filter((s) => s.status === "wishlist" || s.status === "cancelled" || s.status === "refunded")) {
  inventory.push({
    id: `inv_${seed.platformId}_${seed.slug}`,
    gameId: `game_${seed.platformId}_${seed.slug}`,
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
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  });
}

// Commandes en cours, annulée, remboursée
const special: { slug: string; status: "ordered" | "fulfilled" | "cancelled" | "refunded"; orderedAt: string; price: number; seller: number }[] = [
  { slug: "hotel-dusk-room-215", status: "ordered", orderedAt: "2026-10-09", price: 20, seller: 2 },
  { slug: "xenoblade-chronicles-3", status: "ordered", orderedAt: "2026-10-10", price: 32, seller: 5 },
  { slug: "xenoblade-chronicles-3d", status: "fulfilled", orderedAt: "2026-10-05", price: 29, seller: 0 },
  { slug: "celeste", status: "fulfilled", orderedAt: "2026-10-07", price: 21, seller: 6 },
  { slug: "the-legend-of-zelda-the-wind-waker", status: "cancelled", orderedAt: "2026-09-12", price: 58, seller: 3 },
  { slug: "paper-mario-the-origami-king", status: "refunded", orderedAt: "2026-08-20", price: 18, seller: 1 },
];
for (const [n, s] of special.entries()) {
  const seed = SEEDS.find((x) => x.slug === s.slug)!;
  const id = `order_demo_live_${n + 1}`;
  const gameId = `game_${seed.platformId}_${seed.slug}`;
  const invId = `inv_${seed.platformId}_${seed.slug}${s.status === "cancelled" || s.status === "refunded" ? "-2" : ""}`;
  inventory.push({
    id: invId,
    gameId,
    status: s.status,
    quantity: 1,
    condition: "unknown",
    completeness: "CIB",
    purchasePrice: { amount: s.price, currency: "EUR", includesShipping: true },
    currentEstimate: null,
    verificationStatus: "verified",
    quantityNeedsReview: false,
    evidenceIds: [],
    orderId: id,
    privateNotes: null,
    acquiredAt: null,
    createdAt: `${s.orderedAt}T10:00:00.000Z`,
    updatedAt: `${s.orderedAt}T10:00:00.000Z`,
  });
  const shipping = 3.29;
  orders.push({
    id,
    marketplace: MARKETS[s.seller],
    sellerId: `seller_demo_${s.seller + 1}`,
    reference: `VNT-${51020 + n * 13}`,
    status: s.status,
    items: [{ gameId, inventoryId: invId, quantity: 1, unitPrice: s.price }],
    itemsTotal: s.price,
    shippingCost: shipping,
    buyerProtection: 1.6,
    lotDiscount: null,
    totalPaid: Math.round((s.price + shipping + 1.6) * 100) / 100,
    currency: "EUR",
    orderedAt: s.orderedAt,
    fulfilledAt: s.status === "fulfilled" || s.status === "refunded" ? isoDay(s.orderedAt, 1) : null,
    deliveredAt: s.status === "refunded" ? isoDay(s.orderedAt, 4) : null,
    estimatedDeliveryAt: s.status === "fulfilled" ? isoDay(s.orderedAt, 6) : null,
    cancelledAt: s.status === "cancelled" ? isoDay(s.orderedAt, 2) : null,
    refundedAt: s.status === "refunded" ? isoDay(s.orderedAt, 9) : null,
    listingIds: [],
    evidenceIds: [],
    privateNotes: s.status === "refunded" ? "Cartouche ne démarrait pas : remboursé par le vendeur." : null,
  });
}

const priceObservations = SEEDS.filter((s) => s.quote).flatMap((s) => {
  const gameId = `game_${s.platformId}_${s.slug}`;
  const m = s.quote!;
  const cib = {
    id: `price_demo_${s.platformId}_${s.slug}_cib`,
    gameId,
    variant: "cib",
    low: Math.round(m * 0.75),
    median: m,
    high: Math.round(m * 1.35),
    currency: "EUR",
    source: "Vinted (annonces vendues)",
    url: null,
    observedAt: "2026-09-28",
    notes: null,
  };
  const loose = {
    ...cib,
    id: `price_demo_${s.platformId}_${s.slug}_loose`,
    variant: "loose",
    low: Math.round(m * 0.35),
    median: Math.round(m * 0.5),
    high: Math.round(m * 0.7),
  };
  return [cib, loose];
});

const title = (slug: string) => SEEDS.find((s) => s.slug === slug)!.title;
const changeLog = [
  ["2026-10-12T09:14:00.000Z", "web", "PUT inventory", `Exemplaire modifié en ligne : ${title("chrono-trigger")}`, "inv_ds_chrono-trigger"],
  ["2026-10-12T08:02:00.000Z", "mcp", "add_order", `Commande ajoutée : ${title("xenoblade-chronicles-3")}`, "inv_switch_xenoblade-chronicles-3"],
  ["2026-10-11T21:40:00.000Z", "web", "POST inventory", `Ajouté à la wishlist en ligne : ${title("donkey-kong-bananza")}`, "inv_switch2_donkey-kong-bananza"],
  ["2026-10-11T18:22:00.000Z", "agent", "add-price", `Cote relevée : ${title("pokemon-version-platine")}`, "game_ds_pokemon-version-platine"],
  ["2026-10-10T19:05:00.000Z", "web", "POST order-transition", `Commande marquée expédiée : ${title("celeste")}`, "inv_switch_celeste"],
  ["2026-10-09T16:31:00.000Z", "agent", "add-order", `Commande ajoutée : ${title("hotel-dusk-room-215")}`, "inv_ds_hotel-dusk-room-215"],
  ["2026-10-08T20:00:00.000Z", "agent", "receive-order", `Commande reçue : ${title("mario-kart-world")}`, "inv_switch2_mario-kart-world"],
  ["2026-10-07T11:12:00.000Z", "web", "PUT games", `Fiche modifiée en ligne : ${title("persona-5-royal")}`, "game_switch_persona-5-royal"],
  ["2026-10-05T09:48:00.000Z", "mcp", "transition_order", `Commande marquée expédiée : ${title("xenoblade-chronicles-3d")}`, "inv_3ds_xenoblade-chronicles-3d"],
  ["2026-10-02T17:30:00.000Z", "agent", "add-price", `Cote relevée : ${title("the-legend-of-zelda-the-minish-cap")}`, "game_gba_the-legend-of-zelda-the-minish-cap"],
  ["2026-09-28T14:10:00.000Z", "agent", "add-price", "Relevé des cotes : 47 jeux mis à jour", "game_n64_super-mario-64"],
  ["2026-09-14T10:00:00.000Z", "web", "POST order-transition", `Commande annulée : ${title("the-legend-of-zelda-the-wind-waker")}`, "inv_gamecube_the-legend-of-zelda-the-wind-waker-2"],
].map(([at, actor, command, message, id], n) => ({
  id: `chg_demo_${n + 1}`,
  at,
  actor,
  command,
  message,
  affected: [{ file: id!.startsWith("game_") ? "games.json" : "inventory.json", ids: [id] }],
}));

export const DEMO_VAULT = {
  games,
  inventory,
  orders,
  platforms: PLATFORMS.map(([id, name, shortName, media]) => ({ id, name, shortName, brand: "Nintendo", mediaTypes: [media] })),
  sellers: SELLERS.map((name, i) => ({
    id: `seller_demo_${i + 1}`,
    name,
    marketplace: MARKETS[i],
    profileUrl: null,
    rating: null,
    privateNotes: null,
  })),
  priceObservations,
  changeLog,
};

/** Fiche technique figée (page Dev) — chiffres plausibles. */
export const DEMO_DEV_INFO = {
  generatedAt: "2026-10-11T22:10:00.000Z",
  version: "0.1.1",
  git: { commit: "a1b2c3d", branch: "main", commits: 412, lastCommitAt: "2026-10-11T21:58:00.000Z", dataCommits: 238 },
  runtime: { node: "22.11.0", pnpm: "11.20.0" },
  packages: { next: "15.5.23", react: "19.2.8", tailwindcss: "4.3.3", zod: "4.4.3", "fuse.js": "7.5.0", typescript: "6.0.3", vitest: "4.1.11", "@playwright/test": "1.62.1", wrangler: "4.148.0" },
  scripts: { build: "next build", test: "vitest run" },
  code: [
    { label: "Interface", dir: "src/components", files: 58, lines: 6900, bytes: 260000 },
    { label: "Logique métier", dir: "src/lib", files: 18, lines: 1800, bytes: 62000 },
    { label: "API", dir: "functions", files: 9, lines: 640, bytes: 21000 },
    { label: "CLI", dir: "scripts/vault", files: 6, lines: 2400, bytes: 88000 },
  ],
  tests: { unit: 142, e2e: 10 },
  data: [
    { file: "games.json", records: 640, bytes: 410000 },
    { file: "inventory.json", records: 702, bytes: 520000 },
    { file: "orders.json", records: 188, bytes: 160000 },
    { file: "price_observations.json", records: 1310, bytes: 380000 },
  ],
  backups: 64,
  catalog: [
    { platform: "ds", entries: 6400, withSource: 6100, bytes: 1300000 },
    { platform: "3ds", entries: 1400, withSource: 1300, bytes: 300000 },
    { platform: "switch", entries: 1738, withSource: 1700, bytes: 420000 },
  ],
  assets: { covers: { files: 603, bytes: 9800000, withHiResSource: 507 }, catalogCovers: { files: 35305, bytes: 412000000 } },
  build: { files: 182, bytes: 14200000, js: { files: 34, bytes: 820000 }, css: { files: 1, bytes: 42000 }, pages: 11 },
  cloudflare: {
    d1: { database_size: 3_400_000, num_tables: 9, running_in_region: "WEUR", read_queries_24h: 840, write_queries_24h: 31, rows_read_24h: 61000, rows_written_24h: 94, created_at: "2026-10-09" },
    pagesDeployments: 27,
  },
};

export const DEMO_DEV_LIVE = {
  measuredAt: "2026-10-12T09:20:00.000Z",
  queryMs: 38,
  tables: [
    { name: "games", rows: 640, bytes: 410000 },
    { name: "inventory", rows: 702, bytes: 520000 },
    { name: "orders", rows: 188, bytes: 160000 },
    { name: "change_log", rows: 1204, bytes: 290000 },
  ],
  sqlite: "3.45.0",
  lastChangeAt: "2026-10-12T09:14:00.000Z",
  webChanges: 96,
};
