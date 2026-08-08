import Link from "next/link";
import { getStats, getChangeLog, getGameRows, STATUS_LABELS } from "@/lib/data";
import { StatCard, PageTitle, GameLink } from "@/components/ui";

export default function Dashboard() {
  const stats = getStats();
  const log = getChangeLog().slice(-6).reverse();
  const rows = getGameRows();
  const needsReview = rows.filter((r) => r.items.some((i) => i.verificationStatus !== "verified"));
  const quantityReview = rows.filter((r) => r.items.some((i) => i.quantityNeedsReview));

  return (
    <div>
      <PageTitle
        title="Dashboard"
        sub={`Export généré le ${new Date(stats.generatedAt).toLocaleString("fr-FR")}`}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jeux référencés" value={String(stats.totalGames)} />
        <StatCard label="Exemplaires possédés" value={String(stats.ownedItems)} />
        <StatCard
          label="À vérifier"
          value={String(stats.needsReview)}
          sub="fiches en needs_review"
        />
        <StatCard
          label="Valeur estimée"
          value={stats.estimateTotal ? `${stats.estimateTotal.toFixed(0)} €` : "—"}
          sub={stats.estimateTotal ? "médiane des cotes" : "aucune cote saisie"}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Par statut</h2>
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2"
              >
                <span className="text-sm">{STATUS_LABELS[status] ?? status}</span>
                <span className="font-mono text-sm text-accent">{count}</span>
              </div>
            ))}
          </div>
          <h2 className="mt-6 mb-3 text-lg font-semibold">Par plateforme</h2>
          <div className="space-y-2">
            {Object.entries(stats.byPlatform).map(([platform, count]) => (
              <Link
                key={platform}
                href={`/collection/?plateforme=${platform}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 transition hover:border-accent/40"
              >
                <span className="text-sm uppercase">{platform}</span>
                <span className="font-mono text-sm text-accent">{count} jeux</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Quantités à confirmer ({quantityReview.length})
          </h2>
          <div className="space-y-2">
            {quantityReview.slice(0, 8).map((r) => (
              <GameLink key={r.game.id} row={r} />
            ))}
          </div>
          <h2 className="mt-6 mb-3 text-lg font-semibold">Dernières modifications</h2>
          <div className="space-y-2">
            {log.map((entry, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-surface px-4 py-2">
                <div className="text-sm">{entry.message}</div>
                <div className="mt-0.5 text-xs text-muted">
                  <span className="font-mono">{entry.command}</span> —{" "}
                  {new Date(entry.at).toLocaleString("fr-FR")}
                </div>
              </div>
            ))}
          </div>
          {needsReview.length > 0 ? (
            <p className="mt-4 text-xs text-muted">
              {needsReview.length} jeux attendent une vérification physique — voir{" "}
              <Link href="/collection/?verif=needs_review" className="text-accent underline">
                la liste
              </Link>
              .
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
