"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Game, InventoryItem } from "@/lib/schema";
import { quotesByGame } from "@/lib/quotes";
import { computeStats, type CollectionStats, type GameRow } from "@/lib/stats";
import { ApiFailure, api, type VaultData } from "./api";
import { newInventoryLine } from "./model";

export type OrderAction = "fulfill" | "deliver" | "cancel" | "refund";

interface Toast {
  id: number;
  kind: "ok" | "error";
  text: string;
}

interface VaultCtx {
  data: VaultData;
  stats: CollectionStats;
  rowById: Map<string, GameRow>;
  saveGame: (next: Game) => Promise<boolean>;
  createGame: (game: Game, wishlist: boolean) => Promise<boolean>;
  saveItem: (next: InventoryItem) => Promise<boolean>;
  addItem: (gameId: string, status: "wishlist" | "owned") => Promise<boolean>;
  deleteItem: (item: InventoryItem) => Promise<boolean>;
  transitionOrder: (orderId: string, action: OrderAction, date: string) => Promise<boolean>;
  notify: (kind: Toast["kind"], text: string) => void;
}

const Ctx = createContext<VaultCtx | null>(null);
const ErrorCtx = createContext<Error | null>(null);

/** Base chargée — à n'utiliser que sous <VaultGate> (ou dans un composant ouvert après chargement). */
export function useVault(): VaultCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVault avant chargement de la base");
  return ctx;
}

/** Base si déjà chargée, sinon null (cadre de l'application, compteurs du menu). */
export function useVaultMaybe(): VaultCtx | null {
  return useContext(Ctx);
}

/** Affiche le contenu une fois la base chargée ; squelette ou erreur sinon. */
export function VaultGate({ children }: { children: ReactNode }) {
  const ctx = useContext(Ctx);
  const error = useContext(ErrorCtx);
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="font-medium">La base est inaccessible</p>
          <p className="mt-1 text-sm text-muted">{error.message}</p>
          <button type="button" onClick={() => location.reload()} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg">
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  return ctx ? <>{children}</> : <LoadingScreen />;
}

const upsert = <T extends { id: string }>(rows: T[], next: T): T[] =>
  rows.some((r) => r.id === next.id) ? rows.map((r) => (r.id === next.id ? next : r)) : [...rows, next];

const ORDER_LABELS: Record<OrderAction, string> = {
  fulfill: "Commande marquée expédiée",
  deliver: "Commande reçue : jeux ajoutés à la collection",
  cancel: "Commande annulée",
  refund: "Commande remboursée",
};

/**
 * Source unique de l'application : la base D1 chargée en une requête, puis tenue à
 * jour localement après chaque écriture validée par le serveur. Toutes les pages
 * lisent ce contexte, donc une modification se voit partout immédiatement.
 */
export function VaultProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<VaultData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    api.vault().then(setData, (e: Error) => {
      if (e instanceof ApiFailure && e.status === 401) {
        location.replace(`/connexion/?next=${encodeURIComponent(location.pathname + location.search)}`);
        return;
      }
      setError(e);
    });
  }, []);

  const notify = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "ok" ? 3200 : 8000);
  }, []);

  /** Écriture : le serveur valide, l'état local suit ; l'historique est rafraîchi en tâche de fond. */
  const write = useCallback(
    async (fn: () => Promise<void>, success: string): Promise<boolean> => {
      try {
        await fn();
        notify("ok", success);
        api.changeLog().then((changeLog) => setData((d) => d && { ...d, changeLog }), () => undefined);
        return true;
      } catch (e) {
        notify("error", e instanceof Error ? e.message : "Erreur inattendue");
        return false;
      }
    },
    [notify],
  );

  const quotes = useMemo(() => quotesByGame(data?.priceObservations ?? []), [data?.priceObservations]);
  const stats = useMemo(
    () =>
      computeStats({
        games: data?.games ?? [],
        inventory: data?.inventory ?? [],
        orders: data?.orders ?? [],
        platforms: data?.platforms ?? [],
        sellers: data?.sellers ?? [],
        quotes,
      }),
    [data?.games, data?.inventory, data?.orders, data?.platforms, data?.sellers, quotes],
  );
  const rowById = useMemo(() => new Map(stats.rows.map((r) => [r.game.id, r])), [stats.rows]);

  const title = useCallback(
    (gameId: string) => data?.games.find((g) => g.id === gameId)?.canonicalTitle ?? gameId,
    [data?.games],
  );

  const value = useMemo<VaultCtx | null>(() => {
    if (!data) return null;
    return {
      data,
      stats,
      rowById,
      notify,
      saveGame: (next) =>
        write(async () => {
          const saved = await api.replace("games", next, `Fiche modifiée en ligne : ${next.canonicalTitle}`);
          setData((d) => d && { ...d, games: upsert(d.games, saved) });
        }, "Fiche enregistrée"),
      createGame: (game, wishlist) =>
        write(async () => {
          const saved = await api.create("games", game, `Jeu ajouté en ligne : ${game.canonicalTitle}`);
          setData((d) => d && { ...d, games: [...d.games, saved] });
          if (wishlist) {
            const line = await api.create(
              "inventory",
              newInventoryLine(data.inventory, saved.id, "wishlist"),
              `Ajouté à la wishlist en ligne : ${game.canonicalTitle}`,
            );
            setData((d) => d && { ...d, inventory: [...d.inventory, line] });
          }
        }, wishlist ? "Jeu ajouté au catalogue et à la wishlist" : "Jeu ajouté au catalogue"),
      saveItem: (next) =>
        write(async () => {
          const saved = await api.replace("inventory", next, `Exemplaire modifié en ligne : ${title(next.gameId)}`);
          setData((d) => d && { ...d, inventory: upsert(d.inventory, saved) });
        }, "Exemplaire enregistré"),
      addItem: (gameId, status) =>
        write(
          async () => {
            const line = newInventoryLine(data.inventory, gameId, status);
            const label = status === "wishlist" ? "Ajouté à la wishlist" : "Exemplaire possédé ajouté";
            const saved = await api.create("inventory", line, `${label} en ligne : ${title(gameId)}`);
            setData((d) => d && { ...d, inventory: upsert(d.inventory, saved) });
          },
          status === "wishlist" ? "Ajouté à la wishlist" : "Exemplaire ajouté à la collection",
        ),
      deleteItem: (item) =>
        write(async () => {
          await api.remove("inventory", item.id, `Ligne supprimée en ligne : ${title(item.gameId)} (${item.status})`);
          setData((d) => d && { ...d, inventory: d.inventory.filter((i) => i.id !== item.id) });
        }, "Ligne supprimée"),
      transitionOrder: (orderId, action, date) =>
        write(async () => {
          const res = await api.transitionOrder(orderId, action, date);
          setData(
            (d) =>
              d && {
                ...d,
                orders: upsert(d.orders, res.order),
                inventory: res.inventory.reduce((rows, inv) => upsert(rows, inv), d.inventory),
              },
          );
        }, ORDER_LABELS[action]),
    };
  }, [data, stats, rowById, notify, write, title]);

  return (
    <ErrorCtx.Provider value={error}>
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[var(--shadow-card)] backdrop-blur ${
              t.kind === "ok" ? "border-ok/30 bg-[#0f1f16]/95 text-ok" : "border-ko/30 bg-[#241214]/95 text-ko"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ErrorCtx.Provider>
  );
}

function LoadingScreen() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la collection">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}
