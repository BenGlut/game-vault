import { getChangeLog } from "@/lib/data";
import { PageTitle } from "@/components/ui";

export default function HistoryPage() {
  const log = [...getChangeLog()].reverse();
  return (
    <div>
      <PageTitle
        title="Historique"
        sub="Journal des mutations — chaque modification de données crée une entrée"
      />
      <div className="space-y-2">
        {log.map((entry, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className="text-sm">{entry.message}</div>
            <div className="mt-1 text-xs text-muted">
              <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">{entry.command}</span>{" "}
              — {new Date(entry.at).toLocaleString("fr-FR")}
            </div>
          </div>
        ))}
        {log.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center text-muted">
            Aucune entrée.
          </div>
        ) : null}
      </div>
    </div>
  );
}
