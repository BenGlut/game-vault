import { getOrders, getGames, euro, STATUS_LABELS } from "@/lib/data";
import { PageTitle, StatusBadge } from "@/components/ui";
import Link from "next/link";

export default function OrdersPage() {
  const orders = getOrders().sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const games = new Map(getGames().map((g) => [g.id, g]));

  return (
    <div>
      <PageTitle
        title="Commandes"
        sub="Une commande annulée reste dans l'historique et n'est jamais comptée comme possédée"
      />
      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune commande enregistrée pour le moment.
          <div className="mt-2 text-xs">
            L&apos;agent en ajoute via <code className="font-mono">pnpm vault add-order</code>.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <span className="text-sm capitalize text-muted">{o.marketplace}</span>
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
                    <div className="mt-0.5 text-accent">
                      livraison estimée le {o.estimatedDeliveryAt}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {o.gameIds.map((gid) => {
                  const g = games.get(gid);
                  return g ? (
                    <Link key={gid} href={`/jeu/${gid}/`} className="block text-sm hover:text-accent">
                      • {g.canonicalTitle}
                    </Link>
                  ) : (
                    <span key={gid} className="block text-sm text-muted">
                      • {gid}
                    </span>
                  );
                })}
              </div>
              {o.totalPaid !== null ? (
                <div className="mt-2 text-sm text-muted">Total payé : {euro(o.totalPaid)}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted">
        Statuts possibles : {Object.values(STATUS_LABELS).slice(0, 4).join(", ")}…
      </p>
    </div>
  );
}
