/**
 * Minimal Cloudflare Pages Functions / D1 types — just what GameVault uses, so the
 * root tsconfig (dom lib) typechecks `functions/` without @cloudflare/workers-types.
 */

export interface D1Result<T> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result<unknown>[]>;
}

export interface Env {
  DB: D1Database;
  /** OAuth web client id from Google Cloud — public, set in wrangler.toml [vars]. */
  GOOGLE_CLIENT_ID: string;
  /** Secrets (wrangler pages secret put). */
  ALLOWED_EMAIL: string;
  SESSION_SECRET: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export interface Context<P extends string = never> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  next(): Promise<Response>;
  data: Record<string, unknown>;
}

export type PagesFunction<P extends string = never> = (ctx: Context<P>) => Promise<Response> | Response;

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}
