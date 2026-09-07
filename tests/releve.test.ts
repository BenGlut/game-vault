import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Garde le classifieur d'annonces de `scripts/vinted/releve.js`.
 *
 * Ce fichier est destiné à être collé tel quel dans un onglet Vinted, il ne peut
 * donc pas exporter ses symboles. Le test lit le vrai fichier et n'en évalue que
 * les déclarations de tête : aucune copie des expressions régulières ici, donc
 * aucune dérive possible entre ce qui est testé et ce qui est exécuté.
 *
 * Les cas viennent d'annonces réellement rencontrées. Deux d'entre eux sont les
 * erreurs qui ont motivé le fichier : « BOITE Cooking Mama » comptée comme un jeu
 * (2026-09-07, chiffre faux envoyé à une vendeuse), et « jeu + boîte + notice »
 * écarté par le filtre naïf écrit juste après.
 */

const SOURCE = path.resolve(__dirname, "../scripts/vinted/releve.js");

function chargerClassifieur(): (titre: string) => string | null {
  const src = fs.readFileSync(SOURCE, "utf8");
  const debut = src.indexOf("const ACCESSOIRE");
  const fin = src.indexOf("async function csrf");
  expect(debut, "en-tête du classifieur introuvable").toBeGreaterThan(-1);
  expect(fin, "fin du classifieur introuvable").toBeGreaterThan(debut);
  return new Function(`${src.slice(debut, fin)}; return ecarter;`)() as (t: string) => string | null;
}

const CAS: [string, string][] = [
  ["BOITE Cooking Mama Bon appétit !", "accessoire"],
  ["Boîtier Tamagotchi Connexion Corner Shop Nintendo DS", "accessoire"],
  ["Ds notice cooking mama 3 shop & chop", "accessoire"],
  ["Boite professeur Layton DS l'appel du Spectre avec manuel", "accessoire"],
  ["Nintendo 3ds cooking mama sweet shop scatola vuota", "accessoire"],
  ["Cooking mama bon appétit code vip non gratté", "accessoire"],
  ["Jeu Nintendo DS Resident Evil Deadly Silence Cartouche seule", "accessoire"],
  ["cartuccia resident evil the mercenaries 3d - nintendo 3ds", "loose"],
  ["Resident Evil Revelations Precintado Nintendo 3DS", "scelle"],
  // les complets : tout faux positif ici sous-estime n et fait mentir la fourchette
  ["Jeu Nintendo DS Tamagotchi Connection : Corner Shop 2 - complet", "OK"],
  ["Tamagotchi Connexion Corner Shop 2 Nintendo DS – jeu + boîte + notice", "OK"],
  ["Jeu DS professeur Layton L’appel du spectre complet", "OK"],
  ["Cooking Mama Sweet Shop 3ds - french box, complete", "OK"],
  ["Tamagotchi Corner Shop 2 Nintendo DS", "OK"],
];

describe("relevé Vinted — classifieur d'annonces", () => {
  const ecarter = chargerClassifieur();

  for (const [titre, attendu] of CAS) {
    it(`${attendu.padEnd(10)} ← ${titre.slice(0, 55)}`, () => {
      expect(ecarter(titre) ?? "OK").toBe(attendu);
    });
  }

  it("les deux ordres de tri sont interrogés (sinon la médiane est fausse)", () => {
    const src = fs.readFileSync(SOURCE, "utf8");
    expect(src).toContain("price_low_to_high");
    expect(src).toContain("price_high_to_low");
  });
});
