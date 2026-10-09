import { json, type PagesFunction } from "../../../src/server/cf";
import { changeMessage, handle, readBody } from "../../../src/server/handler";
import { collection, createRecord, listRecords } from "../../../src/server/store";

export const onRequestGet: PagesFunction<"collection"> = ({ env, params }) =>
  handle(async () => json(await listRecords(env.DB, collection(params.collection))));

export const onRequestPost: PagesFunction<"collection"> = ({ env, params, request }) =>
  handle(async () => {
    const def = collection(params.collection);
    return json(await createRecord(env.DB, def, await readBody(request), changeMessage(request)), 201);
  });
