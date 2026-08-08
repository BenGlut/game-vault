import { test, expect } from "@playwright/test";

test("le dashboard affiche les stats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Jeux référencés", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("la collection liste les jeux et filtre par plateforme", async ({ page }) => {
  await page.goto("/collection/");
  await expect(page.getByText("Pokémon Lune")).toBeVisible();
  await page.getByRole("button", { name: /^DS\b/ }).click();
  await expect(page.getByText("Super Mario 64 DS")).toBeVisible();
  await expect(page.getByText("Pokémon Lune")).toHaveCount(0);
});

test("la recherche tolérante trouve un titre EN", async ({ page }) => {
  await page.goto("/recherche/");
  await page.getByRole("searchbox").fill("pokemon moon");
  await expect(page.getByText("Pokémon Lune")).toBeVisible();
});

test("la fiche jeu affiche possession et vérification", async ({ page }) => {
  await page.goto("/jeu/game_3ds_pokemon-lune/");
  await expect(page.getByRole("heading", { name: "Pokémon Lune" })).toBeVisible();
  await expect(page.getByText("Possédé").first()).toBeVisible();
  // badge de vérification présent, quel que soit son état (vérifié / à vérifier)
  await expect(page.getByText(/vérifi/).first()).toBeVisible();
});

test("le catalogue complet charge et la recherche fonctionne", async ({ page }) => {
  await page.goto("/catalogue/");
  await expect(page.getByText("sur", { exact: false }).first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole("searchbox").fill("pokemon platinum");
  await expect(page.getByText("Pokemon - Platinum", { exact: false }).first()).toBeVisible();
});

test("aucune écriture possible depuis l'interface publique", async ({ page }) => {
  // les boutons de FILTRE existent ; aucun formulaire ni contrôle d'édition de données
  for (const url of ["/", "/collection/", "/jeu/game_3ds_pokemon-lune/", "/estimateur/"]) {
    await page.goto(url);
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator('input[type="submit"], button[type="submit"]')).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /modifier|éditer|supprimer|ajouter|enregistrer|sauver/i }),
    ).toHaveCount(0);
  }
});
