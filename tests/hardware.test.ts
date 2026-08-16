import { describe, it, expect } from "vitest";
import { GameSchema } from "../src/lib/schema";

/**
 * Le matériel (consoles, accessoires) partage les tables des jeux — même inventaire,
 * mêmes commandes, même historique d'achat — mais ne doit jamais être compté ni
 * valorisé comme un jeu. Règle posée par benglut le 2026-08-17.
 */

const base = {
  id: "game_3ds_nintendo-2ds",
  canonicalTitle: "Nintendo 2DS",
  normalizedTitle: "nintendo 2ds",
  platformId: "3ds",
};

describe("type d'entrée", () => {
  it("vaut « game » par défaut, pour ne rien casser des entrées existantes", () => {
    expect(GameSchema.parse(base).kind).toBe("game");
  });

  it("accepte « hardware »", () => {
    expect(GameSchema.parse({ ...base, kind: "hardware" }).kind).toBe("hardware");
  });

  it("refuse une valeur inventée", () => {
    expect(() => GameSchema.parse({ ...base, kind: "console" })).toThrow();
  });
});
