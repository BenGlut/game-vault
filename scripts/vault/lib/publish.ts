import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, type Vault } from "./store";
import { POSSESSION_STATUSES } from "../../../src/lib/schema";

/**
 * Export public filtré (repo privé = source de vérité, export = données filtrées).
 * Aucune donnée sensible ne doit sortir si le publish.config l'interdit.
 */
export function buildPublicExport(v: Vault): Record<string, unknown> {
  const p = v.publishConfig.publish;

  const games = v.games; // métadonnées de jeux : publiques par nature

  const inventory = v.inventory.map((i) => ({
    id: i.id,
    gameId: i.gameId,
    status: p.ownership_status ? i.status : undefined,
    quantity: i.quantity,
    condition: p.condition ? i.condition : undefined,
    completeness: p.condition ? i.completeness : undefined,
    purchasePrice: p.purchase_price ? i.purchasePrice : null,
    currentEstimate: p.estimates ? i.currentEstimate : null,
    verificationStatus: i.verificationStatus,
    quantityNeedsReview: i.quantityNeedsReview,
    acquiredAt: p.acquisition_date ? i.acquiredAt : null,
    orderId: i.orderId,
    updatedAt: i.updatedAt,
  }));

  const orders = v.orders.map((o) => ({
    id: o.id,
    marketplace: p.marketplace ? o.marketplace : "other",
    status: o.status,
    itemCount: o.items.reduce((n, it) => n + it.quantity, 0),
    gameIds: o.items.map((it) => it.gameId),
    orderedAt: o.orderedAt,
    shippedAt: o.shippedAt,
    receivedAt: o.receivedAt,
    cancelledAt: o.cancelledAt,
    refundedAt: o.refundedAt,
    totalPaid: p.purchase_price ? o.totalPaid : null,
  }));

  const changeLog = v.changeLog.slice(-500).map((c) => ({
    at: c.at,
    command: c.command,
    message: c.message,
  }));

  const owned = v.inventory.filter((i) => POSSESSION_STATUSES.includes(i.status));
  const estimateTotal = owned.reduce((sum, i) => sum + (i.currentEstimate?.median ?? 0) * i.quantity, 0);
  const stats = {
    generatedAt: new Date().toISOString(),
    totalGames: v.games.length,
    ownedItems: owned.reduce((n, i) => n + i.quantity, 0),
    byStatus: Object.fromEntries(
      [...new Set(v.inventory.map((i) => i.status))].map((s) => [
        s,
        v.inventory.filter((i) => i.status === s).reduce((n, i) => n + i.quantity, 0),
      ]),
    ),
    byPlatform: Object.fromEntries(
      v.platforms
        .map((pl) => [
          pl.id,
          v.games.filter((g) => g.platformId === pl.id).length,
        ])
        .filter(([, n]) => (n as number) > 0),
    ),
    needsReview: v.inventory.filter((i) => i.verificationStatus === "needs_review").length,
    estimateTotal: p.estimates ? Math.round(estimateTotal * 100) / 100 : null,
  };

  const searchIndex = v.games.map((g) => ({
    id: g.id,
    t: g.canonicalTitle,
    n: g.normalizedTitle,
    a: g.aliases,
    f: g.franchise,
    p: g.platformId,
  }));

  return {
    "games.json": games,
    "inventory.json": inventory,
    "orders.json": orders,
    "platforms.json": v.platforms,
    "change-log.json": changeLog,
    "stats.json": stats,
    "search-index.json": searchIndex,
  };
}

export function writePublicExport(v: Vault): string[] {
  // VAULT_PUBLIC_DIR permet aux tests d'écrire ailleurs que dans le vrai export
  const outDir = process.env.VAULT_PUBLIC_DIR
    ? path.resolve(process.env.VAULT_PUBLIC_DIR)
    : path.join(REPO_ROOT, "data", "public");
  fs.mkdirSync(outDir, { recursive: true });
  const files = buildPublicExport(v);
  const written: string[] = [];
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(outDir, name);
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify(content, null, 2) + "\n", "utf8");
    fs.renameSync(tmp, file);
    written.push(`data/public/${name}`);
  }
  return written;
}
