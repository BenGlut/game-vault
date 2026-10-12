import { describe, expect, it } from "vitest";
import { displayStatuses } from "../src/lib/catalog-match";

const items = (...s: string[]) => s.map((status) => ({ status }));

describe("displayStatuses (pastilles du catalogue)", () => {
  it("montre une commande en cours, pas seulement possédé ou wishlist", () => {
    expect(displayStatuses(items("ordered"))).toEqual(["ordered"]);
    expect(displayStatuses(items("fulfilled"))).toEqual(["fulfilled"]);
  });

  it("masque la wishlist couverte par une commande", () => {
    expect(displayStatuses(items("wishlist", "ordered"))).toEqual(["ordered"]);
  });

  it("garde la wishlist tant que rien n'est acquis", () => {
    expect(displayStatuses(items("wishlist", "cancelled"))).toEqual(["wishlist"]);
  });

  it("ordonne du plus avancé au moins avancé, sans doublon ni historique", () => {
    expect(displayStatuses(items("ordered", "owned", "owned", "refunded"))).toEqual(["owned", "ordered"]);
  });
});
