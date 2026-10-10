import { json, type PagesFunction } from "../../src/server/cf";
import { CHANGE_LOG, COLLECTIONS } from "../../src/server/collections";

/**
 * Mesures de la base en direct pour la page « </> Dev » : lignes et octets par
 * table, version SQLite, dernière écriture. Uniquement des comptes, aucun contenu.
 */
export const onRequestGet: PagesFunction = async ({ env }) => {
  const tables = [...Object.values(COLLECTIONS).map((c) => c.table), CHANGE_LOG.table];
  const started = Date.now();
  const results = (await env.DB.batch([
    ...tables.map((t) => env.DB.prepare(`SELECT '${t}' AS name, count(*) AS rows, coalesce(sum(length(data)), 0) AS bytes FROM ${t}`)),
    // sqlite_version() est interdit par D1 : seules les tables et le journal sont mesurés
    env.DB.prepare(`SELECT max(at) AS at, sum(CASE WHEN json_extract(data, '$.actor') = 'web' THEN 1 ELSE 0 END) AS web FROM ${CHANGE_LOG.table}`),
  ])) as { results: Record<string, unknown>[] }[];
  return json({
    measuredAt: new Date().toISOString(),
    queryMs: Date.now() - started,
    tables: results.slice(0, tables.length).map((r) => r.results[0]),
    sqlite: null,
    lastChangeAt: results[tables.length]?.results[0]?.at ?? null,
    webChanges: results[tables.length]?.results[0]?.web ?? 0,
  });
};
