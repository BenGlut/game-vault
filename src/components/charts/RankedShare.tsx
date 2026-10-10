"use client";

import { intFmt } from "./core";

export interface ShareRow {
  key: string;
  label: string;
  /** ce que recouvre la catégorie, en clair */
  hint: string;
  count: number;
}

/**
 * Répartition lisible d'une qualité ordonnée (complétude, état) : une ligne par
 * catégorie dans l'ordre logique, part en % des exemplaires renseignés, et les
 * exemplaires « non renseignés » mis à part au lieu d'écraser le graphique.
 */
export default function RankedShare({
  rows,
  unknown,
  unit = "exemplaire",
  color,
}: {
  rows: ShareRow[];
  unknown: number;
  unit?: string;
  color: string;
}) {
  const known = rows.reduce((s, r) => s + r.count, 0);
  const total = known + unknown;
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3 text-xs text-muted">
        <span>
          <span className="text-sm font-semibold text-text">{total ? Math.round((known / total) * 100) : 0} %</span> renseignés
        </span>
        <span>
          {intFmt.format(known)} sur {intFmt.format(total)} {unit}s
        </span>
      </div>
      <ul className="space-y-3">
        {rows.map((r) => {
          const pct = known ? Math.round((r.count / known) * 100) : 0;
          return (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-sm">{r.label}</span>
                  <span className="ml-1.5 text-xs text-muted">{r.hint}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {intFmt.format(r.count)} <span className="text-xs text-muted">· {pct} %</span>
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-surface-2">
                <div
                  className="h-2 rounded-full transition-[width] duration-500"
                  style={{ width: `${r.count ? Math.max(2, (r.count / max) * 100) : 0}%`, background: color, opacity: r.count ? 1 : 0 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {unknown ? (
        <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
          {intFmt.format(unknown)} {unit}
          {unknown > 1 ? "s" : ""} non renseigné{unknown > 1 ? "s" : ""} : à compléter depuis la fiche du jeu.
        </p>
      ) : null}
    </div>
  );
}
