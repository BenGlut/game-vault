/**
 * Historique lisible : les messages du journal sont écrits par l'agent et l'API avec
 * des identifiants techniques (order_…, inv_…, statuts anglais, dates ISO). On les
 * traduit en clair à l'affichage, sans toucher au journal lui-même.
 */
import type { ChangeLogEntry } from "./schema";
import { STATUS_LABELS } from "./labels";

export interface ActivityContext {
  /** id de commande → libellé (« Vinted chez chriss-reims ») et premier jeu */
  orders: Map<string, { label: string; gameId: string | null }>;
  /** id d'exemplaire → id de jeu */
  inventory: Map<string, string>;
  /** id de jeu → titre */
  titles: Map<string, string>;
}

const isoDate = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
const STATUS = "owned|ordered|fulfilled|delivered|wishlist|duplicate|sold|cancelled|refunded";
const TRANSITION = new RegExp(`\\b(${STATUS})\\s*(?:→|->)\\s*(${STATUS})\\b`, "g");
const statusFr = (s: string) => (STATUS_LABELS[s] ?? s).toLowerCase();

export function humanizeMessage(message: string, ctx: ActivityContext): string {
  return (
    message
      .replace(/\border_[a-z0-9]+\b/g, (id) => ctx.orders.get(id)?.label ?? "")
      .replace(/\binv_[a-z0-9_-]+\b/g, (id) => ctx.titles.get(ctx.inventory.get(id) ?? "") ?? id)
      .replace(/\bgame_[a-z0-9_-]+\b/g, (id) => ctx.titles.get(id) ?? id)
      // « delivered → fulfilled » : transitions de statut en clair
      .replace(TRANSITION, (_, from: string, to: string) => `${statusFr(from)} → ${statusFr(to)}`)
      .replace(isoDate, (_, y, m, d) => `${d}/${m}/${y}`)
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

/** Jeu à ouvrir depuis une ligne d'historique : jeu, exemplaire, ou premier jeu de la commande. */
export function activityGameId(entry: ChangeLogEntry, ctx: ActivityContext): string | null {
  const ids = [...entry.affected.flatMap((a) => a.ids), ...(entry.message.match(/\b(?:order|inv|game)_[a-z0-9_-]+\b/g) ?? [])];
  for (const id of ids) {
    if (ctx.titles.has(id)) return id;
    const viaItem = ctx.inventory.get(id);
    if (viaItem && ctx.titles.has(viaItem)) return viaItem;
    const viaOrder = ctx.orders.get(id)?.gameId;
    if (viaOrder && ctx.titles.has(viaOrder)) return viaOrder;
  }
  return null;
}
