import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_AMIIBO_TYPE,
  amiiboForGame,
  compatGameIndexes,
  displayTitles,
  entryKeys,
  formatRelease,
  gamesForAmiibo,
  inTypeGroup,
  isUpcoming,
  typeGroupOf,
  typeRank,
  type AmiiboCatalogEntry,
  type AmiiboCompat,
} from "../src/lib/amiibo";
import { buildEntryLinks } from "../src/lib/catalog-match";

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

describe("titres et types du catalogue amiibo", () => {
  const d = (id: string, name: string, series: string, type = "Figurine", release?: string) => ({ id, name, series, type, release });

  it("départage les homonymes par la série, puis le type, puis la vague", () => {
    const titles = displayTitles([
      d("m1", "Mario", "Super Mario"),
      d("m2", "Mario", "Super Smash Bros."),
      d("l1", "Luke", "Street Fighter 6"),
      d("l2", "Luke", "Street Fighter 6", "Carte", "2025-09-30"),
      d("l3", "Luke", "Street Fighter 6", "Carte", "2025-06-05"),
      d("k1", "Kirby", "Kirby"),
    ]);
    expect(titles.get("m1")).toBe("Mario (Super Mario)");
    expect(titles.get("m2")).toBe("Mario (Super Smash Bros.)");
    expect(titles.get("l1")).toBe("Luke (Street Fighter 6)");
    expect(titles.get("l3")).toBe("Luke (Street Fighter 6, carte, vague 1)");
    expect(titles.get("l2")).toBe("Luke (Street Fighter 6, carte, vague 2)");
    expect(titles.get("k1")).toBe("Kirby");
  });

  it("range les types en figurines (laine comprise), cartes et autres", () => {
    expect(typeGroupOf("Figurine")).toBe("figurine");
    expect(typeGroupOf("Carte")).toBe("carte");
    expect(typeGroupOf("Laine")).toBe("figurine");
    expect(["Bracelet", "Bloc"].map(typeGroupOf)).toEqual(["autre", "autre"]);
    expect(inTypeGroup("Carte", "figurine")).toBe(false);
    expect(inTypeGroup("Carte", "tous")).toBe(true);
    expect(typeRank("Figurine")).toBeLessThan(typeRank("Bracelet"));
    expect(typeRank("Bracelet")).toBeLessThan(typeRank("Carte"));
  });

  it("repère un amiibo annoncé, même quand seule l'année est connue", () => {
    expect(isUpcoming("2026-11-12", "2026-10-14")).toBe(true);
    expect(isUpcoming("2026-09-17", "2026-10-14")).toBe(false);
    expect(isUpcoming("2027", "2026-10-14")).toBe(true);
    expect(isUpcoming(undefined, "2026-10-14")).toBe(false);
    expect(formatRelease("2027")).toBe("2027");
    expect(formatRelease("2026-11-12")).toMatch(/12 nov\.? 2026/);
  });

  it("retrouve un amiibo de la base enregistré sous son ancien titre anglais", () => {
    const lists = new Map([
      [
        "amiibo",
        [
          { id: "amiibo-a", n: "bowser super mario", a: ["bowser super mario bros"] },
          { id: "amiibo-b", n: "bowser super smash bros" },
          { id: "amiibo-c", n: "link loup", a: ["midna wolf link"] },
        ],
      ],
    ]);
    const row = (id: string, title: string) => ({
      game: { id, platformId: "amiibo", normalizedTitle: title, aliases: [], qualityTier: null },
      items: [{ status: "wishlist" }],
    });
    const links = buildEntryLinks(lists, [row("g1", "bowser super mario bros"), row("g2", "midna wolf link")]);
    expect(links["amiibo-a"]?.id).toBe("g1");
    expect(links["amiibo-c"]?.id).toBe("g2");
    expect(links["amiibo-b"]).toBeUndefined();
    expect(entryKeys({ n: "link loup", a: ["midna wolf link"] })).toEqual(["link loup", "midna wolf link"]);
  });
});

describe("catalogue amiibo publié (public/catalog/amiibo.json)", () => {
  const entries = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "catalog", "amiibo.json"), "utf8")) as AmiiboCatalogEntry[];
  const extras = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "scripts", "catalog", "amiibo-extras.json"), "utf8")) as {
    names: Record<string, string>;
    images: Record<string, unknown>;
    add: { slug: string }[];
  };

  it("n'a ni id ni titre en double", () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.t)).size).toBe(entries.length);
  });

  it("a une copie locale pour chaque image annoncée", () => {
    for (const e of entries.filter((x) => x.img)) {
      expect(fs.existsSync(path.join(__dirname, "..", "public", "catalog-covers", "amiibo", `${e.id.slice("amiibo-".length)}.jpg`)), e.id).toBe(true);
    }
    expect(entries.filter((e) => e.ty !== "Carte" && !e.img).length).toBeLessThanOrEqual(2);
  });

  it("applique la curation : noms français, images remplacées et ajouts", () => {
    const byId = new Map(entries.map((e) => [e.id, e]));
    for (const [id, name] of Object.entries(extras.names)) expect(byId.get(id)?.t.startsWith(name), id).toBe(true);
    for (const id of Object.keys(extras.images)) expect(byId.has(id), id).toBe(true);
    for (const x of extras.add) expect(byId.has(`amiibo-x-${x.slug}`), x.slug).toBe(true);
  });

  it("compte surtout des cartes : les figurines doivent rester visibles par défaut", () => {
    const figures = entries.filter((e) => typeGroupOf(e.ty) === "figurine").length;
    expect(figures).toBeGreaterThan(250);
    expect(DEFAULT_AMIIBO_TYPE).toBe("figurine");
  });
});
