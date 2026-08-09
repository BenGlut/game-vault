#!/usr/bin/env tsx
/**
 * Migration v2 « mini-ERP » (one-off, idempotente) :
 *  1. Statuts simplifiés : shipped→fulfilled, received→delivered (commandes + inventaire),
 *     shippedAt→fulfilledAt, receivedAt→deliveredAt, + estimatedDeliveryAt (null).
 *  2. 1 article = 1 entrée de stock : toute entrée quantity N>1 est éclatée en
 *     N entrées quantity 1 (chaque exemplaire garde ses données, les copies
 *     supplémentaires sont annotées pour recevoir leurs propres données d'achat).
 *
 * Écrit directement les JSON (outil de migration de schéma) + entrée changelog.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_REPO = process.env.VAULT_DATA_DIR
  ? path.resolve(process.env.VAULT_DATA_DIR)
  : path.resolve(__dirname, "../../../game-vault-data");
const dataDir = path.join(DATA_REPO, "data");

const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
const write = (f: string, v: unknown) =>
  fs.writeFileSync(path.join(dataDir, f), JSON.stringify(v, null, 2) + "\n", "utf8");

const STATUS_MAP: Record<string, string> = { shipped: "fulfilled", received: "delivered" };

// --- 1. commandes -----------------------------------------------------------
const orders = read("orders.json");
let ordersTouched = 0;
for (const o of orders) {
  let touched = false;
  if (STATUS_MAP[o.status]) { o.status = STATUS_MAP[o.status]; touched = true; }
  if ("shippedAt" in o) { o.fulfilledAt = o.shippedAt; delete o.shippedAt; touched = true; }
  if ("receivedAt" in o) { o.deliveredAt = o.receivedAt; delete o.receivedAt; touched = true; }
  if (!("estimatedDeliveryAt" in o)) { o.estimatedDeliveryAt = null; touched = true; }
  if (touched) ordersTouched++;
}

// --- 2. inventaire : statuts + éclatement des quantités ---------------------
const inventory = read("inventory.json");
const existingIds = new Set(inventory.map((i: { id: string }) => i.id));
const splits: string[] = [];
const out: typeof inventory = [];
for (const item of inventory) {
  if (STATUS_MAP[item.status]) item.status = STATUS_MAP[item.status];
  const qty = item.quantity;
  if (qty <= 1) { out.push(item); continue; }
  // éclatement : la 1re entrée garde l'id, les suivantes prennent un suffixe libre
  item.quantity = 1;
  out.push(item);
  for (let n = 2; n <= qty; n++) {
    let suffix = 2;
    let id = `${item.id}-${suffix}`;
    while (existingIds.has(id)) { suffix++; id = `${item.id}-${suffix}`; }
    existingIds.add(id);
    out.push({
      ...structuredClone(item),
      id,
      quantity: 1,
      privateNotes: `Exemplaire n°${n} (éclaté depuis l'entrée quantité ×${qty} — données d'achat propres à renseigner)`,
    });
    splits.push(id);
  }
}

// --- 3. changelog ------------------------------------------------------------
const changeLog = read("change-log.json");
changeLog.push({
  id: `chg_migrate_erp_${Date.now().toString(36)}`,
  at: new Date().toISOString(),
  actor: "agent",
  command: "migrate-erp",
  message: `Migration ERP : statuts fulfilled/delivered + estimatedDeliveryAt ; ${splits.length} exemplaires éclatés en entrées individuelles`,
  affected: [
    { file: "orders.json", ids: [] },
    { file: "inventory.json", ids: splits },
  ],
});

write("orders.json", orders);
write("inventory.json", out);
write("change-log.json", changeLog);
console.log(JSON.stringify({ ok: true, ordersTouched, entriesBefore: inventory.length, entriesAfter: out.length, split: splits.length }, null, 2));
