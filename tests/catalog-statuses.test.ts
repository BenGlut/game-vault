import { describe, expect, it } from "vitest";
import { buildEntryLinks, displayStatuses } from "../src/lib/catalog-match";

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

describe("rapprochement catalogue ↔ base", () => {
  const row = (id: string, platformId: string, title: string) => ({
    game: { id, platformId, normalizedTitle: title, aliases: [], qualityTier: null },
    items: [{ status: "ordered" }],
  });

  it("une édition Switch 2 du catalogue n'est pas rattachée au jeu Switch", () => {
    const lists = new Map([
      ["switch", [{ id: "switch-xc3", n: "xenoblade chronicles 3" }]],
      ["switch-digital", [{ id: "switch-digital-xc3-ns2", n: "xenoblade chronicles 3 nintendo switch 2 edition" }]],
    ]);
    const links = buildEntryLinks(lists, [row("game_switch_xc3", "switch", "xenoblade chronicles 3")]);
    expect(links["switch-xc3"]?.id).toBe("game_switch_xc3");
    expect(links["switch-digital-xc3-ns2"]).toBeUndefined();
  });

  it("un jeu Switch 2 Edition de la base retrouve bien son entrée", () => {
    const lists = new Map([["switch2", [{ id: "switch2-xc3", n: "xenoblade chronicles 3 nintendo switch 2 edition" }]]]);
    const links = buildEntryLinks(lists, [row("game_switch2_xc3", "switch2", "xenoblade chronicles 3 nintendo switch 2 edition")]);
    expect(links["switch2-xc3"]?.id).toBe("game_switch2_xc3");
  });
});
