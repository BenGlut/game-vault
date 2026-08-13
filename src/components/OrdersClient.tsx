"use client";

import { useMemo, useState } from "react";
import { euro } from "@/lib/labels";
import type { PublicOrder, GameRow } from "@/lib/data";
import { StatusBadge } from "@/components/ui";
import { GameCard } from "@/components/GameCard";
import { OrderDrawerProvider, useOrderDrawer, type OrderDrawerGame } from "@/components/OrderDrawer";

/** Regroupement métier : une commande annulée ou remboursée n'est ni en cours ni terminée. */
const FILTRES = [
  { cle: "toutes", label: "Toutes", statuts: null as string[] | null },
  { cle: "encours", label: "En cours", statuts: ["ordered", "fulfilled"] },
  { cle: "termine", label: "Terminées", statuts: ["delivered"] },
  { cle: "annule", label: "Annulées", statuts: ["cancelled", "refunded"] },
];

function CarteCommande({ o, rows }: { o: PublicOrder; rows: Record<string, GameRow> }) {
  const drawer = useOrderDrawer();
  return (
    <section
      id={o.id}
      onClick={() => drawer.open(o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          drawer.open(o);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Détail de la commande du ${o.orderedAt}`}
      className="scroll-mt-24 cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:border-border-strong focus:outline-none focus-visible:border-accent target:border-accent"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={o.status} />
          <span className="text-sm capitalize text-muted">{o.marketplace}</span>
          <span className="text-xs text-muted">
            {o.itemCount} article{o.itemCount > 1 ? "s" : ""}
          </span>
          {o.totalPaid !== null ? (
            <span className="font-mono text-sm text-accent">{euro(o.totalPaid)}</span>
          ) : null}
        </div>
        <div className="text-right text-xs text-muted">
          <div>
            Commandé le {o.orderedAt}
            {o.fulfilledAt ? ` — expédié le ${o.fulfilledAt}` : ""}
            {o.deliveredAt ? ` — reçu le ${o.deliveredAt}` : ""}
            {o.cancelledAt ? ` — annulé le ${o.cancelledAt}` : ""}
            {o.refundedAt ? ` — remboursé le ${o.refundedAt}` : ""}
          </div>
          {o.estimatedDeliveryAt && !o.deliveredAt ? (
            <div className="mt-0.5 text-accent">livraison estimée le {o.estimatedDeliveryAt}</div>
          ) : null}
        </div>
      </div>

      {/* les jaquettes gardent leur propre panneau : on ne remonte pas le clic */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
      >
        {o.gameIds.map((gid, idx) => {
          const row = rows[gid];
          const price = o.items?.[idx]?.unitPrice ?? null;
          return row ? (
            <GameCard
              key={`${gid}-${idx}`}
              game={row.game}
              platform={row.platform}
              coverUrl={row.coverUrl}
              items={row.items}
              showStatus={false}
              footer={
                price !== null ? (
                  <span className="font-mono text-accent">{euro(price)}</span>
                ) : (
                  "prix à répartir"
                )
              }
            />
          ) : (
            <div
              key={`${gid}-${idx}`}
              className="flex aspect-[3/4] items-center justify-center rounded-lg bg-surface-2 p-2 text-center text-[11px] text-muted"
            >
              {gid}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function OrdersClient({
  orders,
  rows,
  games,
}: {
  orders: PublicOrder[];
  rows: Record<string, GameRow>;
  games: Record<string, OrderDrawerGame>;
}) {
  const [filtre, setFiltre] = useState("toutes");

  const comptes = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of FILTRES) {
      c[f.cle] = f.statuts ? orders.filter((o) => f.statuts!.includes(o.status)).length : orders.length;
    }
    return c;
  }, [orders]);

  const visibles = useMemo(() => {
    const f = FILTRES.find((x) => x.cle === filtre);
    return f?.statuts ? orders.filter((o) => f.statuts!.includes(o.status)) : orders;
  }, [orders, filtre]);

  return (
    <OrderDrawerProvider games={games}>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.cle}
            type="button"
            onClick={() => setFiltre(f.cle)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              filtre === f.cle
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-fg"
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">{comptes[f.cle]}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune commande dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-5">
          {visibles.map((o) => (
            <CarteCommande key={o.id} o={o} rows={rows} />
          ))}
        </div>
      )}
    </OrderDrawerProvider>
  );
}
