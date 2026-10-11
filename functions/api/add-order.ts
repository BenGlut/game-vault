import { json, type PagesFunction } from "../../src/server/cf";
import { handle, readBody } from "../../src/server/handler";
import { addOrder, type Actor } from "../../src/server/store";

/**
 * POST { marketplace, items: [{ gameId, unitPrice }], seller?, reference?, total?,
 * shipping?, protection?, discount?, date?, eta?, notes? } — même règles que
 * `pnpm vault add-order`, en un seul batch.
 */
export const onRequestPost: PagesFunction = ({ env, request, data }) =>
  handle(async () => json(await addOrder(env.DB, await readBody(request), data.actor as Actor), 201));
