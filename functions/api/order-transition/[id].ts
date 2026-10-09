import { json, type PagesFunction } from "../../../src/server/cf";
import { handle, readBody } from "../../../src/server/handler";
import { transitionOrder } from "../../../src/server/store";

/** POST { action: fulfill|deliver|cancel|refund, date: AAAA-MM-JJ } */
export const onRequestPost: PagesFunction<"id"> = ({ env, params, request }) =>
  handle(async () => {
    const body = (await readBody(request)) as { action?: unknown; date?: unknown };
    return json(await transitionOrder(env.DB, params.id, String(body.action), String(body.date)));
  });
