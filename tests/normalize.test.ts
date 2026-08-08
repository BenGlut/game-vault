import { describe, it, expect } from "vitest";
import { normalizeTitle, slugify, gameId, inventoryId } from "../src/lib/normalize";

describe("normalizeTitle", () => {
  it("supprime les accents français", () => {
    expect(normalizeTitle("Pokémon Méga Donjon Mystère")).toBe("pokemon mega donjon mystere");
    expect(normalizeTitle("Détective Pikachu")).toBe("detective pikachu");
    expect(normalizeTitle("Équipe de Secours Bleue")).toBe("equipe de secours bleue");
  });

  it("supprime ponctuation et symboles", () => {
    expect(normalizeTitle("Mario & Luigi: Dream Team Bros.")).toBe("mario luigi dream team bros");
    expect(normalizeTitle("Nintendogs + Cats")).toBe("nintendogs cats");
    expect(normalizeTitle("Yo-kai Watch 2 : Esprits Farceurs")).toBe("yo kai watch 2 esprits farceurs");
  });

  it("est idempotente", () => {
    const once = normalizeTitle("Pokémon Rubis Oméga");
    expect(normalizeTitle(once)).toBe(once);
  });

  it("rapproche FR et EN normalisés distincts (rôle des alias)", () => {
    expect(normalizeTitle("Pokemon Moon")).toBe("pokemon moon");
    expect(normalizeTitle("Pokémon Lune")).toBe("pokemon lune");
  });
});

describe("identifiants", () => {
  it("génère des ids déterministes", () => {
    expect(gameId("3ds", "Pokémon Lune")).toBe("game_3ds_pokemon-lune");
    expect(slugify("Mario & Luigi: Dream Team Bros.")).toBe("mario-luigi-dream-team-bros");
  });

  it("dérive l'id d'inventaire", () => {
    expect(inventoryId("game_3ds_pokemon-lune")).toBe("inv_3ds_pokemon-lune");
  });
});
