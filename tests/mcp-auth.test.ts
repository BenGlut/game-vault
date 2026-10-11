import { describe, expect, it } from "vitest";
import { mcpTokenValid, safeEqual } from "../src/server/auth";
import type { Env } from "../src/server/cf";

const TOKEN = "a".repeat(40);
const env = (token?: string) => ({ MCP_TOKEN: token }) as unknown as Env;
const req = (authorization?: string) =>
  new Request("https://gamevault.test/api/vault", { headers: authorization ? { authorization } : {} });

describe("safeEqual", () => {
  it("compare exactement", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("mcpTokenValid", () => {
  it("accepte le bon jeton Bearer", () => {
    expect(mcpTokenValid(req(`Bearer ${TOKEN}`), env(TOKEN))).toBe(true);
  });
  it("refuse un mauvais jeton ou un en-tête absent", () => {
    expect(mcpTokenValid(req(`Bearer ${"b".repeat(40)}`), env(TOKEN))).toBe(false);
    expect(mcpTokenValid(req(), env(TOKEN))).toBe(false);
    expect(mcpTokenValid(req(TOKEN), env(TOKEN))).toBe(false);
  });
  it("reste fermé sans secret ou avec un secret trop court", () => {
    expect(mcpTokenValid(req("Bearer "), env(undefined))).toBe(false);
    expect(mcpTokenValid(req("Bearer court"), env("court"))).toBe(false);
  });
});
