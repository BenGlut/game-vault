import { json, type PagesFunction } from "../../src/server/cf";
import { CHANGE_LOG } from "../../src/server/collections";

/** Les 200 dernières modifications, les plus récentes d'abord. */
export const onRequestGet: PagesFunction = async ({ env }) => {
  const { results } = await env.DB.prepare(`SELECT data FROM ${CHANGE_LOG.table} ORDER BY at DESC LIMIT 200`).all<{
    data: string;
  }>();
  return json(results.map((r) => JSON.parse(r.data)));
};
