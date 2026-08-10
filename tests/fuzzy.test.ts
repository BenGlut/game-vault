import { describe, it, expect } from "vitest";
import Fuse from "fuse.js";
import { searchDocs } from "../src/lib/fuzzy";
import type { SearchDoc } from "../src/lib/data";

const docs: SearchDoc[] = [
  { id: "gb-rouge", t: "Pokémon Version Rouge", n: "pokemon version rouge", a: ["Pokemon Red Version"], f: "Pokémon", p: "gb" },
  { id: "sw-bouclier", t: "Pokémon Bouclier", n: "pokemon bouclier", a: ["Pokemon Shield"], f: "Pokémon", p: "switch" },
  { id: "ds-ranger", t: "Pokémon Ranger", n: "pokemon ranger", a: [], f: "Pokémon", p: "ds" },
  { id: "gbc-or", t: "Pokémon Version Or", n: "pokemon version or", a: ["Pokemon Gold Version"], f: "Pokémon", p: "gbc" },
  { id: "ds-explorateurs", t: "Pokémon Donjon Mystère : Explorateurs du Temps", n: "pokemon donjon mystere explorateurs du temps", a: [], f: "Pokémon", p: "ds" },
];

const fuse = new Fuse(docs, {
  keys: [
    { name: "n", weight: 2 },
    { name: "a", weight: 1.5 },
    { name: "t", weight: 1 },
    { name: "f", weight: 0.6 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  includeScore: true,
});

describe("searchDocs — correspondance exacte par mots avant le fuzzy", () => {
  it("« pokemon rouge » classe Version Rouge en premier", () => {
    expect(searchDocs(docs, fuse, "pokemon rouge", 5)[0]?.item.id).toBe("gb-rouge");
  });
  it("« pokemon or » classe Version Or en premier (pas Explorateurs)", () => {
    expect(searchDocs(docs, fuse, "pokemon or", 5)[0]?.item.id).toBe("gbc-or");
  });
  it("le fuzzy reste actif pour les fautes (« bouclié »)", () => {
    const r = searchDocs(docs, fuse, "pokemon bouclié", 5);
    expect(r.some((h) => h.item.id === "sw-bouclier")).toBe(true);
  });
  it("les alias EN matchent en exact (« pokemon shield »)", () => {
    expect(searchDocs(docs, fuse, "pokemon shield", 5)[0]?.item.id).toBe("sw-bouclier");
  });
});

describe("abréviations de collectionneurs", () => {
  it("« dqm » retrouve Dragon Quest Monsters", () => {
    const docs2: SearchDoc[] = [
      { id: "ds-dqm", t: "Dragon Quest Monsters: Joker", n: "dragon quest monsters joker", a: [], f: "Dragon Quest", p: "ds" },
      { id: "ds-dq9", t: "Dragon Quest IX", n: "dragon quest ix", a: [], f: "Dragon Quest", p: "ds" },
    ];
    const f2 = new Fuse(docs2, { keys: ["n", "a", "t"], threshold: 0.38, ignoreLocation: true, includeScore: true });
    expect(searchDocs(docs2, f2, "dqm joker", 5)[0]?.item.id).toBe("ds-dqm");
  });
});
