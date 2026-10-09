/**
 * Session GameVault : connexion Google (ID token vérifié auprès de Google), puis
 * cookie signé HMAC-SHA256. Une seule adresse autorisée (secret ALLOWED_EMAIL).
 */
import type { Env } from "./cf";

export const SESSION_COOKIE = "gv_session";
const SESSION_DAYS = 30;

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

interface Session {
  email: string;
  exp: number;
}

export async function createSessionCookie(env: Env, email: string): Promise<string> {
  const session: Session = { email, exp: Date.now() + SESSION_DAYS * 86_400_000 };
  const payload = b64url(enc.encode(JSON.stringify(session)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET), enc.encode(payload)));
  const maxAge = SESSION_DAYS * 86_400;
  return `${SESSION_COOKIE}=${payload}.${b64url(sig)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** Adresse de la session si le cookie est valide, non expiré et toujours autorisé. */
export async function sessionEmail(request: Request, env: Env): Promise<string | null> {
  const raw = readCookie(request, SESSION_COOKIE);
  if (!raw || !env.SESSION_SECRET) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env.SESSION_SECRET),
      fromB64url(sig),
      enc.encode(payload),
    );
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Session;
    if (session.exp < Date.now() || !isAllowed(env, session.email)) return null;
    return session.email;
  } catch {
    return null;
  }
}

function isAllowed(env: Env, email: string): boolean {
  return email.toLowerCase() === (env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
}

/**
 * Vérifie un ID token Google via le point tokeninfo (signature, expiration et
 * émetteur contrôlés par Google), puis l'audience et l'adresse autorisée.
 */
export async function verifyGoogleCredential(env: Env, credential: string): Promise<string | null> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!res.ok) return null;
  const claims = (await res.json()) as { aud?: string; iss?: string; email?: string; email_verified?: string };
  if (claims.aud !== env.GOOGLE_CLIENT_ID) return null;
  if (claims.iss !== "accounts.google.com" && claims.iss !== "https://accounts.google.com") return null;
  if (claims.email_verified !== "true" || !claims.email || !isAllowed(env, claims.email)) return null;
  return claims.email;
}
