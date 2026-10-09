"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game, InventoryItem, Order } from "@/lib/schema";
import { ApiFailure, api, loadAll, type VaultData } from "./api";
import { newInventoryLine } from "./model";
import { Button } from "./fields";
import GamesPanel from "./GamesPanel";
import OrdersPanel from "./OrdersPanel";
import NewGameForm from "./NewGameForm";
import HistoryPanel from "./HistoryPanel";

type Tab = "games" | "orders" | "new" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "games", label: "Jeux" },
  { id: "orders", label: "Commandes" },
  { id: "new", label: "Nouveau jeu" },
  { id: "history", label: "Historique" },
];

interface Toast {
  kind: "ok" | "error";
  text: string;
}

/**
 * Écran de gestion en ligne : lit et écrit la base D1 via l'API privée. Chaque
 * écriture est validée côté serveur (mêmes schémas que la CLI) puis répercutée
 * localement sans recharger toute la base.
 */
export default function ManageClient() {
  const [data, setData] = useState<VaultData | null>(null);
  const [loadError, setLoadError] = useState<ApiFailure | Error | null>(null);
  const [tab, setTab] = useState<Tab>("games");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    loadAll().then(setData, setLoadError);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "ok" ? 3000 : 8000);
    return () => clearTimeout(t);
  }, [toast]);

  /** Exécute une écriture et affiche le résultat ; renvoie false en cas d'échec (le brouillon reste). */
  const write = useCallback(async (fn: () => Promise<void>, success: string): Promise<boolean> => {
    try {
      await fn();
      setToast({ kind: "ok", text: success });
      setHistoryKey((k) => k + 1);
      return true;
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Erreur inattendue" });
      return false;
    }
  }, []);

  const upsert = <T extends { id: string }>(rows: T[], next: T) =>
    rows.some((r) => r.id === next.id) ? rows.map((r) => (r.id === next.id ? next : r)) : [...rows, next];

  if (loadError) {
    const needsLogin = loadError instanceof ApiFailure && loadError.status === 401;
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm">
        {needsLogin ? (
          <>
            Session expirée.{" "}
            <a className="text-accent underline" href="/connexion/?next=/gestion/">
              Se reconnecter
            </a>
          </>
        ) : (
          <span className="text-ko">Base inaccessible : {loadError.message}</span>
        )}
      </div>
    );
  }
  if (!data) return <p className="text-sm text-muted">Chargement de la base…</p>;

  const saveGame = (next: Game) =>
    write(async () => {
      const saved = await api.replace("games", next, `Fiche modifiée en ligne : ${next.canonicalTitle}`);
      setData((d) => d && { ...d, games: upsert(d.games, saved) });
    }, "Fiche enregistrée");

  const gameTitle = (id: string) => data.games.find((g) => g.id === id)?.canonicalTitle ?? id;

  const saveItem = (next: InventoryItem) =>
    write(async () => {
      const saved = await api.replace("inventory", next, `Exemplaire modifié en ligne : ${gameTitle(next.gameId)}`);
      setData((d) => d && { ...d, inventory: upsert(d.inventory, saved) });
    }, "Exemplaire enregistré");

  const deleteItem = (item: InventoryItem) =>
    write(async () => {
      await api.remove("inventory", item.id, `Ligne supprimée en ligne : ${gameTitle(item.gameId)} (${item.status})`);
      setData((d) => d && { ...d, inventory: d.inventory.filter((i) => i.id !== item.id) });
    }, "Ligne supprimée");

  const addItem = (gameId: string, status: "wishlist" | "owned") =>
    write(async () => {
      const line = newInventoryLine(data.inventory, gameId, status);
      const label = status === "wishlist" ? "Ajouté à la wishlist" : "Exemplaire possédé ajouté";
      const saved = await api.create("inventory", line, `${label} en ligne : ${gameTitle(gameId)}`);
      setData((d) => d && { ...d, inventory: upsert(d.inventory, saved) });
    }, status === "wishlist" ? "Ajouté à la wishlist" : "Exemplaire ajouté");

  const createGame = (game: Game, wishlist: boolean) =>
    write(async () => {
      const saved = await api.create("games", game, `Jeu ajouté en ligne : ${game.canonicalTitle}`);
      let inventory = data.inventory;
      if (wishlist) {
        const line = await api.create(
          "inventory",
          newInventoryLine(inventory, saved.id, "wishlist"),
          `Ajouté à la wishlist en ligne : ${game.canonicalTitle}`,
        );
        inventory = [...inventory, line];
      }
      setData((d) => d && { ...d, games: [...d.games, saved], inventory });
      setSelectedId(saved.id);
      setTab("games");
    }, wishlist ? "Jeu ajouté au catalogue et à la wishlist" : "Jeu ajouté au catalogue");

  const transition = (order: Order, action: string, date: string) =>
    write(async () => {
      const res = await api.transitionOrder(order.id, action, date);
      setData(
        (d) =>
          d && {
            ...d,
            orders: upsert(d.orders, res.order),
            inventory: res.inventory.reduce((rows, inv) => upsert(rows, inv), d.inventory),
          },
      );
    }, "Commande mise à jour");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-xl border border-border bg-surface p-1" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                tab === t.id ? "bg-accent text-bg font-medium" : "text-muted hover:text-text"
              }`}
            >
              {t.label}
              {t.id === "orders" ? (
                <span className="ml-1.5 text-xs opacity-70">
                  {data.orders.filter((o) => ["ordered", "fulfilled"].includes(o.status)).length}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <Button onClick={() => api.logout().finally(() => location.assign("/connexion/"))}>Se déconnecter</Button>
      </div>

      {tab === "games" ? (
        <GamesPanel
          data={data}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSaveGame={saveGame}
          onSaveItem={saveItem}
          onDeleteItem={deleteItem}
          onAddItem={addItem}
        />
      ) : null}
      {tab === "orders" ? <OrdersPanel data={data} onTransition={transition} /> : null}
      {tab === "new" ? <NewGameForm data={data} onCreate={createGame} /> : null}
      {tab === "history" ? <HistoryPanel refreshKey={historyKey} /> : null}

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-[var(--shadow-card)] ${
            toast.kind === "ok"
              ? "border-[#4ade8050] bg-[#0f1f16] text-ok"
              : "border-[#f8717150] bg-[#241214] text-ko"
          }`}
        >
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}
