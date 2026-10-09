/**
 * Client de l'API privée (Cloudflare Pages Functions + D1). Le cookie de session
 * part tout seul ; l'en-tête x-gv-request est exigé par le middleware sur les écritures.
 */
import type {
  ChangeLogEntry,
  Game,
  InventoryItem,
  Order,
  Platform,
  PriceObservation,
  Seller,
} from "@/lib/schema";

export class ApiFailure extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(method: string, path: string, body?: unknown, message?: string): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (method !== "GET") headers["x-gv-request"] = "1";
  if (body !== undefined) headers["content-type"] = "application/json";
  if (message) headers["x-gv-message"] = encodeURIComponent(message);
  const res = await fetch(`/api/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiFailure(res.status, data.error ?? `Erreur ${res.status}`);
  return data as T;
}

export interface VaultData {
  games: Game[];
  inventory: InventoryItem[];
  orders: Order[];
  platforms: Platform[];
  sellers: Seller[];
  priceObservations: PriceObservation[];
  changeLog: ChangeLogEntry[];
}

export const api = {
  vault: () => call<VaultData>("GET", "vault"),
  create: <T>(collection: string, record: T, message?: string) => call<T>("POST", collection, record, message),
  replace: <T extends { id: string }>(collection: string, record: T, message?: string) =>
    call<T>("PUT", `${collection}/${encodeURIComponent(record.id)}`, record, message),
  remove: (collection: string, id: string, message?: string) =>
    call<{ ok: true }>("DELETE", `${collection}/${encodeURIComponent(id)}`, undefined, message),
  transitionOrder: (id: string, action: string, date: string) =>
    call<{ order: Order; inventory: InventoryItem[] }>("POST", `order-transition/${encodeURIComponent(id)}`, {
      action,
      date,
    }),
  changeLog: () => call<ChangeLogEntry[]>("GET", "change-log"),
  logout: () => call<{ ok: true }>("POST", "auth/logout", {}),
};
