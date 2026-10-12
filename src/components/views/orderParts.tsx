"use client";

import type { Order } from "@/lib/schema";
import { CheckIcon, XIcon } from "@/components/icons";
import { cx } from "@/components/ui/primitives";

export const dateFr = (d: string, year = false) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: year ? "numeric" : undefined });

const STEPS = [
  { key: "ordered", label: "Commandée", date: (o: Order) => o.orderedAt },
  { key: "fulfilled", label: "Expédiée", date: (o: Order) => o.fulfilledAt },
  { key: "delivered", label: "Reçue", date: (o: Order) => o.deliveredAt ?? o.estimatedDeliveryAt },
] as const;

const RANK: Record<string, number> = { ordered: 0, fulfilled: 1, delivered: 2, refunded: 2, cancelled: -1 };

/**
 * Suivi d'une commande en trois étapes (commandée → expédiée → reçue), dates sous
 * chaque étape ; une commande annulée ou remboursée l'indique en fin de parcours.
 */
export function OrderProgress({ order, compact = false }: { order: Order; compact?: boolean }) {
  const rank = RANK[order.status] ?? 0;
  const stopped = order.status === "cancelled" || order.status === "refunded";
  return (
    <ol className={cx("flex items-start", compact ? "gap-0" : "gap-0")} aria-label="Suivi de la commande">
      {STEPS.map((step, i) => {
        const done = rank >= i || (order.status === "cancelled" && i === 0);
        // étape attendue : la suivante de la dernière franchie
        const current = !stopped && i === rank + 1;
        const date = step.date(order);
        const estimate = step.key === "delivered" && !order.deliveredAt && order.estimatedDeliveryAt;
        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
            {i > 0 ? (
              <span className={cx("absolute right-1/2 top-[9px] h-0.5 w-full", rank >= i ? "bg-ok" : "bg-border-strong")} aria-hidden />
            ) : null}
            <span
              className={cx(
                "relative z-[1] flex h-5 w-5 items-center justify-center rounded-full border-2 text-on-fill",
                done ? "border-ok bg-ok" : current ? "border-info bg-surface" : "border-border-strong bg-surface",
              )}
            >
              {done ? <CheckIcon size={11} /> : current ? <span className="h-1.5 w-1.5 rounded-full bg-info" /> : null}
            </span>
            {!compact ? (
              <>
                <span className={cx("mt-1.5 text-[11px] font-medium", done ? "text-text" : "text-muted")}>{step.label}</span>
                <span className="text-[11px] tabular-nums text-muted">{date ? `${estimate ? "prévue " : ""}${dateFr(date)}` : "—"}</span>
              </>
            ) : null}
            <span className="sr-only">{done ? "faite" : "à venir"}</span>
          </li>
        );
      })}
      {stopped ? (
        <li className="relative flex flex-1 flex-col items-center text-center">
          <span className="absolute right-1/2 top-[9px] h-0.5 w-full bg-ko/50" aria-hidden />
          <span className="relative z-[1] flex h-5 w-5 items-center justify-center rounded-full border-2 border-ko bg-ko text-on-fill">
            <XIcon size={11} />
          </span>
          {!compact ? (
            <>
              <span className="mt-1.5 text-[11px] font-medium text-ko">{order.status === "cancelled" ? "Annulée" : "Remboursée"}</span>
              <span className="text-[11px] tabular-nums text-muted">
                {order.status === "cancelled" ? (order.cancelledAt ? dateFr(order.cancelledAt) : "—") : order.refundedAt ? dateFr(order.refundedAt) : "—"}
              </span>
            </>
          ) : null}
        </li>
      ) : null}
    </ol>
  );
}
