import { test, expect } from "@playwright/test";

test("le dashboard affiche les stats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Jeux référencés", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("la collection liste les jeux et filtre par plateforme", async ({ page }) => {
  await page.goto("/collection/");
  await expect(page.getByText("Pokémon Lune")).toBeVisible();
  await page.selectOption("select >> nth=0", "ds");
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
  await expect(page.getByText("à vérifier").first()).toBeVisible();
});

test("aucun bouton d'édition sur l'interface publique", async ({ page }) => {
  for (const url of ["/", "/collection/", "/jeu/game_3ds_pokemon-lune/"]) {
    await page.goto(url);
    await expect(page.locator("button:visible")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
  }
});
