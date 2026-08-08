import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Tests d'intégration de la CLI vault sur une copie jetable du repo de données.
 * Vérifie le cycle commande → annulation et les règles d'intégrité n°4 et n°5.
 */

const ROOT = path.resolve(__dirname, "..");
let scratch: string;

function vault(args: string[], expectFail = false): Record<string, unknown> {
  try {
    const out = execFileSync("pnpm", ["exec", "tsx", "scripts/vault/index.ts", ...args], {
      cwd: ROOT,
      env: { ...process.env, VAULT_DATA_DIR: scratch },
      encoding: "utf8",
    });
    return JSON.parse(out);
  } catch (e: unknown) {
    if (!expectFail) throw e;
    const err = e as { stdout?: string };
    return JSON.parse(err.stdout ?? "{}");
  }
}

beforeAll(() => {
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), "vault-test-"));
  execFileSync("pnpm", ["exec", "tsx", "scripts/seed/generate-seed.ts", "--force"], {
    cwd: ROOT,
    env: { ...process.env, VAULT_DATA_DIR: scratch },
  });
});

describe("vault validate", () => {
  it("le seed passe la validation complète", () => {
    const r = vault(["validate"]);
    expect(r.ok).toBe(true);
    const result = r.result as { games: number; issues: string[] };
    expect(result.games).toBe(130);
    expect(result.issues).toHaveLength(0);
  });
});

describe("vault search", () => {
  it("trouve Pokémon Lune via l'alias anglais", () => {
    const r = vault(["search", "pokemon moon"]);
    const hits = r.result as { id: string }[];
    expect(hits[0]?.id).toBe("game_3ds_pokemon-lune");
  });
  it("tolère les fautes mineures", () => {
    const r = vault(["search", "luigi mansion"]);
    const hits = r.result as { id: string }[];
    expect(hits.some((h) => h.id.includes("luigi-s-mansion"))).toBe(true);
  });
});

describe("vault add-game", () => {
  it("refuse un doublon (même titre normalisé, même plateforme)", () => {
    const r = vault(["add-game", "--title", "Pokemon Lune", "--platform", "3ds", "--yes"], true);
    expect(r.ok).toBe(false);
    expect(String(r.error)).toContain("Doublon");
  });
  it("dry-run par défaut sans --yes", () => {
    const r = vault(["add-game", "--title", "Mario Kart DS", "--platform", "ds"]);
    expect(r.ok).toBe(true);
    expect(r.dryRun).toBe(true);
    // rien écrit
    const games = JSON.parse(fs.readFileSync(path.join(scratch, "data/games.json"), "utf8"));
    expect(games.some((g: { id: string }) => g.id === "game_ds_mario-kart-ds")).toBe(false);
  });
  it("écrit avec --yes et journalise", () => {
    const r = vault(["add-game", "--title", "Mario Kart DS", "--platform", "ds", "--franchise", "Mario Kart", "--yes"]);
    expect(r.ok).toBe(true);
    const games = JSON.parse(fs.readFileSync(path.join(scratch, "data/games.json"), "utf8"));
    expect(games.some((g: { id: string }) => g.id === "game_ds_mario-kart-ds")).toBe(true);
    const log = JSON.parse(fs.readFileSync(path.join(scratch, "data/change-log.json"), "utf8"));
    expect(log[log.length - 1].command).toBe("add-game");
    // backup créé
    expect(fs.readdirSync(path.join(scratch, "backups")).length).toBeGreaterThan(0);
  });
});

describe("cycle de commande (règles n°4 et n°5)", () => {
  let orderId: string;

  it("add-order crée la commande et des items 'ordered' (jamais 'owned')", () => {
    const r = vault([
      "add-order",
      "--marketplace",
      "vinted",
      "--items",
      "game_ds_mario-kart-ds:10",
      "--total",
      "13.5",
      "--yes",
    ]);
    expect(r.ok).toBe(true);
    const order = r.result as { id: string; status: string };
    orderId = order.id;
    expect(order.status).toBe("ordered");
    const inv = JSON.parse(fs.readFileSync(path.join(scratch, "data/inventory.json"), "utf8"));
    const item = inv.find((i: { gameId: string }) => i.gameId === "game_ds_mario-kart-ds");
    expect(item.status).toBe("ordered");
  });

  it("cancel-order laisse la commande en historique, items 'cancelled'", () => {
    const r = vault(["cancel-order", "--order", orderId, "--yes"]);
    expect(r.ok).toBe(true);
    const orders = JSON.parse(fs.readFileSync(path.join(scratch, "data/orders.json"), "utf8"));
    const order = orders.find((o: { id: string }) => o.id === orderId);
    expect(order.status).toBe("cancelled");
    expect(order.cancelledAt).toBeTruthy();
    const inv = JSON.parse(fs.readFileSync(path.join(scratch, "data/inventory.json"), "utf8"));
    const item = inv.find((i: { gameId: string }) => i.gameId === "game_ds_mario-kart-ds");
    expect(item.status).toBe("cancelled");
  });

  it("règle n°5 : un item de commande annulée ne peut pas devenir 'owned'", () => {
    const inv = JSON.parse(fs.readFileSync(path.join(scratch, "data/inventory.json"), "utf8"));
    const item = inv.find((i: { gameId: string }) => i.gameId === "game_ds_mario-kart-ds");
    const r = vault(["set-status", "--inventory", item.id, "--status", "owned", "--yes"], true);
    expect(r.ok).toBe(false);
    expect(String(r.error)).toContain("Règle n°5");
  });
});

describe("vault add-price", () => {
  it("enregistre une observation datée et met à jour la cote (variant any)", () => {
    const r = vault([
      "add-price",
      "--game",
      "game_3ds_pokemon-lune",
      "--low",
      "25",
      "--median",
      "32",
      "--high",
      "45",
      "--source",
      "ebay-sold",
      "--yes",
    ]);
    expect(r.ok).toBe(true);
    const inv = JSON.parse(fs.readFileSync(path.join(scratch, "data/inventory.json"), "utf8"));
    const item = inv.find((i: { gameId: string }) => i.gameId === "game_3ds_pokemon-lune");
    expect(item.currentEstimate.median).toBe(32);
    expect(item.currentEstimate.source).toBe("ebay-sold");
  });

  it("stocke des cotes distinctes avec et sans boîte", () => {
    vault(["add-price", "--game", "game_3ds_pokemon-lune", "--variant", "cib", "--low", "40", "--median", "50", "--high", "70", "--source", "ebay-sold", "--yes"]);
    vault(["add-price", "--game", "game_3ds_pokemon-lune", "--variant", "loose", "--low", "22", "--median", "28", "--high", "38", "--source", "ebay-sold", "--yes"]);
    const obs = JSON.parse(fs.readFileSync(path.join(scratch, "data/price-observations.json"), "utf8"));
    const variants = obs.filter((o: { gameId: string }) => o.gameId === "game_3ds_pokemon-lune").map((o: { variant: string }) => o.variant);
    expect(variants).toContain("cib");
    expect(variants).toContain("loose");
  });
});

describe("vault deal", () => {
  it("rend un verdict selon l'état boîte/loose", () => {
    const cib = vault(["deal", "--game", "game_3ds_pokemon-lune", "--price", "35", "--state", "cib"]);
    expect(cib.ok).toBe(true);
    expect((cib.result as { verdict: string }).verdict).toBe("tres_bon_plan"); // 35 ≤ basse CIB (40)
    const loose = vault(["deal", "--game", "game_3ds_pokemon-lune", "--price", "35", "--state", "loose"]);
    expect((loose.result as { verdict: string }).verdict).toBe("un_peu_cher"); // 35 ≤ haute loose (38)
  });
  it("échoue proprement sans cote", () => {
    const r = vault(["deal", "--game", "game_ds_fort-boyard", "--price", "10"], true);
    expect(r.ok).toBe(false);
    expect(String(r.error)).toContain("Aucune cote");
  });
});
