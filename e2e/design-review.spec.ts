import { test, type Page } from "@playwright/test";
import { mockApi } from "./fixtures/mock-api";

/**
 * Captures de revue de design (pas un test de non-régression) : chaque page en
 * ordinateur (1440 px) et en téléphone (375 px), base de démonstration.
 * Lancement : DESIGN_REVIEW=apres pnpm e2e design-review
 * Résultat : design-review/<DESIGN_REVIEW>/<page>-<appareil>.png
 */
const phase = process.env.DESIGN_REVIEW;
test.skip(!phase, "captures de revue lancées à la demande (DESIGN_REVIEW=avant|apres)");
test.setTimeout(120_000);

const DEVICES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
] as const;

const PAGES: { name: string; path: string; ready: (page: Page) => Promise<unknown>; act?: (page: Page) => Promise<unknown> }[] = [
  { name: "01-tableau-de-bord", path: "/", ready: (p) => p.getByText("Valeur de la collection").first().waitFor() },
  { name: "02-statistiques", path: "/statistiques/", ready: (p) => p.getByText("Valeur et dépenses cumulées").first().waitFor() },
  { name: "03-collection", path: "/collection/", ready: (p) => p.getByText("Chrono Trigger").first().waitFor() },
  {
    name: "04-collection-liste",
    path: "/collection/",
    ready: (p) => p.getByText("Chrono Trigger").first().waitFor(),
    act: async (p) => {
      const list = p.getByRole("radio", { name: /liste/i });
      const fallback = p.locator('[role="radio"]').last();
      if (await list.count()) await list.first().click();
      else if (await fallback.isVisible()) await fallback.click();
    },
  },
  { name: "05-wishlist", path: "/wishlist/", ready: (p) => p.getByText("Ghost Trick", { exact: false }).first().waitFor() },
  { name: "06-catalogue", path: phase === "avant" ? "/catalogue/?plateforme=switch" : "/catalogue/?plateforme=switch&qualite=S", ready: (p) => p.getByText(/jeux? sur/).first().waitFor({ timeout: 30_000 }) },
  { name: "07-commandes", path: "/commandes/", ready: (p) => p.getByText("Hotel Dusk", { exact: false }).first().waitFor() },
  {
    name: "08-estimateur",
    path: "/estimateur/",
    ready: (p) => p.getByRole(phase === "avant" ? "searchbox" : "combobox").first().waitFor(),
    act: async (p) => {
      if (phase === "avant") return;
      await p.getByRole("combobox").fill("chrono trig");
      await p.keyboard.press("Enter");
      await p.getByPlaceholder("0").fill("38");
    },
  },
  { name: "09-historique", path: "/historique/", ready: (p) => p.getByText("Chrono Trigger", { exact: false }).first().waitFor() },
  { name: "10-dev", path: "/dev/", ready: (p) => p.getByText("Architecture").first().waitFor() },
  { name: "11-fiche-jeu", path: "/jeu/?id=game_ds_chrono-trigger", ready: (p) => p.getByRole("heading", { name: "Chrono Trigger" }).first().waitFor() },
  {
    name: "12-panneau-jeu",
    path: "/collection/",
    ready: (p) => p.getByText("Chrono Trigger").first().waitFor(),
    act: async (p) => {
      await p.getByText("Chrono Trigger").first().click();
      await p.getByRole("dialog", { name: "Fiche du jeu" }).waitFor();
    },
  },
  {
    name: "13-recherche",
    path: "/",
    ready: (p) => p.getByText("Valeur de la collection").first().waitFor(),
    act: async (p) => {
      await p.keyboard.press("Control+k");
      await p.getByRole("combobox").fill("zelda");
    },
  },
  {
    name: "14-nouveau-jeu",
    path: "/collection/",
    ready: (p) => p.getByText("Chrono Trigger").first().waitFor(),
    act: async (p) => {
      await p.getByRole("button", { name: "Nouveau jeu" }).first().click();
      await p.getByRole("dialog", { name: "Nouveau jeu" }).waitFor();
    },
  },
  { name: "15-connexion", path: "/connexion/", ready: (p) => p.locator("main").first().waitFor() },
];

/** l'interface d'avant n'avait qu'un thème sombre */
const THEMES = phase === "avant" ? (["sombre"] as const) : (["sombre", "clair"] as const);

for (const theme of THEMES)
for (const device of DEVICES) {
  for (const pg of PAGES) {
    test(`${pg.name} · ${device.name} · ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme === "clair" ? "light" : "dark" });
      await mockApi(page);
      await page.goto(pg.path);
      await pg.ready(page);
      if (pg.act) await pg.act(page);
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(600);
      const overlay = pg.name.startsWith("12") || pg.name.startsWith("13") || pg.name.startsWith("14");
      await page.screenshot({ path: `design-review/${phase}/${pg.name}-${device.name}-${theme}.png`, fullPage: !overlay });
    });
  }
}
