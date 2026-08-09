import { getGameRows, getQuotes, getOrdersByGame, euro, type GameRow } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import { GameCard, GameGrid } from "@/components/GameCard";
import { GameDrawerProvider } from "@/components/GameDrawer";

const PRIORITY_LABELS: Record<string, string> = {
  haute: "priorité haute",
  moyenne: "priorité moyenne",
  basse: "priorité basse",
};
const PRIORITY_STYLES: Record<string, string> = {
  haute: "bg-[#f8717125] text-[#f87171]",
  moyenne: "bg-[#f5b64225] text-[#f5b642]",
  basse: "bg-[#8a93a825] text-[#8a93a8]",
};
const PRIORITY_ORDER: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function RecommendationCard({ row }: { row: GameRow }) {
  const quotes = getQuotes()[row.game.id];
  const price = quotes?.cib?.median ?? quotes?.loose?.median;
  const priority = row.game.buyPriority;
  return (
    <GameCard
      game={row.game}
      platform={row.platform}
      coverUrl={row.coverUrl}
      items={row.items}
      badge={
        priority ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${PRIORITY_STYLES[priority] ?? ""}`}
          >
            {priority}
          </span>
        ) : undefined
      }
      footer={price ? `cote ${euro(price)}${quotes?.cib ? " en boîte" : " loose"}` : "cote à saisir"}
    />
  );
}

export default function RecommendationsPage() {
  const wishlist = getGameRows().filter((r) => r.items.some((i) => i.status === "wishlist"));

  // regroupement par plateforme, la console la mieux fournie d'abord
  const byPlatform = new Map<string, GameRow[]>();
  for (const row of wishlist) {
    const list = byPlatform.get(row.game.platformId) ?? [];
    list.push(row);
    byPlatform.set(row.game.platformId, list);
  }
  const groups = [...byPlatform.entries()]
    .map(([platformId, rows]) => ({
      platformId,
      name: rows[0]?.platform?.name ?? platformId.toUpperCase(),
      rows: rows.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.game.buyPriority ?? "basse"] ?? 9) -
            (PRIORITY_ORDER[b.game.buyPriority ?? "basse"] ?? 9) ||
          (TIER_ORDER[a.game.qualityTier ?? "D"] ?? 9) - (TIER_ORDER[b.game.qualityTier ?? "D"] ?? 9),
      ),
    }))
    .sort((a, b) => b.rows.length - a.rows.length || a.name.localeCompare(b.name, "fr"));

  return (
    <GameDrawerProvider quotes={getQuotes()} orders={getOrdersByGame()}>
      <PageTitle
        title="Recommandations d'achat"
        sub="Jeux à viser, groupés par console puis par priorité et qualité — vérifie le prix sur l'Estimateur avant d'acheter"
      />
      {wishlist.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune recommandation — l&apos;agent en ajoute via{" "}
          <code className="font-mono">pnpm vault add-game --wishlist --quality … --priority …</code>.
        </div>
      ) : (
        groups.map(({ platformId, name, rows }) => {
          const counts = ["haute", "moyenne", "basse"]
            .map((p) => ({ p, n: rows.filter((r) => r.game.buyPriority === p).length }))
            .filter(({ n }) => n > 0);
          return (
            <section key={platformId} className="mb-10">
              <div className="mb-3 flex flex-wrap items-baseline gap-3 border-b border-border pb-2">
                <h2 className="text-xl font-semibold">{name}</h2>
                <span className="text-sm text-muted">
                  {rows.length} jeu{rows.length > 1 ? "x" : ""}
                </span>
                <div className="ml-auto flex flex-wrap gap-1.5">
                  {counts.map(({ p, n }) => (
                    <span
                      key={p}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[p] ?? ""}`}
                    >
                      {n} {PRIORITY_LABELS[p]}
                    </span>
                  ))}
                </div>
              </div>
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
        Un achat réalisé passe par <code className="font-mono">pnpm vault add-order</code> —
        l&apos;item wishlist bascule automatiquement en « commandé ».
      </p>
    </GameDrawerProvider>
  );
}
