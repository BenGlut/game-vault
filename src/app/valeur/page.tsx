import Link from "next/link";
import { getGameRows, getStats, euro, POSSESSION } from "@/lib/data";
import { PageTitle, StatCard } from "@/components/ui";

export default function ValuePage() {
  const stats = getStats();
  const rows = getGameRows();
  const withEstimate = rows
    .filter((r) => r.items.some((i) => i.currentEstimate && POSSESSION.includes(i.status)))
    .sort((a, b) => {
      const ea = a.items[0]?.currentEstimate?.median ?? 0;
      const eb = b.items[0]?.currentEstimate?.median ?? 0;
      return eb - ea;
    });
  const missing = rows.filter(
    (r) => r.items.some((i) => POSSESSION.includes(i.status)) && !r.items.some((i) => i.currentEstimate),
  );

  const low = withEstimate.reduce(
    (s, r) => s + r.items.reduce((x, i) => x + (i.currentEstimate?.low ?? 0) * i.quantity, 0),
    0,
  );
  const high = withEstimate.reduce(
    (s, r) => s + r.items.reduce((x, i) => x + (i.currentEstimate?.high ?? 0) * i.quantity, 0),
    0,
  );

  return (
    <div>
      <PageTitle
        title="Valeur de la collection"
        sub="Les cotes sont des observations datées, jamais des valeurs absolues"
      />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Fourchette basse" value={low ? euro(low) : "—"} />
        <StatCard label="Médiane" value={stats.estimateTotal ? euro(stats.estimateTotal) : "—"} />
        <StatCard label="Fourchette haute" value={high ? euro(high) : "—"} />
      </div>

      {withEstimate.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
          Aucune cote saisie pour le moment.
          <div className="mt-2 text-xs">
            L&apos;agent ajoute des cotes via <code className="font-mono">pnpm vault add-price</code> —
            chaque observation garde sa source et sa date.
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {withEstimate.map((r) => {
            const est = r.items.find((i) => i.currentEstimate)?.currentEstimate;
            return (
              <Link
                key={r.game.id}
                href={`/jeu/${r.game.id}/`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-accent/40"
              >
                <span className="truncate">{r.game.canonicalTitle}</span>
                <span className="shrink-0 font-mono text-sm">
                  {euro(est?.low)} / <span className="text-accent">{euro(est?.median)}</span> /{" "}
                  {euro(est?.high)}
                  <span className="ml-2 text-xs text-muted">
                    ({est?.source}, {est?.observedAt})
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {missing.length > 0 ? (
        <p className="mt-6 text-xs text-muted">{missing.length} jeux possédés sans cote.</p>
      ) : null}
    </div>
  );
}
