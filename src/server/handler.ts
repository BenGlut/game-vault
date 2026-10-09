import { json } from "./cf";
import { ApiError } from "./store";

/** Turns ApiError into a JSON error response; anything else is a 500. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError) return json({ error: e.message }, e.status);
    return json({ error: e instanceof Error ? e.message : "Erreur inattendue" }, 500);
  }
}

/** Optional change-log message sent by the client (URI-encoded header). */
export function changeMessage(request: Request): string | undefined {
  const raw = request.headers.get("x-gv-message");
  return raw ? decodeURIComponent(raw) : undefined;
}

export async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Corps JSON invalide");
  }
}
