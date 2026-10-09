import { json, type PagesFunction } from "../../src/server/cf";
import { CHANGE_LOG, COLLECTIONS } from "../../src/server/collections";

/**
 * Toute la base en une requête (un seul batch D1) : l'application la charge au
 * démarrage puis la tient à jour localement après chaque écriture.
 */
export const onRequestGet: PagesFunction = async ({ env }) => {
  const keys = Object.keys(COLLECTIONS);
  const statements = [
    ...keys.map((k) => env.DB.prepare(`SELECT data FROM ${COLLECTIONS[k]!.table} ORDER BY rowid`)),
    env.DB.prepare(`SELECT data FROM ${CHANGE_LOG.table} ORDER BY at DESC LIMIT 300`),
  ];
  const results = (await env.DB.batch(statements)) as { results: { data: string }[] }[];
  const parse = (i: number) => (results[i]?.results ?? []).map((r) => JSON.parse(r.data));
  const body: Record<string, unknown> = {};
  keys.forEach((k, i) => {
    body[k === "price-observations" ? "priceObservations" : k] = parse(i);
  });
  body.changeLog = parse(keys.length);
  return json(body);
};
