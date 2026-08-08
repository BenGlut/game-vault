#!/usr/bin/env tsx
/**
 * CLI vault — seul point de mutation des données GameVault.
 * Chaque commande : validation Zod, détection de doublons, diff avant écriture,
 * --yes pour confirmer, écriture atomique, backup, changelog, sortie JSON.
 *
 * Usage: pnpm vault <commande> [options]
 */
import Fuse from "fuse.js";
import {
  loadVault,
  writeVault,
  backupVault,
  diffVault,
  integrityIssues,
  nowIso,
  today,
  type Vault,
  type FileDiff,
} from "./lib/store";
import { writePublicExport } from "./lib/publish";
import { parseArgs, optStr, optNum, optBool } from "./lib/args";
import { normalizeTitle, gameId as makeGameId } from "../../src/lib/normalize";
import {
  InventoryStatusSchema,
  MarketplaceSchema,
  RegionSchema,
  MediaTypeSchema,
  ConditionSchema,
  CompletenessSchema,
  POSSESSION_STATUSES,
  type Game,
  type InventoryItem,
  type Order,
} from "../../src/lib/schema";

interface CliResult {
  ok: boolean;
  command: string;
  dryRun?: boolean;
  diff?: FileDiff[];
  backup?: string | null;
  result?: unknown;
  warnings?: string[];
  error?: string;
  hint?: string;
}

function emit(r: CliResult): never {
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}

function findGame(v: Vault, ref: string): Game {
  const byId = v.games.find((g) => g.id === ref);
  if (byId) return byId;
  const norm = normalizeTitle(ref);
  const exact = v.games.filter((g) => g.normalizedTitle === norm || g.aliases.some((a) => normalizeTitle(a) === norm));
  if (exact.length === 1) return exact[0]!;
  if (exact.length > 1)
    throw new Error(`Référence ambiguë "${ref}": ${exact.map((g) => g.id).join(", ")} — utiliser l'id`);
  const fuse = new Fuse(v.games, {
    keys: ["normalizedTitle", "aliases", "canonicalTitle"],
    threshold: 0.3,
  });
  const hits = fuse.search(norm);
  if (hits.length === 1) return hits[0]!.item;
  if (hits.length > 1 && hits[0]!.score! < 0.08) return hits[0]!.item;
  if (hits.length > 0)
    throw new Error(
      `Jeu "${ref}" ambigu ou introuvable. Candidats: ${hits
        .slice(0, 5)
        .map((h) => `${h.item.id} (${h.item.canonicalTitle})`)
        .join(", ")}`,
    );
  throw new Error(`Jeu introuvable: "${ref}" — règle n°10 : ne jamais inventer un jeu absent`);
}

function findInventory(v: Vault, ref: string): InventoryItem {
  const byId = v.inventory.find((i) => i.id === ref);
  if (byId) return byId;
  const game = findGame(v, ref);
  const items = v.inventory.filter((i) => i.gameId === game.id);
  if (items.length === 1) return items[0]!;
  if (items.length > 1)
    throw new Error(`Plusieurs items d'inventaire pour ${game.id}: ${items.map((i) => i.id).join(", ")}`);
  throw new Error(`Aucun item d'inventaire pour ${game.id}`);
}

function findOrder(v: Vault, ref: string): Order {
  const o = v.orders.find((x) => x.id === ref || x.reference === ref);
  if (!o) throw new Error(`Commande introuvable: ${ref}`);
  return o;
}

/**
 * Exécute une mutation : diff, dry-run par défaut, backup + écriture si --yes.
 */
function runMutation(
  command: string,
  yes: boolean,
  message: string,
  mutate: (v: Vault) => { result: unknown; warnings?: string[]; affectedIds?: Record<string, string[]> },
): never {
  const before = loadVault();
  const after = structuredClone(before);
  const { result, warnings, affectedIds } = mutate(after);
  const diff = diffVault(before, after);
  if (diff.length === 0) {
    emit({ ok: true, command, dryRun: false, diff, result, warnings: [...(warnings ?? []), "aucun changement"] });
  }
  if (!yes) {
    emit({
      ok: true,
      command,
      dryRun: true,
      diff,
      result,
      warnings,
      hint: "Relancer avec --yes pour écrire",
    });
  }
  const backup = backupVault();
  writeVault(after, {
    actor: process.env.VAULT_ACTOR ?? "agent",
    command,
    message,
    affected: Object.entries(affectedIds ?? {}).map(([file, ids]) => ({ file, ids })),
  });
  emit({ ok: true, command, dryRun: false, diff, backup, result, warnings });
}

// ---------------------------------------------------------------- commandes

function cmdSearch(query: string, v: Vault): never {
  const fuse = new Fuse(v.games, {
    keys: [
      { name: "normalizedTitle", weight: 2 },
      { name: "aliases", weight: 1.5 },
      { name: "canonicalTitle", weight: 1 },
      { name: "franchise", weight: 0.5 },
    ],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
  });
  const hits = fuse.search(normalizeTitle(query)).slice(0, 15);
  const result = hits.map((h) => {
    const items = v.inventory.filter((i) => i.gameId === h.item.id);
    return {
      id: h.item.id,
      title: h.item.canonicalTitle,
      platform: h.item.platformId,
      franchise: h.item.franchise,
      score: Math.round((1 - (h.score ?? 0)) * 100) / 100,
      inventory: items.map((i) => ({
        id: i.id,
        status: i.status,
        quantity: i.quantity,
        verificationStatus: i.verificationStatus,
      })),
    };
  });
  emit({ ok: true, command: "search", result });
}

function main(): void {
  const [command, ...rest] = process.argv.slice(2);
  const { positionals, options } = parseArgs(rest);
  const yes = optBool(options, "yes");

  try {
    switch (command) {
      case "search": {
        const q = positionals.join(" ");
        if (!q) throw new Error('usage: pnpm vault search "titre"');
        cmdSearch(q, loadVault());
        break;
      }

      case "add-game": {
        const title = optStr(options, "title");
        const platform = optStr(options, "platform");
        if (!title || !platform) throw new Error("usage: pnpm vault add-game --title ... --platform ds|3ds|... [--region PAL-FR] [--media cartridge] [--franchise ...] [--aliases 'a|b'] [--edition ...] [--year 2015]");
        runMutation("add-game", yes, `add game ${title} (${platform})`, (v) => {
          if (!v.platforms.some((p) => p.id === platform)) throw new Error(`Plateforme inconnue: ${platform}`);
          const id = makeGameId(platform, title);
          const norm = normalizeTitle(title);
          const dup = v.games.find(
            (g) => g.platformId === platform && (g.id === id || g.normalizedTitle === norm),
          );
          if (dup && !optBool(options, "force"))
            throw new Error(`Doublon détecté: ${dup.id} (${dup.canonicalTitle}) — utiliser --force si édition réellement distincte`);
          const game: Game = {
            id,
            canonicalTitle: title,
            normalizedTitle: norm,
            aliases: optStr(options, "aliases")?.split("|").filter(Boolean) ?? [],
            franchise: optStr(options, "franchise") ?? null,
            platformId: platform,
            region: RegionSchema.parse(optStr(options, "region") ?? "PAL-FR"),
            languages: (optStr(options, "languages") ?? "fr").split(",").filter(Boolean),
            publisher: optStr(options, "publisher") ?? null,
            developer: optStr(options, "developer") ?? null,
            releaseYear: optNum(options, "year") ?? null,
            genres: optStr(options, "genres")?.split(",").filter(Boolean) ?? [],
            edition: optStr(options, "edition") ?? null,
            mediaType: MediaTypeSchema.parse(optStr(options, "media") ?? "cartridge"),
            externalIds: {},
          };
          v.games.push(game);
          return { result: game, affectedIds: { "games.json": [id] } };
        });
        break;
      }

      case "add-inventory": {
        const gameRef = optStr(options, "game");
        if (!gameRef) throw new Error("usage: pnpm vault add-inventory --game <id|titre> [--status owned] [--quantity 1] [--condition ...] [--completeness ...] [--price 20] [--acquired 2026-08-07] [--verified]");
        runMutation("add-inventory", yes, `add inventory for ${gameRef}`, (v) => {
          const game = findGame(v, gameRef);
          const status = InventoryStatusSchema.parse(optStr(options, "status") ?? "owned");
          const existing = v.inventory.filter((i) => i.gameId === game.id);
          const warnings: string[] = [];
          if (existing.length && !optBool(options, "force")) {
            throw new Error(
              `Item(s) déjà présent(s) pour ${game.id}: ${existing.map((i) => `${i.id} (${i.status} x${i.quantity})`).join(", ")} — augmenter la quantité via set-status/--force, ou marquer un doublon explicite`,
            );
          }
          const suffix = existing.length ? `-${existing.length + 1}` : "";
          const price = optNum(options, "price");
          const item: InventoryItem = {
            id: game.id.replace(/^game_/, "inv_") + suffix,
            gameId: game.id,
            status,
            quantity: optNum(options, "quantity") ?? 1,
            condition: ConditionSchema.parse(optStr(options, "condition") ?? "unknown"),
            completeness: CompletenessSchema.parse(optStr(options, "completeness") ?? "unknown"),
            purchasePrice:
              price !== undefined
                ? { amount: price, currency: "EUR", includesShipping: optBool(options, "includes-shipping") }
                : null,
            currentEstimate: null,
            verificationStatus: optBool(options, "verified") ? "verified" : "needs_review",
            quantityNeedsReview: optBool(options, "quantity-needs-review"),
            evidenceIds: [],
            orderId: null,
            privateNotes: optStr(options, "notes") ?? null,
            acquiredAt: optStr(options, "acquired") ?? null,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          v.inventory.push(item);
          return { result: item, warnings, affectedIds: { "inventory.json": [item.id] } };
        });
        break;
      }

      case "set-status": {
        const invRef = optStr(options, "inventory") ?? optStr(options, "game");
        const status = optStr(options, "status");
        if (!invRef || !status) throw new Error("usage: pnpm vault set-status --inventory <id|titre> --status owned|wishlist|... [--quantity N] [--condition ...] [--completeness ...] [--verified true|false]");
        runMutation("set-status", yes, `set ${invRef} -> ${status}`, (v) => {
          const item = v.inventory.find((i) => i.id === invRef) ?? findInventory(v, invRef);
          const newStatus = InventoryStatusSchema.parse(status);
          const warnings: string[] = [];
          if (item.orderId) {
            const order = v.orders.find((o) => o.id === item.orderId);
            if (order && ["cancelled", "refunded"].includes(order.status) && POSSESSION_STATUSES.includes(newStatus)) {
              throw new Error(
                `Règle n°5 : la commande ${order.id} est ${order.status} — cet item ne peut pas devenir "${newStatus}"`,
              );
            }
          }
          if (newStatus === "owned" && item.status === "ordered") {
            warnings.push("transition ordered->owned : préférer receive-order pour conserver la traçabilité");
          }
          item.status = newStatus;
          const q = optNum(options, "quantity");
          if (q !== undefined) item.quantity = q;
          const cond = optStr(options, "condition");
          if (cond) item.condition = ConditionSchema.parse(cond);
          const comp = optStr(options, "completeness");
          if (comp) item.completeness = CompletenessSchema.parse(comp);
          const verified = optStr(options, "verified");
          if (verified !== undefined) item.verificationStatus = verified === "true" ? "verified" : "needs_review";
          if (optStr(options, "quantity-reviewed") === "true") item.quantityNeedsReview = false;
          item.updatedAt = nowIso();
          return { result: item, warnings, affectedIds: { "inventory.json": [item.id] } };
        });
        break;
      }

      case "add-order": {
        const marketplace = optStr(options, "marketplace");
        const itemsSpec = optStr(options, "items");
        if (!marketplace || !itemsSpec)
          throw new Error('usage: pnpm vault add-order --marketplace vinted --items "game_id[:prix],game_id" [--total 25] [--shipping 4] [--protection 1.5] [--discount 2] [--seller nom] [--reference ...] [--date 2026-08-07]');
        runMutation("add-order", yes, `add order ${marketplace}`, (v) => {
          const mp = MarketplaceSchema.parse(marketplace);
          const orderId = `order_${Date.now().toString(36)}`;
          const parsedItems = itemsSpec.split(",").map((spec) => {
            const [ref, price] = spec.trim().split(":");
            const game = findGame(v, ref!);
            return { gameId: game.id, unitPrice: price ? Number(price) : null, quantity: 1, inventoryId: null as string | null };
          });
          const invIds: string[] = [];
          for (const it of parsedItems) {
            const wishlistItem = v.inventory.find((x) => x.gameId === it.gameId && x.status === "wishlist");
            if (wishlistItem) {
              wishlistItem.status = "ordered";
              wishlistItem.orderId = orderId;
              wishlistItem.updatedAt = nowIso();
              it.inventoryId = wishlistItem.id;
              invIds.push(wishlistItem.id);
            } else {
              const existing = v.inventory.filter((x) => x.gameId === it.gameId);
              const suffix = existing.length ? `-${existing.length + 1}` : "";
              const inv: InventoryItem = {
                id: it.gameId.replace(/^game_/, "inv_") + suffix,
                gameId: it.gameId,
                status: "ordered",
                quantity: 1,
                condition: "unknown",
                completeness: "unknown",
                purchasePrice: it.unitPrice !== null ? { amount: it.unitPrice, currency: "EUR" } : null,
                currentEstimate: null,
                verificationStatus: "needs_review",
                quantityNeedsReview: false,
                evidenceIds: [],
                orderId,
                privateNotes: null,
                acquiredAt: null,
                createdAt: nowIso(),
                updatedAt: nowIso(),
              };
              v.inventory.push(inv);
              it.inventoryId = inv.id;
              invIds.push(inv.id);
            }
          }
          let sellerId: string | null = null;
          const sellerName = optStr(options, "seller");
          if (sellerName) {
            const existing = v.sellers.find((s) => s.name === sellerName && s.marketplace === mp);
            if (existing) sellerId = existing.id;
            else {
              sellerId = `seller_${normalizeTitle(sellerName).replace(/\s+/g, "-")}`;
              v.sellers.push({ id: sellerId, name: sellerName, marketplace: mp, profileUrl: null, rating: null, privateNotes: null });
            }
          }
          const order: Order = {
            id: orderId,
            marketplace: mp,
            sellerId,
            reference: optStr(options, "reference") ?? null,
            status: "ordered",
            items: parsedItems,
            itemsTotal: parsedItems.every((i) => i.unitPrice !== null)
              ? parsedItems.reduce((s, i) => s + (i.unitPrice ?? 0), 0)
              : null,
            shippingCost: optNum(options, "shipping") ?? null,
            buyerProtection: optNum(options, "protection") ?? null,
            lotDiscount: optNum(options, "discount") ?? null,
            totalPaid: optNum(options, "total") ?? null,
            currency: "EUR",
            orderedAt: optStr(options, "date") ?? today(),
            shippedAt: null,
            receivedAt: null,
            cancelledAt: null,
            refundedAt: null,
            listingIds: [],
            evidenceIds: [],
            privateNotes: optStr(options, "notes") ?? null,
          };
          v.orders.push(order);
          return {
            result: order,
            affectedIds: { "orders.json": [orderId], "inventory.json": invIds },
          };
        });
        break;
      }

      case "ship-order":
      case "receive-order":
      case "cancel-order":
      case "refund-order": {
        const orderRef = optStr(options, "order") ?? positionals[0];
        if (!orderRef) throw new Error(`usage: pnpm vault ${command} --order <id> [--date YYYY-MM-DD]`);
        const date = optStr(options, "date") ?? today();
        runMutation(command, yes, `${command} ${orderRef}`, (v) => {
          const order = findOrder(v, orderRef);
          const invIds: string[] = [];
          const linked = v.inventory.filter((i) => i.orderId === order.id);
          const warnings: string[] = [];
          if (command === "ship-order") {
            if (order.status !== "ordered") warnings.push(`commande au statut ${order.status}, attendu ordered`);
            order.status = "shipped";
            order.shippedAt = date;
            for (const i of linked) { i.status = "shipped"; i.updatedAt = nowIso(); invIds.push(i.id); }
          } else if (command === "receive-order") {
            if (!["ordered", "shipped"].includes(order.status))
              throw new Error(`Impossible de recevoir une commande au statut ${order.status}`);
            order.status = "received";
            order.receivedAt = date;
            for (const i of linked) {
              i.status = "received";
              i.acquiredAt = date;
              i.verificationStatus = "verified"; // vu physiquement à la réception
              i.updatedAt = nowIso();
              invIds.push(i.id);
            }
          } else if (command === "cancel-order") {
            if (["received"].includes(order.status)) throw new Error("Commande déjà reçue — utiliser refund-order si remboursée");
            order.status = "cancelled";
            order.cancelledAt = date;
            for (const i of linked) {
              i.status = "cancelled"; // règle n°5 : jamais owned, reste dans l'historique
              i.updatedAt = nowIso();
              invIds.push(i.id);
            }
          } else {
            order.status = "refunded";
            order.refundedAt = date;
            for (const i of linked) { i.status = "refunded"; i.updatedAt = nowIso(); invIds.push(i.id); }
          }
          return { result: order, warnings, affectedIds: { "orders.json": [order.id], "inventory.json": invIds } };
        });
        break;
      }

      case "add-price": {
        const gameRef = optStr(options, "game");
        const source = optStr(options, "source");
        if (!gameRef || !source)
          throw new Error("usage: pnpm vault add-price --game <id|titre> --source ebay|manual|... [--low 20] [--median 25] [--high 30] [--url ...] [--date YYYY-MM-DD]");
        runMutation("add-price", yes, `price observation for ${gameRef}`, (v) => {
          const game = findGame(v, gameRef);
          const low = optNum(options, "low") ?? null;
          const median = optNum(options, "median") ?? null;
          const high = optNum(options, "high") ?? null;
          if (low === null && median === null && high === null) throw new Error("Fournir au moins --low, --median ou --high");
          const obs = {
            id: `price_${Date.now().toString(36)}_${game.id.slice(5, 20)}`,
            gameId: game.id,
            low,
            median,
            high,
            currency: "EUR",
            source,
            url: optStr(options, "url") ?? null,
            observedAt: optStr(options, "date") ?? today(),
            notes: optStr(options, "notes") ?? null,
          };
          v.priceObservations.push(obs);
          const invIds: string[] = [];
          if (median !== null || (low !== null && high !== null)) {
            const med = median ?? (low! + high!) / 2;
            for (const i of v.inventory.filter((x) => x.gameId === game.id)) {
              i.currentEstimate = {
                low: low ?? med,
                median: med,
                high: high ?? med,
                currency: "EUR",
                source,
                observedAt: obs.observedAt,
              };
              i.updatedAt = nowIso();
              invIds.push(i.id);
            }
          }
          return { result: obs, affectedIds: { "price-observations.json": [obs.id], "inventory.json": invIds } };
        });
        break;
      }

      case "validate": {
        const v = loadVault(); // lève si Zod échoue
        const issues = integrityIssues(v);
        emit({
          ok: issues.length === 0,
          command: "validate",
          result: {
            files: "zod OK",
            games: v.games.length,
            inventory: v.inventory.length,
            orders: v.orders.length,
            issues,
          },
          error: issues.length ? `${issues.length} problème(s) d'intégrité` : undefined,
        });
        break;
      }

      case "publish": {
        const v = loadVault();
        const issues = integrityIssues(v);
        if (issues.length && !optBool(options, "force"))
          emit({ ok: false, command: "publish", error: `Validation échouée, publication refusée (règle n°15): ${issues.join("; ")}` });
        const written = writePublicExport(v);
        emit({ ok: true, command: "publish", result: { written, note: "commit + push manuels ou via workflow git" } });
        break;
      }

      default:
        emit({
          ok: false,
          command: command ?? "(aucune)",
          error: "commande inconnue",
          hint: "commandes: search, add-game, add-inventory, set-status, add-order, ship-order, receive-order, cancel-order, refund-order, add-price, validate, publish",
        });
    }
  } catch (e) {
    emit({ ok: false, command: command ?? "?", error: e instanceof Error ? e.message : String(e) });
  }
}

main();
