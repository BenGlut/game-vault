import Link from "next/link";
import { getGameRows, getQuotes, euro, type GameRow } from "@/lib/data";
import { PageTitle, QualityBadge } from "@/components/ui";

const PRIORITY_ORDER = ["haute", "moyenne", "basse"] as const;
const PRIORITY_TITLES: Record<string, string> = {
  haute: "Priorité haute — à acheter dès que vu à bon prix",
  moyenne: "Priorité moyenne — si l'occasion se présente",
  basse: "Priorité basse — pour compléter, sans urgence",
};
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

function RecommendationCard({ row }: { row: GameRow }) {
  const quotes = getQuotes()[row.game.id];
  return (
    <Link
      href={`/jeu/${row.game.id}/`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent/40 hover:bg-surface-2"
    >
      {row.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.coverUrl} alt="" loading="lazy" className="h-16 w-14 shrink-0 rounded object-cover" />
      ) : (
        <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded bg-surface-2 text-xs text-muted">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{row.game.canonicalTitle}</span>
          <QualityBadge tier={row.game.qualityTier} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
            {row.platform?.shortName ?? row.game.platformId}
          </span>
          {row.game.franchise ? <span>{row.game.franchise}</span> : null}
        </div>
      </div>
      <div className="shrink-0 text-right text-xs text-muted">
        {quotes?.cib ? (
          <div>
            CIB <span className="font-mono text-accent">{euro(quotes.cib.median)}</span>
          </div>
        ) : null}
        {quotes?.loose ? (
          <div>
            loose <span className="font-mono">{euro(quotes.loose.median)}</span>
          </div>
        ) : (
          !quotes?.cib && <div>cote à saisir</div>
        )}
      </div>
    </Link>
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
              <div className="grid gap-2 lg:grid-cols-2">
                {rows.map((r) => (
                  <RecommendationCard key={r.game.id} row={r} />
                ))}
              </div>
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
