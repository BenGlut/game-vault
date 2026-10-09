/**
 * D1 access for the API. Every record is validated by its Zod schema before
 * writing, referential links are checked, and each write appends a change-log
 * row in the same batch (atomic in D1).
 */
import type { D1Database, D1PreparedStatement } from "./cf";
import { CHANGE_LOG, COLLECTIONS, type CollectionDef } from "./collections";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function collection(name: string): CollectionDef {
  const def = COLLECTIONS[name];
  if (!def) throw new ApiError(404, `Collection inconnue : ${name}`);
  return def;
}

export async function listRecords(db: D1Database, def: CollectionDef): Promise<unknown[]> {
  const { results } = await db.prepare(`SELECT data FROM ${def.table} ORDER BY rowid`).all<{ data: string }>();
  return results.map((r) => JSON.parse(r.data));
}

export async function getRecord(db: D1Database, def: CollectionDef, id: string): Promise<unknown | null> {
  const row = await db.prepare(`SELECT data FROM ${def.table} WHERE id = ?`).bind(id).first<{ data: string }>();
  return row ? JSON.parse(row.data) : null;
}

async function exists(db: D1Database, table: string, id: string): Promise<boolean> {
  return (await db.prepare(`SELECT 1 AS x FROM ${table} WHERE id = ?`).bind(id).first()) !== null;
}

async function count(db: D1Database, sql: string, id: string): Promise<number> {
  const row = await db.prepare(sql).bind(id).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Links Zod cannot see: the referenced rows must exist. */
async function checkReferences(db: D1Database, def: CollectionDef, rec: Record<string, unknown>): Promise<void> {
  const missing: string[] = [];
  if (def.table === "games" && !(await exists(db, "platforms", rec.platformId as string))) {
    missing.push(`plateforme ${rec.platformId as string}`);
  }
  if (def.table === "inventory" || def.table === "price_observations") {
    if (!(await exists(db, "games", rec.gameId as string))) missing.push(`jeu ${rec.gameId as string}`);
  }
  if (def.table === "inventory" && rec.orderId && !(await exists(db, "orders", rec.orderId as string))) {
    missing.push(`commande ${rec.orderId as string}`);
  }
  if (def.table === "orders") {
    for (const item of rec.items as { gameId: string }[]) {
      if (!(await exists(db, "games", item.gameId))) missing.push(`jeu ${item.gameId}`);
    }
  }
  if (missing.length) throw new ApiError(422, `Référence introuvable : ${missing.join(", ")}`);
}

/** Rows that still point at a record about to be deleted. */
async function checkNotReferenced(db: D1Database, def: CollectionDef, id: string): Promise<void> {
  let n = 0;
  if (def.table === "games") {
    n += await count(db, "SELECT count(*) AS n FROM inventory WHERE game_id = ?", id);
    n += await count(
      db,
      "SELECT count(*) AS n FROM orders, json_each(orders.data, '$.items') AS it WHERE json_extract(it.value, '$.gameId') = ?",
      id,
    );
  }
  if (def.table === "orders") n += await count(db, "SELECT count(*) AS n FROM inventory WHERE order_id = ?", id);
  if (def.table === "platforms") n += await count(db, "SELECT count(*) AS n FROM games WHERE platform_id = ?", id);
  if (n > 0) throw new ApiError(409, `Suppression refusée : ${n} enregistrement(s) y font encore référence`);
}

function logStatement(db: D1Database, def: CollectionDef, id: string, command: string, message: string): D1PreparedStatement {
  const at = new Date().toISOString();
  const entry = {
    id: `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at,
    actor: "web",
    command,
    message,
    affected: [{ file: def.file, ids: [id] }],
  };
  return db.prepare(`INSERT INTO ${CHANGE_LOG.table} (id, data) VALUES (?, ?)`).bind(entry.id, JSON.stringify(entry));
}

function validate(def: CollectionDef, body: unknown): Record<string, unknown> {
  const parsed = def.schema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`).join(" ; ");
    throw new ApiError(422, `Données invalides — ${detail}`);
  }
  return parsed.data as Record<string, unknown>;
}

/** Inventory rows carry their own timestamps; the server owns them. */
function stamp(def: CollectionDef, body: unknown, previous: Record<string, unknown> | null): unknown {
  if (def.table !== "inventory" || typeof body !== "object" || body === null) return body;
  const now = new Date().toISOString();
  return { ...body, createdAt: previous?.createdAt ?? (body as { createdAt?: string }).createdAt ?? now, updatedAt: now };
}

export async function createRecord(db: D1Database, def: CollectionDef, body: unknown, message?: string): Promise<unknown> {
  const rec = validate(def, stamp(def, body, null));
  const id = rec.id as string;
  if (await exists(db, def.table, id)) throw new ApiError(409, `Existe déjà : ${id}`);
  await checkReferences(db, def, rec);
  await db.batch([
    db.prepare(`INSERT INTO ${def.table} (id, data) VALUES (?, ?)`).bind(id, JSON.stringify(rec)),
    logStatement(db, def, id, `web create ${def.table}`, message ?? `Ajout en ligne : ${id}`),
  ]);
  return rec;
}

export async function replaceRecord(
  db: D1Database,
  def: CollectionDef,
  id: string,
  body: unknown,
  message?: string,
): Promise<unknown> {
  const previous = (await getRecord(db, def, id)) as Record<string, unknown> | null;
  if (!previous) throw new ApiError(404, `Introuvable : ${id}`);
  const rec = validate(def, stamp(def, body, previous));
  if (rec.id !== id) throw new ApiError(422, "L'identifiant ne peut pas changer");
  await checkReferences(db, def, rec);
  await db.batch([
    db.prepare(`UPDATE ${def.table} SET data = ? WHERE id = ?`).bind(JSON.stringify(rec), id),
    logStatement(db, def, id, `web update ${def.table}`, message ?? `Modification en ligne : ${id}`),
  ]);
  return rec;
}

export async function deleteRecord(db: D1Database, def: CollectionDef, id: string, message?: string): Promise<void> {
  if (!(await exists(db, def.table, id))) throw new ApiError(404, `Introuvable : ${id}`);
  await checkNotReferenced(db, def, id);
  await db.batch([
    db.prepare(`DELETE FROM ${def.table} WHERE id = ?`).bind(id),
    logStatement(db, def, id, `web delete ${def.table}`, message ?? `Suppression en ligne : ${id}`),
  ]);
}
