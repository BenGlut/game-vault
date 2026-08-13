import {
  getOrders,
  getGameRows,
  getQuotes,
  getOrdersByGame,
  euro,
  type GameRow,
} from "@/lib/data";
import { PageTitle } from "@/components/ui";
import { GameDrawerProvider } from "@/components/GameDrawer";
import { OrdersClient } from "@/components/OrdersClient";
import type { OrderDrawerGame } from "@/components/OrderDrawer";

export default function OrdersPage() {
  const orders = getOrders().sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const allRows = getGameRows();
  const rows = new Map<string, GameRow>(allRows.map((r) => [r.game.id, r]));

  // seuls les jeux réellement commandés voyagent jusqu'au client
  const commandes = new Set(orders.flatMap((o) => o.gameIds));
  const rowsById: Record<string, GameRow> = {};
  const gamesLegers: Record<string, OrderDrawerGame> = {};
  for (const gid of commandes) {
    const r = rows.get(gid);
    if (!r) continue;
    rowsById[gid] = r;
    gamesLegers[gid] = {
      id: gid,
      title: r.game.canonicalTitle,
      platform: r.platform?.name ?? null,
      coverUrl: r.coverUrl,
    };
  }

  return (
    <div>
      <PageTitle
        title="Commandes"
        sub="Une commande annulée reste dans l'historique et n'est jamais comptée comme possédée"
      />
      {(() => {
        // ce qui est payé mais pas encore chez soi : la somme immobilisée
        const enCours = orders.filter((o) => o.status === "ordered" || o.status === "fulfilled");
        if (!enCours.length) return null;
        const valeur = enCours.reduce((s, o) => s + (o.totalPaid ?? 0), 0);
        const articles = enCours.reduce((s, o) => s + o.itemCount, 0);
        const expediees = enCours.filter((o) => o.status === "fulfilled");
        const attente = enCours.filter((o) => o.status === "ordered");
        return (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["En cours", `${enCours.length}`, "commandes non reçues"],
                ["Valeur", euro(valeur), "somme immobilisée"],
                ["Articles", `${articles}`, "en attente de réception"],
                [
                  "Acheminement",
                  `${expediees.length} / ${attente.length}`,
                  "expédiées / chez le vendeur",
                ],
              ] as const
            ).map(([label, val, hint]) => (
              <div key={label} className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
                <div className="mt-1 font-mono text-xl text-accent">{val}</div>
                <div className="mt-0.5 text-[11px] text-muted">{hint}</div>
              </div>
            ))}
          </div>
        );
      })()}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune commande enregistrée pour le moment.
          <div className="mt-2 text-xs">
            L&apos;agent en ajoute via <code className="font-mono">pnpm vault add-order</code>.
          </div>
        </div>
      ) : (
        <GameDrawerProvider quotes={getQuotes()} orders={getOrdersByGame()}>
          <OrdersClient orders={orders} rows={rowsById} games={gamesLegers} />
        </GameDrawerProvider>
      )}
    </div>
  );
}
