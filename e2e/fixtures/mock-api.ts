import type { Page } from "@playwright/test";
import { DEMO_DEV_INFO, DEMO_DEV_LIVE, DEMO_VAULT } from "./demo-vault";

type Vault = { orders: { id: string }[]; inventory: { orderId: string | null }[]; changeLog: unknown[] };

/**
 * API privée simulée pour les parcours e2e : GET /api/vault sert la base fournie
 * (par défaut la base de démonstration), les écritures renvoient ce qu'elles
 * reçoivent, comme le serveur après validation. Les jaquettes redimensionnées à la
 * volée (service externe) sont coupées : la copie locale s'affiche, résultat stable.
 */
export async function mockApi(page: Page, { vault = DEMO_VAULT as Vault, unauthorized = false } = {}) {
  const writes: { method: string; url: string; body: unknown }[] = [];
  await page.route("https://wsrv.nl/**", (route) => route.abort());
  await page.route("**/dev-info.json", (route) => route.fulfill({ json: DEMO_DEV_INFO }));
  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (unauthorized) return route.fulfill({ status: 401, json: { error: "Connexion requise" } });
    if (req.method() === "GET" && url.pathname === "/api/vault") return route.fulfill({ json: vault });
    if (req.method() === "GET" && url.pathname === "/api/change-log") return route.fulfill({ json: vault.changeLog });
    if (req.method() === "GET" && url.pathname === "/api/dev") return route.fulfill({ json: DEMO_DEV_LIVE });
    if (req.method() === "GET" && url.pathname === "/api/auth/config") return route.fulfill({ json: {} });
    const body = req.postDataJSON() as Record<string, unknown> | null;
    writes.push({ method: req.method(), url: url.pathname, body });
    if (url.pathname.startsWith("/api/order-transition/")) {
      const id = url.pathname.split("/").pop();
      const order = vault.orders.find((o) => o.id === id)!;
      const status = { fulfill: "fulfilled", deliver: "delivered", cancel: "cancelled", refund: "refunded" }[String(body?.action)] ?? "delivered";
      const inventory = vault.inventory
        .filter((i) => i.orderId === id)
        .map((i) => ({ ...i, status, acquiredAt: status === "delivered" ? body?.date : null, quantity: 1 }));
      return route.fulfill({ json: { order: { ...order, status }, inventory } });
    }
    return route.fulfill({ json: body ?? { ok: true } });
  });
  return writes;
}
