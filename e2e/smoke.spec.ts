import { test, expect, type Page } from "@playwright/test";
import { VAULT } from "./fixtures/vault";

/**
 * L'application lit et écrit l'API privée (Cloudflare + D1). Ici l'API est simulée :
 * GET /api/vault sert une petite base fictive, les écritures renvoient ce qu'elles
 * reçoivent, comme le serveur après validation.
 */
async function mockApi(page: Page, { unauthorized = false } = {}) {
  const writes: { method: string; url: string; body: unknown }[] = [];
  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (unauthorized) return route.fulfill({ status: 401, json: { error: "Connexion requise" } });
    if (req.method() === "GET" && url.pathname === "/api/vault") return route.fulfill({ json: VAULT });
    if (req.method() === "GET" && url.pathname === "/api/change-log") return route.fulfill({ json: VAULT.changeLog });
    const body = req.postDataJSON() as Record<string, unknown> | null;
    writes.push({ method: req.method(), url: url.pathname, body });
    if (url.pathname.startsWith("/api/order-transition/")) {
      const id = url.pathname.split("/").pop();
      const order = VAULT.orders.find((o) => o.id === id)!;
      const inventory = VAULT.inventory
        .filter((i) => i.orderId === id)
        .map((i) => ({ ...i, status: "delivered", acquiredAt: body?.date, quantity: 1 }));
      return route.fulfill({ json: { order: { ...order, status: "delivered", deliveredAt: body?.date }, inventory } });
    }
    return route.fulfill({ json: body ?? { ok: true } });
  });
  return writes;
}

test("le tableau de bord affiche la valeur et les chiffres clés", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByText("Valeur de la collection")).toBeVisible();
  await expect(page.getByText("Jeux possédés").first()).toBeVisible();
  await expect(page.getByText("Hotel Dusk : Room 215").first()).toBeVisible();
});

test("la collection liste les jeux et filtre par console", async ({ page }) => {
  await mockApi(page);
  await page.goto("/collection/");
  await expect(page.getByText("Pokémon Lune")).toBeVisible();
  await page.getByRole("button", { name: /^DS\b/ }).click();
  await expect(page.getByText("Super Mario 64 DS")).toBeVisible();
  await expect(page.getByText("Pokémon Lune")).toHaveCount(0);
});

test("la recherche globale trouve un titre par son nom anglais", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByText("Valeur de la collection")).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("pokemon moon");
  await expect(page.getByRole("option").filter({ hasText: "Pokémon Lune" })).toBeVisible();
});

test("le panneau du jeu modifie un exemplaire et l'enregistre", async ({ page }) => {
  const writes = await mockApi(page);
  await page.goto("/collection/");
  await page.getByText("Pokémon Lune").click();
  const panel = page.getByRole("dialog", { name: "Fiche du jeu" });
  await expect(panel.getByRole("heading", { name: "Pokémon Lune" })).toBeVisible();
  await panel.getByRole("button", { name: "Modifier", exact: true }).click();
  await panel.getByRole("combobox").nth(3).selectOption("very_good");
  await panel.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Exemplaire enregistré")).toBeVisible();
  expect(writes[0]).toMatchObject({ method: "PUT", url: "/api/inventory/inv_3ds_pokemon-lune", body: { condition: "very_good" } });
});

test("une commande reçue sort des commandes en cours", async ({ page }) => {
  const writes = await mockApi(page);
  await page.goto("/commandes/");
  await expect(page.getByRole("heading", { name: "En cours" })).toBeVisible();
  await page.getByRole("button", { name: "Reçue", exact: true }).click();
  await expect(page.getByText("Commande reçue")).toBeVisible();
  await expect(page.getByRole("heading", { name: "En cours" })).toHaveCount(0);
  expect(writes[0]).toMatchObject({ method: "POST", url: "/api/order-transition/order_e2e_encours", body: { action: "deliver" } });
});

test("sans session, l'application renvoie vers la connexion", async ({ page }) => {
  await mockApi(page, { unauthorized: true });
  await page.goto("/collection/");
  await expect(page).toHaveURL(/\/connexion\/\?next=/);
});
