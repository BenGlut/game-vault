/**
 * Statistiques de la collection — module pur : mêmes chiffres pour le tableau de
 * bord, la page Statistiques et les tests.
 */
import type { Game, GameQuotes, InventoryItem, Order, Platform } from "./schema";
import { gameState, isOwned, stillWanted, type GameState } from "./collection";
import { referenceValue } from "./quotes";

export interface GameRow {
  game: Game;
  items: InventoryItem[];
  platform: Platform | undefined;
  quotes: GameQuotes | undefined;
  state: GameState;
  ownedCount: number;
  /** cote de référence × exemplaires possédés (null sans cote) */
  value: number | null;
  /** prix payés des exemplaires possédés */
  cost: number;
  /** date d'arrivée la plus récente d'un exemplaire possédé */
  lastAcquired: string | null;
}

export interface VaultSlice {
  games: Game[];
  inventory: InventoryItem[];
  orders: Order[];
  platforms: Platform[];
  quotes: Map<string, GameQuotes>;
}

export function buildRows(v: VaultSlice): GameRow[] {
  const byGame = new Map<string, InventoryItem[]>();
  for (const i of v.inventory) byGame.set(i.gameId, [...(byGame.get(i.gameId) ?? []), i]);
  const platforms = new Map(v.platforms.map((p) => [p.id, p]));
  return v.games.map((game) => {
    const items = byGame.get(game.id) ?? [];
    const owned = items.filter(isOwned);
    const quotes = v.quotes.get(game.id);
    const values = owned.map((i) => referenceValue(quotes, i.completeness));
    const known = values.filter((x): x is number => x !== null);
    return {
      game,
      items,
      platform: platforms.get(game.platformId),
      quotes,
      state: gameState(items),
      ownedCount: owned.length,
      value: known.length ? known.reduce((s, x) => s + x, 0) : null,
      cost: owned.reduce((s, i) => s + (i.purchasePrice?.amount ?? 0), 0),
      lastAcquired: owned.map((i) => i.acquiredAt ?? "").sort().pop() || null,
    };
  });
}

const LIVE_ORDER = (o: Order) => o.status !== "cancelled" && o.status !== "refunded";

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** Mois consécutifs AAAA-MM de `from` à `to` inclus. */
export function monthRange(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number) as [number, number];
  const [ty, tm] = to.split("-").map(Number) as [number, number];
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function monthLabel(key: string, withYear = false): string {
  const [y, m] = key.split("-");
  const label = MONTHS_FR[Number(m) - 1] ?? key;
  return withYear ? `${label} ${y}` : label;
}

export interface MonthPoint {
  month: string;
  /** dépensé dans le mois (commandes non annulées) */
  spent: number;
  orders: number;
  /** exemplaires arrivés dans le mois */
  acquired: number;
  /** exemplaires possédés en fin de mois */
  ownedTotal: number;
  /** dépensé cumulé en fin de mois */
  spentTotal: number;
  /** valeur (cote actuelle) des exemplaires possédés en fin de mois */
  valueTotal: number;
}

export interface Breakdown {
  key: string;
  label: string;
  count: number;
  value: number;
}

export interface CollectionStats {
  rows: GameRow[];
  ownedGames: number;
  ownedItems: number;
  ownedHardware: number;
  wishlist: number;
  wishlistHigh: number;
  incomingOrders: Order[];
  incomingAmount: number;
  collectionValue: number;
  valuedItems: number;
  costOfOwned: number;
  pricedItems: number;
  spentTotal: number;
  spent12m: number;
  ordersCount: number;
  shippingTotal: number;
  avgItemPrice: number | null;
  needsReview: number;
  withoutQuote: number;
  duplicates: number;
  months: MonthPoint[];
  byPlatform: (Breakdown & { platformId: string; wanted: number })[];
  byCompleteness: Breakdown[];
  byCondition: Breakdown[];
  byMarketplace: Breakdown[];
  topSellers: { name: string; orders: number; spent: number }[];
  topValue: GameRow[];
  bestGains: { row: GameRow; item: InventoryItem; value: number; gain: number }[];
  recent: GameRow[];
}

export function computeStats(
  v: VaultSlice & { sellers?: { id: string; name: string }[] },
  today = new Date().toISOString().slice(0, 10),
): CollectionStats {
  const rows = buildRows(v);
  const games = rows.filter((r) => r.game.kind !== "hardware");
  const ownedRows = games.filter((r) => r.ownedCount > 0);
  const ownedItems = games.flatMap((r) => r.items.filter(isOwned).map((item) => ({ row: r, item })));
  const liveOrders = v.orders.filter(LIVE_ORDER);
  const incomingOrders = v.orders
    .filter((o) => o.status === "ordered" || o.status === "fulfilled")
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));

  // valeur et coût, exemplaire par exemplaire
  let collectionValue = 0;
  let valuedItems = 0;
  let costOfOwned = 0;
  let pricedItems = 0;
  const gains: CollectionStats["bestGains"] = [];
  for (const { row, item } of ownedItems) {
    const value = referenceValue(row.quotes, item.completeness);
    if (value !== null) {
      collectionValue += value;
      valuedItems++;
    }
    if (item.purchasePrice) {
      costOfOwned += item.purchasePrice.amount;
      pricedItems++;
      if (value !== null) gains.push({ row, item, value, gain: value - item.purchasePrice.amount });
    }
  }

  // séries mensuelles : du premier mois documenté jusqu'au mois courant
  const dated = [
    ...liveOrders.map((o) => o.orderedAt),
    ...ownedItems.map(({ item }) => item.acquiredAt).filter((d): d is string => !!d),
  ].sort();
  const currentMonth = monthKey(today);
  const firstMonth = dated[0] ? monthKey(dated[0]) : currentMonth;
  const keys = monthRange(firstMonth, currentMonth);
  const undatedOwned = ownedItems.filter(({ item }) => !item.acquiredAt);
  let ownedRunning = undatedOwned.length;
  let valueRunning = undatedOwned.reduce((s, { row, item }) => s + (referenceValue(row.quotes, item.completeness) ?? 0), 0);
  let spentRunning = 0;
  const months: MonthPoint[] = keys.map((month) => {
    const monthOrders = liveOrders.filter((o) => monthKey(o.orderedAt) === month);
    const arrived = ownedItems.filter(({ item }) => item.acquiredAt && monthKey(item.acquiredAt) === month);
    const spent = monthOrders.reduce((s, o) => s + (o.totalPaid ?? 0), 0);
    ownedRunning += arrived.length;
    valueRunning += arrived.reduce((s, { row, item }) => s + (referenceValue(row.quotes, item.completeness) ?? 0), 0);
    spentRunning += spent;
    return {
      month,
      spent: round(spent),
      orders: monthOrders.length,
      acquired: arrived.length,
      ownedTotal: ownedRunning,
      spentTotal: round(spentRunning),
      valueTotal: round(valueRunning),
    };
  });

  const yearAgo = monthRange(firstMonth, currentMonth).slice(-12)[0] ?? currentMonth;
  const spent12m = liveOrders.filter((o) => monthKey(o.orderedAt) >= yearAgo).reduce((s, o) => s + (o.totalPaid ?? 0), 0);
  const orderItems = liveOrders.reduce((s, o) => s + o.items.length, 0);
  const spentTotal = liveOrders.reduce((s, o) => s + (o.totalPaid ?? 0), 0);

  // répartitions
  const platformMap = new Map<string, CollectionStats["byPlatform"][number]>();
  for (const r of games) {
    const entry = platformMap.get(r.game.platformId) ?? {
      key: r.game.platformId,
      platformId: r.game.platformId,
      label: r.platform?.shortName ?? r.game.platformId,
      count: 0,
      value: 0,
      wanted: 0,
    };
    entry.count += r.ownedCount;
    entry.value += r.value ?? 0;
    if (r.state === "wanted") entry.wanted++;
    platformMap.set(r.game.platformId, entry);
  }
  const byPlatform = [...platformMap.values()]
    .filter((p) => p.count > 0 || p.wanted > 0)
    .map((p) => ({ ...p, value: round(p.value) }))
    .sort((a, b) => b.count - a.count || b.wanted - a.wanted);

  const tally = (pick: (item: InventoryItem) => string, labels: Record<string, string>): Breakdown[] => {
    const m = new Map<string, Breakdown>();
    for (const { row, item } of ownedItems) {
      const key = pick(item);
      const b = m.get(key) ?? { key, label: labels[key] ?? key, count: 0, value: 0 };
      b.count++;
      b.value += referenceValue(row.quotes, item.completeness) ?? 0;
      m.set(key, b);
    }
    return [...m.values()].map((b) => ({ ...b, value: round(b.value) })).sort((a, b) => b.count - a.count);
  };

  const marketplaceMap = new Map<string, Breakdown>();
  for (const o of liveOrders) {
    const b = marketplaceMap.get(o.marketplace) ?? { key: o.marketplace, label: o.marketplace, count: 0, value: 0 };
    b.count++;
    b.value += o.totalPaid ?? 0;
    marketplaceMap.set(o.marketplace, b);
  }

  const sellerNames = new Map((v.sellers ?? []).map((s) => [s.id, s.name]));
  const sellerMap = new Map<string, { name: string; orders: number; spent: number }>();
  for (const o of liveOrders) {
    if (!o.sellerId) continue;
    const s = sellerMap.get(o.sellerId) ?? { name: sellerNames.get(o.sellerId) ?? o.sellerId, orders: 0, spent: 0 };
    s.orders++;
    s.spent += o.totalPaid ?? 0;
    sellerMap.set(o.sellerId, s);
  }

  return {
    rows,
    ownedGames: ownedRows.length,
    ownedItems: ownedItems.length,
    ownedHardware: rows.filter((r) => r.game.kind === "hardware" && r.ownedCount > 0).length,
    wishlist: games.filter((r) => stillWanted(r.items)).length,
    wishlistHigh: games.filter((r) => stillWanted(r.items) && r.game.buyPriority === "haute").length,
    incomingOrders,
    incomingAmount: round(incomingOrders.reduce((s, o) => s + (o.totalPaid ?? 0), 0)),
    collectionValue: round(collectionValue),
    valuedItems,
    costOfOwned: round(costOfOwned),
    pricedItems,
    spentTotal: round(spentTotal),
    spent12m: round(spent12m),
    ordersCount: liveOrders.length,
    shippingTotal: round(liveOrders.reduce((s, o) => s + (o.shippingCost ?? 0) + (o.buyerProtection ?? 0), 0)),
    avgItemPrice: orderItems ? round(spentTotal / orderItems) : null,
    needsReview: games.filter((r) => r.items.some((i) => isOwned(i) && i.verificationStatus === "needs_review")).length,
    withoutQuote: ownedRows.filter((r) => r.value === null).length,
    duplicates: ownedRows.filter((r) => r.ownedCount > 1).length,
    months,
    byPlatform,
    byCompleteness: tally((i) => i.completeness, COMPLETENESS_SHORT),
    byCondition: tally((i) => i.condition, CONDITION_SHORT),
    byMarketplace: [...marketplaceMap.values()].map((b) => ({ ...b, value: round(b.value) })).sort((a, b) => b.value - a.value),
    topSellers: [...sellerMap.values()]
      .map((s) => ({ ...s, spent: round(s.spent) }))
      .sort((a, b) => b.orders - a.orders || b.spent - a.spent)
      .slice(0, 8),
    topValue: [...ownedRows].filter((r) => r.value !== null).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).slice(0, 12),
    bestGains: gains.sort((a, b) => b.gain - a.gain).slice(0, 10),
    recent: [...ownedRows]
      .filter((r) => r.lastAcquired)
      .sort((a, b) => (b.lastAcquired ?? "").localeCompare(a.lastAcquired ?? ""))
      .slice(0, 12),
  };
}

export const COMPLETENESS_SHORT: Record<string, string> = {
  CIB: "Complet",
  loose: "Loose",
  no_manual: "Sans notice",
  box_only: "Boîte seule",
  sealed: "Blister",
  code_in_box: "Code",
  unknown: "Non renseigné",
};

export const CONDITION_SHORT: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  very_good: "Très bon",
  good: "Bon",
  acceptable: "Acceptable",
  poor: "Abîmé",
  unknown: "Non renseigné",
};

export const MARKETPLACE_LABELS: Record<string, string> = {
  vinted: "Vinted",
  leboncoin: "Leboncoin",
  ebay: "eBay",
  amazon: "Amazon",
  cdiscount: "Cdiscount",
  rakuten: "Rakuten",
  retro_shop: "Boutique rétro",
  in_person: "En main propre",
  other: "Autre",
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
