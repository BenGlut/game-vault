/**
 * Everything on the Cloudflare deployment is private: without a valid session,
 * pages redirect to /connexion/ and the API answers 401. Writes must carry the
 * custom header `x-gv-request` (forces a CORS preflight, so no cross-site write).
 */
import { sessionEmail } from "../src/server/auth";
import { json, type PagesFunction } from "../src/server/cf";

const PUBLIC_PATHS = ["/connexion/", "/api/auth/login", "/api/auth/config", "/favicon.ico"];

export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  if (PUBLIC_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p))) return ctx.next();

  const email = await sessionEmail(ctx.request, ctx.env);
  if (!email) {
    if (url.pathname.startsWith("/api/")) return json({ error: "Connexion requise" }, 401);
    const next = encodeURIComponent(url.pathname + url.search);
    return Response.redirect(`${url.origin}/connexion/?next=${next}`, 302);
  }

  const write = !["GET", "HEAD", "OPTIONS"].includes(ctx.request.method);
  if (write && url.pathname.startsWith("/api/") && ctx.request.headers.get("x-gv-request") !== "1") {
    return json({ error: "En-tête x-gv-request manquant" }, 403);
  }

  ctx.data.email = email;
  const res = await ctx.next();
  // Private data must never land in a shared cache.
  const out = new Response(res.body, res);
  out.headers.set("cache-control", "private, no-store");
  out.headers.set("x-robots-tag", "noindex");
  return out;
};
