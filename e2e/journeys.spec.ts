import { test, expect } from "@playwright/test";
import { mockApi } from "./fixtures/mock-api";

/**
 * Parcours clés sur la base de démonstration (API simulée) : thème, navigation,
 * filtres du catalogue, fiche d'un jeu, page Commandes, absence de défilement
 * horizontal sur téléphone.
 */

test("le thème bascule entre clair, sombre et système, et le choix est mémorisé", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  // une erreur d'hydratation régénérerait tout le document et effacerait le thème posé
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByText("Valeur de la collection")).toBeVisible();
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-theme-pref", "system");

  const switcher = page.getByRole("radiogroup", { name: "Thème" }).first();
  await switcher.getByRole("radio", { name: "Thème clair" }).click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-theme-pref", "light");
  expect(await page.evaluate(() => localStorage.getItem("gv-theme"))).toBe("light");
  // les jetons suivent : fond de page clair
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(245, 246, 248)");

  // appliqué dès le rechargement, avant tout rendu
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("radiogroup", { name: "Thème" }).first().getByRole("radio", { name: "Thème clair" })).toHaveAttribute("aria-checked", "true");

  await page.getByRole("radiogroup", { name: "Thème" }).first().getByRole("radio", { name: "Thème sombre" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("gv-theme"))).toBe("dark");

  // « Système » oublie le choix et suit le système
  await page.getByRole("radiogroup", { name: "Thème" }).first().getByRole("radio", { name: "Thème système" }).click();
  expect(await page.evaluate(() => localStorage.getItem("gv-theme"))).toBeNull();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("la page de connexion suit le thème mémorisé", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await mockApi(page);
  await page.addInitScript(() => localStorage.setItem("gv-theme", "light"));
  await page.goto("/connexion/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("la navigation latérale mène à chaque page et marque la page active", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Pages" });
  for (const [label, heading] of [
    ["Statistiques", "Statistiques"],
    ["Ma collection", "Ma collection"],
    ["Wishlist", "Wishlist"],
    ["Commandes", "Commandes"],
    ["Historique", "Historique"],
  ]) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  }
});

test("sur téléphone, les onglets et la feuille « Plus » donnent accès à tout, sans défilement horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockApi(page);
  for (const path of ["/", "/collection/", "/wishlist/", "/commandes/", "/statistiques/", "/catalogue/", "/historique/", "/estimateur/", "/dev/"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `défilement horizontal sur ${path}`).toBeLessThanOrEqual(0);
  }
  await page.goto("/");
  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("button", { name: "Plus" }).click();
  const sheet = page.getByRole("dialog", { name: "Plus de pages" });
  await expect(sheet.getByRole("radiogroup", { name: "Thème" })).toBeVisible();
  await sheet.getByRole("link", { name: "Catalogue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Catalogue" })).toBeVisible();
});

test("le catalogue filtre par qualité et boîte, et garde les filtres dans l'URL", async ({ page }) => {
  await mockApi(page);
  await page.goto("/catalogue/?plateforme=switch");
  await expect(page.getByText(/jeux? sur/)).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("Qualité", { exact: true }).selectOption("S");
  await page.getByLabel("Boîte", { exact: true }).selectOption("fr");
  await expect(page).toHaveURL(/plateforme=switch/);
  await expect(page).toHaveURL(/qualite=S/);
  await expect(page).toHaveURL(/boite=fr/);
  // un jeu possédé de la base porte sa pastille d'état, chaque carte sa pastille boîte
  await page.getByLabel("Chercher dans tous les jeux sortis…").fill("hades");
  const card = page.getByRole("button", { name: /Hades/ }).first();
  await expect(card.getByText("Possédé")).toBeVisible();
  await expect(card.getByTitle("Boîte française")).toHaveText("Boîte FR");
  await page.reload();
  await expect(page.getByLabel("Qualité", { exact: true })).toHaveValue("S");
  await expect(page.getByLabel("Boîte", { exact: true })).toHaveValue("fr");
});

test("la fiche d'un jeu s'ouvre au clavier, se ferme avec Échap et rend le focus", async ({ page }) => {
  await mockApi(page);
  await page.goto("/collection/");
  const card = page.getByRole("button", { name: /Chrono Trigger/ }).first();
  await card.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("dialog", { name: "Fiche du jeu" });
  await expect(panel.getByRole("heading", { name: "Chrono Trigger" })).toBeVisible();
  await expect(panel.getByText("Cote en boîte")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(card).toBeFocused();
});

test("la page Commandes suit les commandes en cours et déplie l'historique", async ({ page }) => {
  const writes = await mockApi(page);
  await page.goto("/commandes/");
  await expect(page.getByRole("heading", { name: "En cours" })).toBeVisible();
  const current = page.locator("#commande-order_demo_live_3");
  await expect(current.getByRole("list", { name: "Suivi de la commande" })).toBeVisible();
  await current.getByRole("button", { name: "Annulée" }).click();
  await expect(current.getByRole("alert")).toContainText("Marquer annulée");
  await current.getByRole("button", { name: "Non" }).click();
  await current.getByRole("button", { name: "Reçue", exact: true }).click();
  await expect(page.getByText("Commande reçue")).toBeVisible();
  expect(writes[0]).toMatchObject({ method: "POST", url: "/api/order-transition/order_demo_live_3", body: { action: "deliver" } });

  await page.getByRole("button", { name: "Remboursées 1" }).click();
  const row = page.locator("#historique-order_demo_live_6 > button");
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Cartouche ne démarrait pas")).toBeVisible();
});

test("chaque console du catalogue est visible et cliquable sur ordinateur, y compris Switch 2", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockApi(page);
  await page.goto("/catalogue/");
  await expect(page.getByText(/jeux? sur/)).toBeVisible({ timeout: 20_000 });
  const consoles = page.getByRole("group", { name: "Console" }).getByRole("button");
  const viewport = page.viewportSize()!;
  for (const button of await consoles.all()) {
    const box = (await button.boundingBox())!;
    expect(box.x + box.width, `${await button.innerText()} déborde de l'écran`).toBeLessThanOrEqual(viewport.width);
  }
  await consoles.filter({ hasText: "Switch 2" }).click();
  await expect(page).toHaveURL(/plateforme=switch2/);
});

test("un jeu du catalogue absent de la base peut être ajouté directement à la collection", async ({ page }) => {
  await mockApi(page);
  await page.goto("/catalogue/?plateforme=switch2");
  await expect(page.getByText(/jeux? sur/)).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("Possession").selectOption("missing");
  const firstCard = page.getByRole("button", { name: /Jaquette de/ }).first();
  await firstCard.click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("button", { name: /ajouter à ma collection/ })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Ajouter à la wishlist" })).toBeVisible();
});
