import { createSessionCookie, verifyGoogleCredential } from "../../../src/server/auth";
import { json, type PagesFunction } from "../../../src/server/cf";

/** POST { credential } (ID token Google) → cookie de session. */
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { credential?: unknown } | null;
  if (typeof body?.credential !== "string") return json({ error: "Jeton manquant" }, 400);
  const email = await verifyGoogleCredential(env, body.credential);
  if (!email) return json({ error: "Ce compte n'est pas autorisé" }, 403);
  return json({ email }, 200, { "set-cookie": await createSessionCookie(env, email) });
};
