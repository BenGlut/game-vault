import { getGameRows } from "@/lib/data";
import { PageTitle, GameLink } from "@/components/ui";

export default function DuplicatesPage() {
  const rows = getGameRows();
  const confirmed = rows.filter((r) =>
    r.items.some((i) => i.status === "duplicate" || i.quantity > 1),
  );
  const suspected = rows.filter(
    (r) => r.items.some((i) => i.quantityNeedsReview) && !confirmed.includes(r),
  );

  return (
    <div>
      <PageTitle
        title="Doublons"
        sub="Doublons confirmés (quantité > 1 ou statut doublon) et quantités à confirmer avec preuve"
      />
      <h2 className="mb-3 text-lg font-semibold">Confirmés ({confirmed.length})</h2>
      {confirmed.length === 0 ? (
        <p className="mb-6 text-sm text-muted">
          Aucun doublon confirmé. Les quantités ne sont fixées qu&apos;avec preuve.
        </p>
      ) : (
        <div className="mb-6 space-y-2">
          {confirmed.map((r) => (
            <GameLink key={r.game.id} row={r} />
          ))}
        </div>
      )}
      <h2 className="mb-3 text-lg font-semibold">À confirmer ({suspected.length})</h2>
      <div className="space-y-2">
        {suspected.map((r) => (
          <GameLink key={r.game.id} row={r} />
        ))}
      </div>
    </div>
  );
}
