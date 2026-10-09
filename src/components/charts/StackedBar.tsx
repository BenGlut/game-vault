"use client";

import { useState } from "react";
import { SERIES } from "./core";

export interface Segment {
  key: string;
  label: string;
  value: number;
}

/**
 * Composition en une barre 100 % : segments séparés par 2 px de fond, couleurs
 * catégorielles dans l'ordre fixe (au-delà de 7, regroupées en « Autres »),
 * légende toujours présente avec la part de chaque segment.
 */
export default function StackedBar({
  segments,
  format,
  colors,
}: {
  segments: Segment[];
  format: (v: number) => string;
  /** couleur imposée par clé (une entité garde sa couleur d'un graphique à l'autre) */
  colors?: Record<string, string>;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const sorted = [...segments].filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, 7);
  const rest = sorted.slice(7);
  const parts = rest.length
    ? [...head, { key: "__other", label: "Autres", value: rest.reduce((s, x) => s + x.value, 0) }]
    : head;
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const colorOf = (p: Segment, i: number) => (p.key === "__other" ? "#4b5265" : colors?.[p.key] ?? SERIES[i] ?? "#4b5265");

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
        {parts.map((p, i) => (
          <div
            key={p.key}
            title={`${p.label} : ${format(p.value)}`}
            onPointerEnter={() => setHover(p.key)}
            onPointerLeave={() => setHover(null)}
            className="h-full transition-opacity first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(p.value / total) * 100}%`,
              background: colorOf(p, i),
              opacity: hover && hover !== p.key ? 0.4 : 1,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        {parts.map((p, i) => (
          <li
            key={p.key}
            className={`flex items-center justify-between gap-2 rounded-md px-1 transition ${hover === p.key ? "bg-surface-2" : ""}`}
            onPointerEnter={() => setHover(p.key)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: colorOf(p, i) }} />
              <span className="truncate">{p.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-text">
              {format(p.value)} <span className="text-muted">· {Math.round((p.value / total) * 100)} %</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
