import { describe, it, expect } from "vitest";
import { stillWanted, inCollection } from "../src/lib/data";
import type { GameRow, PublicInventoryItem } from "../src/lib/data";

/**
 * Règle métier posée par benglut le 2026-08-11 après avoir vu un jeu déjà acheté
 * rester dans « Recommandations d'achat » : un achat validé sort le jeu des listes
 * d'achat, et il n'y revient que si la commande tombe et qu'il ne reste rien en stock.
 */

function row(...statuses: string[]): GameRow {
  return {
    game: { id: "g", platformId: "3ds" } as GameRow["game"],
    items: statuses.map((status) => ({ status }) as PublicInventoryItem),
    platform: undefined,
    coverUrl: null,
  };
}

describe("stillWanted", () => {
  it("garde un jeu seulement souhaité", () => {
    expect(stillWanted(row("wishlist"))).toBe(true);
  });

  it("sort le jeu dès qu'un exemplaire est commandé, expédié, reçu ou possédé", () => {
    for (const acquis of ["ordered", "fulfilled", "delivered", "owned"]) {
      expect(stillWanted(row("wishlist", acquis))).toBe(false);
    }
  });

  it("le fait revenir si la commande tombe et qu'il ne reste rien en stock", () => {
    expect(stillWanted(row("wishlist", "cancelled"))).toBe(true);
    expect(stillWanted(row("wishlist", "refunded"))).toBe(true);
  });

  it("ne le fait pas revenir s'il reste un exemplaire malgré une commande annulée", () => {
    expect(stillWanted(row("wishlist", "cancelled", "owned"))).toBe(false);
  });

  it("ignore un jeu sans ligne wishlist", () => {
    expect(stillWanted(row("owned"))).toBe(false);
    expect(stillWanted(row("cancelled"))).toBe(false);
  });
});

/**
 * Corollaire repéré par benglut le 2026-08-17 : Luigi's Mansion 3 apparaissait dans la
 * Collection alors qu'il n'avait que deux lignes REMBOURSÉES (lots annulés) et une
 * wishlist. Une commande annulée n'a jamais rien livré.
 */
describe("inCollection", () => {
  it("garde un jeu réellement possédé ou en route", () => {
    for (const s of ["owned", "delivered", "duplicate", "ordered", "fulfilled"]) {
      expect(inCollection(row(s))).toBe(true);
    }
  });

  it("exclut un jeu dont les seules lignes sont annulées ou remboursées", () => {
    expect(inCollection(row("refunded", "refunded", "wishlist"))).toBe(false);
    expect(inCollection(row("cancelled"))).toBe(false);
    expect(inCollection(row("sold"))).toBe(false);
  });

  it("exclut un jeu seulement souhaité", () => {
    expect(inCollection(row("wishlist"))).toBe(false);
  });

  it("le fait entrer dès qu'un exemplaire réel s'ajoute aux lignes remboursées", () => {
    expect(inCollection(row("refunded", "owned"))).toBe(true);
  });
});
