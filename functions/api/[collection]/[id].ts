import { json, type PagesFunction } from "../../../src/server/cf";
import { changeMessage, handle, readBody } from "../../../src/server/handler";
import { ApiError, collection, deleteRecord, getRecord, replaceRecord } from "../../../src/server/store";

type P = "collection" | "id";

export const onRequestGet: PagesFunction<P> = ({ env, params }) =>
  handle(async () => {
    const rec = await getRecord(env.DB, collection(params.collection), params.id);
    if (!rec) throw new ApiError(404, `Introuvable : ${params.id}`);
    return json(rec);
  });

export const onRequestPut: PagesFunction<P> = ({ env, params, request }) =>
  handle(async () => {
    const def = collection(params.collection);
    return json(await replaceRecord(env.DB, def, params.id, await readBody(request), changeMessage(request)));
  });

export const onRequestDelete: PagesFunction<P> = ({ env, params, request }) =>
  handle(async () => {
    await deleteRecord(env.DB, collection(params.collection), params.id, changeMessage(request));
    return json({ ok: true });
  });
