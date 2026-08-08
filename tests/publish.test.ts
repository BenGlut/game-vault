import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Vérifie que l'export public ne fuit AUCUNE donnée sensible
 * (prix d'achat, vendeurs, références de commande, notes privées).
 */

const ROOT = path.resolve(__dirname, "..");
let scratch: string;
let publicDir: string;

beforeAll(() => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), "vault-publish-"));
  publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "vault-public-"));
  const env = { ...process.env, VAULT_DATA_DIR: scratch, VAULT_PUBLIC_DIR: publicDir };
  execFileSync("pnpm", ["exec", "tsx", "scripts/seed/generate-seed.ts", "--force"], { cwd: ROOT, env });
  execFileSync(
    "pnpm",
    [
      "exec", "tsx", "scripts/vault/index.ts",
      "add-order", "--marketplace", "vinted",
      "--items", "game_3ds_pokemon-x:12",
      "--total", "16.5", "--seller", "vendeur-secret", "--reference", "REF-PRIVEE-123",
      "--notes", "note tres privee", "--yes",
    ],
    { cwd: ROOT, env },
  );
  execFileSync("pnpm", ["exec", "tsx", "scripts/vault/index.ts", "publish"], { cwd: ROOT, env });
});

function readPublic(name: string): string {
  return fs.readFileSync(path.join(publicDir, name), "utf8");
}

describe("export public filtré", () => {
  it("ne contient aucun prix d'achat (purchase_price: false)", () => {
    const inv = JSON.parse(readPublic("inventory.json"));
    expect(inv.every((i: { purchasePrice: unknown }) => i.purchasePrice === null)).toBe(true);
    const orders = JSON.parse(readPublic("orders.json"));
    expect(orders.every((o: { totalPaid: unknown }) => o.totalPaid === null)).toBe(true);
  });

  it("ne contient ni vendeur, ni référence, ni note privée", () => {
    for (const f of ["inventory.json", "orders.json", "games.json", "stats.json", "change-log.json"]) {
      const raw = readPublic(f);
      expect(raw).not.toContain("vendeur-secret");
      expect(raw).not.toContain("REF-PRIVEE-123");
      expect(raw).not.toContain("note tres privee");
      expect(raw).not.toContain("privateNotes");
    }
  });

  it("contient les statuts et l'index de recherche", () => {
    const stats = JSON.parse(readPublic("stats.json"));
    expect(stats.totalGames).toBe(130);
    const index = JSON.parse(readPublic("search-index.json"));
    expect(index.length).toBe(130);
    expect(index[0]).toHaveProperty("n");
  });
});
