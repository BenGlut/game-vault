"use client";

import { useMemo, useState } from "react";
import type { Order } from "@/lib/schema";
import { euro } from "@/lib/labels";
import { StatusBadge } from "@/components/ui";
import { Button, inputClass } from "./fields";
import type { VaultData } from "./api";
import { today } from "./model";

type Action = "fulfill" | "deliver" | "cancel" | "refund";

const ACTIONS: { action: Action; label: string; from: string[]; risky?: boolean }[] = [
  { action: "fulfill", label: "Expédiée", from: ["ordered"] },
  { action: "deliver", label: "Reçue", from: ["ordered", "fulfilled"] },
  { action: "cancel", label: "Annulée", from: ["ordered", "fulfilled"], risky: true },
  { action: "refund", label: "Remboursée", from: ["ordered", "fulfilled", "delivered"], risky: true },
];

function OrderCard({
  order,
  data,
  onTransition,
}: {
  order: Order;
  data: VaultData;
  onTransition: (order: Order, action: Action, date: string) => Promise<unknown>;
}) {
  const [date, setDate] = useState(today());
  const [pending, setPending] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const seller = data.sellers.find((s) => s.id === order.sellerId);
  const title = (gameId: string) => data.games.find((g) => g.id === gameId)?.canonicalTitle ?? gameId;
  const available = ACTIONS.filter((a) => a.from.includes(order.status));

  async function run(action: Action) {
    setBusy(true);
    try {
      await onTransition(order, action, date);
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="text-sm font-medium capitalize">{order.marketplace}</span>
            {seller ? <span className="text-sm text-muted">· {seller.name}</span> : null}
          </div>
          <div className="mt-1 text-xs text-muted">
            Commandée le {order.orderedAt}
            {order.fulfilledAt ? ` · expédiée le ${order.fulfilledAt}` : ""}
            {order.estimatedDeliveryAt ? ` · prévue le ${order.estimatedDeliveryAt}` : ""}
            {" · "}
            <code>{order.id}</code>
          </div>
        </div>
        <div className="text-right text-sm font-semibold">{euro(order.totalPaid)}</div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((it, n) => (
          <li key={`${it.gameId}-${n}`} className="flex justify-between gap-3">
            <span className="truncate">{title(it.gameId)}</span>
            <span className="shrink-0 text-muted">{euro(it.unitPrice)}</span>
          </li>
        ))}
      </ul>
      {available.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <input
            className={`${inputClass} w-auto`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date de l’événement"
          />
          {pending ? (
            <>
              <span className="basis-full text-xs text-ko sm:basis-auto">
                Marquer {ACTIONS.find((a) => a.action === pending)?.label.toLowerCase()} le {date} ?
              </span>
              <Button onClick={() => setPending(null)}>Non</Button>
              <Button variant="danger" disabled={busy} onClick={() => run(pending)}>
                Confirmer
              </Button>
            </>
          ) : (
            available.map((a) => (
              <Button
                key={a.action}
                variant={a.action === "deliver" ? "primary" : a.risky ? "danger" : "secondary"}
                disabled={busy || !date}
                onClick={() => (a.risky ? setPending(a.action) : run(a.action))}
              >
                {a.label}
              </Button>
            ))
          )}
        </div>
      ) : null}
    </li>
  );
}

export default function OrdersPanel({
  data,
  onTransition,
}: {
  data: VaultData;
  onTransition: (order: Order, action: Action, date: string) => Promise<unknown>;
}) {
  const [showAll, setShowAll] = useState(false);
  const orders = useMemo(
    () =>
      data.orders
        .filter((o) => showAll || ["ordered", "fulfilled"].includes(o.status))
        .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))
        .slice(0, showAll ? 40 : undefined),
    [data.orders, showAll],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {showAll ? "Les 40 commandes les plus récentes." : "Commandes pas encore reçues."} Une réception passe les jeux
          dans la collection.
        </p>
        <Button onClick={() => setShowAll((v) => !v)}>{showAll ? "En cours seulement" : "Voir les récentes"}</Button>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Aucune commande en cours.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={`${o.id}:${o.status}`} order={o} data={data} onTransition={onTransition} />
          ))}
        </ul>
      )}
    </div>
  );
}
