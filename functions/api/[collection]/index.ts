import { json, type PagesFunction } from "../../../src/server/cf";
import { changeMessage, handle, readBody } from "../../../src/server/handler";
import { collection, createRecord, listRecords, type Actor } from "../../../src/server/store";

export const onRequestGet: PagesFunction<"collection"> = ({ env, params }) =>
  handle(async () => json(await listRecords(env.DB, collection(params.collection))));

export const onRequestPost: PagesFunction<"collection"> = ({ env, params, request, data }) =>
  handle(async () => {
    const def = collection(params.collection);
    return json(
      await createRecord(env.DB, def, await readBody(request), changeMessage(request), data.actor as Actor),
      201,
    );
  });
