#!/usr/bin/env tsx
/**
 * Serveur MCP GameVault (stdio) — donne à un agent l'accès à la base en ligne
 * sans passer par `pnpm d1 pull/push` : il parle directement à l'API de l'appli
 * Cloudflare avec un jeton dédié (secret MCP_TOKEN côté Pages).
 *
 * Chaque écriture passe par la même validation Zod et le même contrôle des
 * références que l'appli, et s'inscrit au journal avec l'auteur « mcp ».
 *
 * Configuration :
 *   GAMEVAULT_URL    défaut https://gamevault-ehn.pages.dev
 *   GAMEVAULT_TOKEN  ou, à défaut, le fichier ~/.config/gamevault/mcp-token (chmod 600)
 *
 * Lancement : node_modules/.bin/tsx scripts/mcp/server.ts (voir docs/mcp.md).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Fuse from "fuse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { normalizeTitle } from "../../src/lib/normalize";
import { quotesByGame } from "../../src/lib/quotes";
import { MarketplaceSchema, type Game, type InventoryItem, type Order, type PriceObservation } from "../../src/lib/schema";

const BASE_URL = (process.env.GAMEVAULT_URL ?? "https://gamevault-ehn.pages.dev").replace(/\/+$/, "");
const TOKEN_FILE = path.join(os.homedir(), ".config", "gamevault", "mcp-token");

function token(): string {
  const fromEnv = process.env.GAMEVAULT_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  try {
    return fs.readFileSync(TOKEN_FILE, "utf8").trim();
  } catch {
    throw new Error(`Jeton introuvable : définir GAMEVAULT_TOKEN ou créer ${TOKEN_FILE}`);
  }
}

async function api<T>(method: string, route: string, body?: unknown, message?: string): Promise<T> {
  const headers: Record<string, string> = { authorization: `Bearer ${token()}`, accept: "application/json" };
  if (method !== "GET") {
    headers["x-gv-request"] = "1";
    headers["content-type"] = "application/json";
    if (message) headers["x-gv-message"] = encodeURIComponent(message);
  }
  const res = await fetch(`${BASE_URL}/api/${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = (data as { error?: string } | null)?.error ?? text.slice(0, 300);
    throw new Error(`API ${res.status} sur ${method} /api/${route} : ${detail}`);
  }
  return data as T;
}

interface VaultData {
  games: Game[];
  inventory: InventoryItem[];
  orders: Order[];
  priceObservations: PriceObservation[];
}

const loadVault = () => api<VaultData>("GET", "vault");

const ok = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });

const POSSESSED = new Set(["owned", "delivered", "fulfilled"]);
const COLLECTION_NAMES = [
  "games",
  "inventory",
  "orders",
  "platforms",
  "sellers",
  "listings",
  "price-observations",
  "evidence",
] as const;

function gameRow(g: Game, v: VaultData, quotes: ReturnType<typeof quotesByGame>) {
  const items = v.inventory.filter((i) => i.gameId === g.id);
  const q = quotes.get(g.id);
  return {
    id: g.id,
    titre: g.canonicalTitle,
    plateforme: g.platformId,
    rang: g.qualityTier,
    exemplaires: items.map((i) => `${i.id} ${i.status} q${i.quantity}`),
    coteBoite: q?.cib?.median ?? null,
    coteLoose: q?.loose?.median ?? null,
  };
}

const server = new McpServer({ name: "gamevault", version: "1.0.0" });

server.registerTool(
  "search_games",
  {
    title: "Rechercher des jeux",
    description:
      "Recherche approximative dans les jeux de la base (titre, alias, fautes de frappe). Renvoie l'id, la plateforme, les exemplaires (wishlist, commandé, possédé…) et la cote boîte/loose.",
    inputSchema: {
      query: z.string().min(1).describe("Titre ou fragment, ex. « mansion 2 »"),
      platform: z.string().optional().describe("Filtre plateforme : switch, ds, 3ds, gamecube…"),
      limit: z.number().int().min(1).max(50).default(10),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ query, platform, limit }) => {
    const v = await loadVault();
    const quotes = quotesByGame(v.priceObservations);
    const pool = platform ? v.games.filter((g) => g.platformId === platform) : v.games;
    const fuse = new Fuse(pool, { keys: ["normalizedTitle", "aliases", "canonicalTitle"], threshold: 0.4, includeScore: true });
    const hits = fuse.search(normalizeTitle(query)).slice(0, limit);
    return ok(hits.map((h) => gameRow(h.item, v, quotes)));
  },
);

server.registerTool(
  "inspect",
  {
    title: "Inspecter une table",
    description:
      "Équivalent de `pnpm vault inspect` : liste filtrée des jeux, de l'inventaire ou des commandes, jointures faites.",
    inputSchema: {
      table: z.enum(["games", "inventory", "orders"]),
      match: z.string().optional().describe("Expression régulière sur le titre, l'id ou la référence"),
      status: z.string().optional().describe("wishlist, ordered, fulfilled, delivered, owned, cancelled, refunded…"),
      platform: z.string().optional(),
      tier: z.enum(["S", "A", "B", "C", "D"]).optional(),
      missing: z.boolean().optional().describe("Jeux : seulement ceux dont aucun exemplaire n'est possédé"),
      limit: z.number().int().min(1).max(500).default(100),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ table, match, status, platform, tier, missing, limit }) => {
    const v = await loadVault();
    const re = match ? new RegExp(match, "i") : null;
    const gameById = new Map(v.games.map((g) => [g.id, g]));
    let rows: unknown[];
    if (table === "games") {
      const quotes = quotesByGame(v.priceObservations);
      rows = v.games
        .filter(
          (g) =>
            (!re || re.test(`${g.canonicalTitle} ${g.aliases.join(" ")} ${g.id}`)) &&
            (!platform || g.platformId === platform) &&
            (!tier || g.qualityTier === tier) &&
            (!missing || !v.inventory.some((i) => i.gameId === g.id && POSSESSED.has(i.status))),
        )
        .map((g) => gameRow(g, v, quotes));
    } else if (table === "inventory") {
      rows = v.inventory
        .filter((i) => {
          const g = gameById.get(i.gameId);
          return (
            (!re || re.test(`${g?.canonicalTitle ?? ""} ${i.id}`)) &&
            (!status || i.status === status) &&
            (!platform || g?.platformId === platform) &&
            (!tier || g?.qualityTier === tier)
          );
        })
        .map((i) => ({
          id: i.id,
          titre: gameById.get(i.gameId)?.canonicalTitle ?? i.gameId,
          plateforme: gameById.get(i.gameId)?.platformId ?? null,
          statut: i.status,
          quantite: i.quantity,
          prix: i.purchasePrice?.amount ?? null,
          commande: i.orderId,
        }));
    } else {
      rows = v.orders
        .filter((o) => {
          const titles = o.items.map((it) => gameById.get(it.gameId)?.canonicalTitle ?? "").join(" ");
          return (!re || re.test(`${titles} ${o.reference ?? ""} ${o.id}`)) && (!status || o.status === status);
        })
        .map((o) => ({
          id: o.id,
          reference: o.reference,
          marketplace: o.marketplace,
          statut: o.status,
          date: o.orderedAt,
          total: o.totalPaid,
          articles: o.items.map((it) => gameById.get(it.gameId)?.canonicalTitle ?? it.gameId),
        }));
    }
    return ok({ table, n: rows.length, rows: rows.slice(0, limit) });
  },
);

server.registerTool(
  "get_record",
  {
    title: "Lire un enregistrement",
    description: "Enregistrement complet d'une collection par son id.",
    inputSchema: { collection: z.enum(COLLECTION_NAMES), id: z.string().min(1) },
    annotations: { readOnlyHint: true },
  },
  async ({ collection, id }) => ok(await api("GET", `${collection}/${encodeURIComponent(id)}`)),
);

server.registerTool(
  "add_order",
  {
    title: "Enregistrer une commande",
    description:
      "Équivalent de `pnpm vault add-order` : crée la commande, bascule la ligne wishlist de chaque jeu en « commandé » (ou crée une ligne), et le vendeur s'il est nouveau. Utiliser les ids de jeu renvoyés par search_games. Le total Vinted inclut port et protection.",
    inputSchema: {
      marketplace: MarketplaceSchema,
      items: z
        .array(z.object({ gameId: z.string().min(1), unitPrice: z.number().nonnegative().nullable().default(null) }))
        .min(1),
      seller: z.string().optional().describe("Pseudo du vendeur"),
      reference: z.string().optional().describe("Identifiant de transaction (Vinted : transaction_id)"),
      total: z.number().nonnegative().optional().describe("Total payé, port et protection compris"),
      shipping: z.number().nonnegative().optional(),
      protection: z.number().nonnegative().optional(),
      discount: z.number().nonnegative().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      eta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      notes: z.string().optional(),
    },
  },
  async (input) => ok(await api("POST", "add-order", input)),
);

server.registerTool(
  "transition_order",
  {
    title: "Changer le statut d'une commande",
    description:
      "fulfill = expédiée, deliver = reçue (en main), cancel = annulée, refund = remboursée. La commande et ses lignes d'inventaire bougent ensemble. Accepte l'id (order_…) ou la référence (ex. transaction Vinted).",
    inputSchema: {
      order: z.string().min(1).describe("Id ou référence de la commande"),
      action: z.enum(["fulfill", "deliver", "cancel", "refund"]),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("AAAA-MM-JJ, aujourd'hui par défaut"),
    },
  },
  async ({ order, action, date }) => {
    let id = order;
    if (!order.startsWith("order_")) {
      const v = await loadVault();
      const found = v.orders.find((o) => o.reference === order);
      if (!found) throw new Error(`Aucune commande avec la référence ${order}`);
      id = found.id;
    }
    const day = date ?? new Date().toISOString().slice(0, 10);
    return ok(await api("POST", `order-transition/${encodeURIComponent(id)}`, { action, date: day }));
  },
);

server.registerTool(
  "update_record",
  {
    title: "Modifier un enregistrement",
    description:
      "Lit l'enregistrement, fusionne les champs donnés (niveau racine), puis le réécrit. Validé par le même schéma que l'appli.",
    inputSchema: {
      collection: z.enum(COLLECTION_NAMES),
      id: z.string().min(1),
      changes: z.record(z.string(), z.unknown()).describe("Champs à remplacer, ex. { \"privateNotes\": \"…\" }"),
      message: z.string().optional().describe("Message pour le journal des modifications"),
    },
  },
  async ({ collection, id, changes, message }) => {
    const route = `${collection}/${encodeURIComponent(id)}`;
    const current = await api<Record<string, unknown>>("GET", route);
    return ok(await api("PUT", route, { ...current, ...changes }, message));
  },
);

server.registerTool(
  "create_record",
  {
    title: "Créer un enregistrement",
    description:
      "Crée un enregistrement complet (jeu, cote, ligne d'inventaire…). Pour une commande, préférer add_order.",
    inputSchema: {
      collection: z.enum(COLLECTION_NAMES),
      record: z.record(z.string(), z.unknown()),
      message: z.string().optional(),
    },
  },
  async ({ collection, record, message }) => ok(await api("POST", collection, record, message)),
);

server.registerTool(
  "change_log",
  {
    title: "Journal des modifications",
    description: "Dernières modifications de la base (web, mcp), les plus récentes d'abord.",
    inputSchema: { limit: z.number().int().min(1).max(200).default(20) },
    annotations: { readOnlyHint: true },
  },
  async ({ limit }) => ok((await api<unknown[]>("GET", "change-log")).slice(0, limit)),
);

server.connect(new StdioServerTransport()).catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
