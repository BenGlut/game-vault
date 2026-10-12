import { describe, expect, it } from "vitest";
import { amiiboForGame, compatGameIndexes, gamesForAmiibo, type AmiiboCompat } from "../src/lib/amiibo";

const compat: AmiiboCompat = {
  games: [
    { t: "Kirby and the Forgotten Land", p: "switch" },
    { t: "Super Smash Bros. Ultimate", p: "switch" },
    { t: "Metroid Prime 4: Beyond", p: "switch" },
    { t: "Super Smash Bros. for Nintendo 3DS", p: "3ds" },
  ],
  usages: ["Débloque un objet", "Combattant figurine", "Recharge"],
  links: {
    "amiibo-kirby": [
      [0, 0],
      [1, 1],
    ],
    "amiibo-samus": [
      [2, 2],
      [1, 1],
      [3, 1],
    ],
  },
};

const game = (canonicalTitle: string, platformId = "switch", aliases: string[] = []) => ({ canonicalTitle, platformId, aliases });

describe("compatibilité amiibo ↔ jeux", () => {
  it("rapproche un titre français par la table FR → EN", () => {
    expect(compatGameIndexes(game("Kirby et le monde oublié"), compat)).toEqual([0]);
  });

  it("ignore le suffixe Switch 2 Edition et accepte les amiibo Switch sur la cartouche Switch 2", () => {
    expect(compatGameIndexes(game("Metroid Prime 4: Beyond - Nintendo Switch 2 Edition", "switch2"), compat)).toEqual([2]);
  });

  it("ne mélange pas les consoles : Smash 3DS n'est pas Smash Switch", () => {
    expect(compatGameIndexes(game("Super Smash Bros. Ultimate"), compat)).toEqual([1]);
    expect(compatGameIndexes(game("Super Smash Bros. for Nintendo 3DS", "3ds"), compat)).toEqual([3]);
  });

  it("liste les amiibo d'un jeu avec ce qu'ils débloquent", () => {
    expect(amiiboForGame(game("Super Smash Bros. Ultimate"), compat)).toEqual([
      { id: "amiibo-kirby", usage: "Combattant figurine" },
      { id: "amiibo-samus", usage: "Combattant figurine" },
    ]);
  });

  it("liste les jeux d'un amiibo", () => {
    expect(gamesForAmiibo("amiibo-samus", compat).map((g) => `${g.t} (${g.p})`)).toEqual([
      "Metroid Prime 4: Beyond (switch)",
      "Super Smash Bros. Ultimate (switch)",
      "Super Smash Bros. for Nintendo 3DS (3ds)",
    ]);
  });
});
