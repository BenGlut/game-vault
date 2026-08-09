import { getGameRows, getQuotes, euro, type GameRow } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import { GameCard, GameGrid } from "@/components/GameCard";

const PRIORITY_ORDER = ["haute", "moyenne", "basse"] as const;
const PRIORITY_TITLES: Record<string, string> = {
  haute: "Priorité haute — à acheter dès que vu à bon prix",
  moyenne: "Priorité moyenne — si l'occasion se présente",
  basse: "Priorité basse — pour compléter, sans urgence",
};
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function RecommendationCard({ row }: { row: GameRow }) {
  const quotes = getQuotes()[row.game.id];
  const price = quotes?.cib?.median ?? quotes?.loose?.median;
  return (
    <GameCard
      game={row.game}
      platform={row.platform}
      coverUrl={row.coverUrl}
      items={row.items}
      footer={price ? `cote ${euro(price)}${quotes?.cib ? " en boîte" : " loose"}` : "cote à saisir"}
    />
  );
}

export default function RecommendationsPage() {
  const wishlist = getGameRows().filter((r) => r.items.some((i) => i.status === "wishlist"));

  return (
    <div>
      <PageTitle
        title="Recommandations d'achat"
        sub="Jeux à viser, classés par priorité et niveau de qualité — vérifie le prix sur l'Estimateur avant d'acheter"
      />
      {wishlist.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune recommandation — l&apos;agent en ajoute via{" "}
          <code className="font-mono">pnpm vault add-game --wishlist --quality … --priority …</code>.
        </div>
      ) : (
        PRIORITY_ORDER.map((priority) => {
          const rows = wishlist
            .filter((r) => r.game.buyPriority === priority)
            .sort(
              (a, b) =>
                (TIER_ORDER[a.game.qualityTier ?? "D"] ?? 9) -
                (TIER_ORDER[b.game.qualityTier ?? "D"] ?? 9),
            );
          if (!rows.length) return null;
          return (
            <section key={priority} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold">
                {PRIORITY_TITLES[priority]} <span className="text-sm text-muted">({rows.length})</span>
              </h2>
              <GameGrid>
                {rows.map((r) => (
                  <RecommendationCard key={r.game.id} row={r} />
                ))}
              </GameGrid>
            </section>
          );
        })
      )}
      <p className="text-xs text-muted">
        Un achat réalisé passe par <code className="font-mono">pnpm vault add-order</code> — l&apos;item
        wishlist bascule automatiquement en « commandé ».
      </p>
    </div>
  );
}
