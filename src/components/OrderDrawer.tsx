"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { euro } from "@/lib/labels";
import type { PublicOrder } from "@/lib/data";
import { StatusBadge } from "@/components/ui";

/** Ce qu'il faut savoir d'un jeu pour l'afficher dans le panneau, sans traîner tout le GameRow. */
export interface OrderDrawerGame {
  id: string;
  title: string;
  platform: string | null;
  coverUrl: string | null;
}

interface OrderDrawerCtx {
  open: (o: PublicOrder) => void;
  enabled: boolean;
}

const Ctx = createContext<OrderDrawerCtx>({ open: () => {}, enabled: false });

export function useOrderDrawer(): OrderDrawerCtx {
  return useContext(Ctx);
}

const SOURCES: Record<string, string> = { vinted: "Vinted", leboncoin: "leboncoin", ebay: "eBay" };

/** Étapes de la commande, dans l'ordre où elles arrivent. */
function etapes(o: PublicOrder): { label: string; date: string | null; futur?: boolean }[] {
  const base: { label: string; date: string | null; futur?: boolean }[] = [
    { label: "Commandée", date: o.orderedAt },
    { label: "Expédiée par le vendeur", date: o.fulfilledAt },
    { label: "Reçue", date: o.deliveredAt },
  ];
  if (o.cancelledAt) base.push({ label: "Annulée", date: o.cancelledAt });
  if (o.refundedAt) base.push({ label: "Remboursée", date: o.refundedAt });
  if (o.estimatedDeliveryAt && !o.deliveredAt) {
    base.push({ label: "Livraison estimée", date: o.estimatedDeliveryAt, futur: true });
  }
  return base;
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}

export function OrderDrawerProvider({
  children,
  games = {},
}: {
  children: React.ReactNode;
  /** jeux indexés par identifiant, pour nommer les articles de la commande */
  games?: Record<string, OrderDrawerGame>;
}) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback((o: PublicOrder) => {
    setOrder(o);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => setOrder(null), 250);
  }, []);

  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [order, close]);

  // somme des lignes : sert à repérer une commande dont la répartition est incomplète
  const somme = order?.items.reduce((s, i) => s + (i.unitPrice ?? 0), 0) ?? 0;
  const complet = order?.items.every((i) => i.unitPrice !== null) ?? false;

  return (
    <Ctx.Provider value={{ open, enabled: true }}>
      {children}

      {order ? (
        <div className="pointer-events-none fixed inset-0 z-50" role="dialog" aria-label="Détail de la commande">
          <button
            type="button"
            aria-label="Fermer le panneau"
            onClick={close}
            className={`pointer-events-auto absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            className={`pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-border-strong bg-bg-elev shadow-[-25px_0_60px_-15px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="text-sm text-muted">
                    {SOURCES[order.marketplace] ?? order.marketplace}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold">
                  {order.itemCount} article{order.itemCount > 1 ? "s" : ""}
                  {order.totalPaid !== null ? (
                    <span className="ml-2 font-mono text-accent">{euro(order.totalPaid)}</span>
                  ) : null}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="rounded-full bg-surface-2 p-2 text-muted transition hover:text-fg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <section className="p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Suivi</h3>
              <ol className="space-y-2">
                {etapes(order).map((e) => (
                  <li key={e.label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        e.date ? (e.futur ? "bg-accent/40" : "bg-accent") : "bg-border-strong"
                      }`}
                    />
                    <span className={e.date ? "" : "text-muted"}>{e.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted">{e.date ?? "—"}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="px-5 pb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Articles achetés
              </h3>
              <ul className="space-y-2">
                {order.items.map((it, idx) => {
                  const g = games[it.gameId];
                  return (
                    <li
                      key={`${it.gameId}-${idx}`}
                      className="flex items-center gap-3 rounded-lg bg-surface p-2"
                    >
                      {g?.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.coverUrl}
                          alt=""
                          aria-hidden
                          className="h-14 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-14 w-10 shrink-0 rounded bg-surface-2" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm">{g?.title ?? it.gameId}</div>
                        {g?.platform ? (
                          <div className="text-xs text-muted">{g.platform}</div>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-mono text-sm text-accent">
                        {it.unitPrice !== null ? euro(it.unitPrice) : "à répartir"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="px-5 pb-8">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Détail
              </h3>
              <Ligne label="Source">{SOURCES[order.marketplace] ?? order.marketplace}</Ligne>
              <Ligne label="Articles">{order.itemCount}</Ligne>
              <Ligne label="Somme des lignes">
                <span className="font-mono">{euro(somme)}</span>
                {!complet ? <span className="ml-2 text-xs text-muted">(incomplète)</span> : null}
              </Ligne>
              <Ligne label="Total payé">
                <span className="font-mono text-accent">
                  {order.totalPaid !== null ? euro(order.totalPaid) : "—"}
                </span>
              </Ligne>
              <Ligne label="Référence interne">
                <span className="font-mono text-xs text-muted">{order.id}</span>
              </Ligne>
              <p className="mt-3 text-xs text-muted">
                Le vendeur et la référence de transaction restent dans le dépôt privé : ils ne
                sont jamais publiés.
              </p>
            </section>
          </aside>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
