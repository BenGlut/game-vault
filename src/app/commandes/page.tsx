import {
  getOrders,
  getGameRows,
  getQuotes,
  getOrdersByGame,
  euro,
  type GameRow,
} from "@/lib/data";
import { PageTitle, StatusBadge } from "@/components/ui";
import { GameCard } from "@/components/GameCard";
import { GameDrawerProvider } from "@/components/GameDrawer";

export default function OrdersPage() {
  const orders = getOrders().sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const rows = new Map<string, GameRow>(getGameRows().map((r) => [r.game.id, r]));

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
        <GameDrawerProvider quotes={getQuotes()} orders={getOrdersByGame()}>
          <div className="space-y-5">
            {orders.map((o) => (
              <section key={o.id} className="rounded-2xl border border-border bg-surface p-4">
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
                      <div className="mt-0.5 text-accent">
                        livraison estimée le {o.estimatedDeliveryAt}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* jaquettes des jeux de la commande */}
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {o.gameIds.map((gid, idx) => {
                    const row = rows.get(gid);
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
            ))}
          </div>
        </GameDrawerProvider>
      )}
    </div>
  );
}
