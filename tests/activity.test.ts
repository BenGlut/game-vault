import { describe, expect, it } from "vitest";
import { activityGameId, humanizeMessage, type ActivityContext } from "../src/lib/activity";
import type { ChangeLogEntry } from "../src/lib/schema";

const ctx: ActivityContext = {
  orders: new Map([["order_muuxjpev", { label: "Vinted chez chriss-reims", gameId: "game_ds_hotel-dusk" }]]),
  inventory: new Map([["inv_switch_sonic-superstars", "game_switch_sonic-superstars"]]),
  titles: new Map([
    ["game_ds_hotel-dusk", "Hotel Dusk : Room 215"],
    ["game_switch_sonic-superstars", "Sonic Superstars"],
  ]),
};

const entry = (message: string, ids: string[] = []): ChangeLogEntry => ({
  id: "log_1",
  at: "2026-10-12T03:22:00Z",
  actor: "mcp",
  command: "transition_order",
  message,
  affected: [{ file: "orders", ids }],
});

describe("historique lisible", () => {
  it("remplace l'identifiant de commande et la date ISO", () => {
    expect(humanizeMessage("Commande order_muuxjpev reçue le 2026-10-12", ctx)).toBe(
      "Commande Vinted chez chriss-reims reçue le 12/10/2026",
    );
  });

  it("traduit les transitions de statut", () => {
    expect(humanizeMessage("Sonic Superstars : colis retourné, jamais reçu — delivered → fulfilled", ctx)).toBe(
      "Sonic Superstars : colis retourné, jamais reçu — reçu → expédié",
    );
  });

  it("une ligne de commande ouvre le jeu qu'elle contient", () => {
    expect(activityGameId(entry("Commande order_muuxjpev reçue", ["order_muuxjpev"]), ctx)).toBe("game_ds_hotel-dusk");
  });

  it("une ligne d'exemplaire ouvre son jeu", () => {
    expect(activityGameId(entry("Exemplaire modifié", ["inv_switch_sonic-superstars"]), ctx)).toBe("game_switch_sonic-superstars");
  });
});
