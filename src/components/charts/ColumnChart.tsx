"use client";

import { useState } from "react";
import { ACCENT, CHART, TOOLTIP_CLASS, niceTicks, useWidth } from "./core";

export interface Column {
  label: string;
  title: string;
  value: number;
  /** ligne secondaire de l'infobulle (ex. « 3 commandes ») */
  detail?: string;
}

const PAD = { top: 16, right: 8, bottom: 26, left: 48 };

/**
 * Colonnes d'une seule série : barres ≤ 24 px, bout arrondi 4 px, carré sur la
 * ligne de base, infobulle par colonne (la zone survolable couvre toute la bande).
 * Clavier : flèches gauche/droite.
 */
export default function ColumnChart({
  data,
  height = 220,
  format,
  axisFormat,
  color = ACCENT,
  highlightLast = false,
  label = "Graphique en colonnes",
}: {
  data: Column[];
  height?: number;
  format: (v: number) => string;
  axisFormat?: (v: number) => string;
  color?: string;
  /** colonne courante (mois en cours) en couleur pleine, les autres atténuées */
  highlightLast?: boolean;
  label?: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const ticks = niceTicks(Math.max(1, ...data.map((d) => d.value)));
  const top = ticks[ticks.length - 1] ?? 1;
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.min(24, Math.max(4, band * 0.6));
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 44))));
  const hovered = hover !== null ? data[hover] : undefined;

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(data.length - 1, (h ?? data.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
  }

  return (
    <div
      ref={ref}
      className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      style={{ height }}
      tabIndex={0}
      role="group"
      aria-label={`${label}. Flèches gauche et droite pour lire les valeurs.`}
      onKeyDown={onKey}
      onBlur={() => setHover(null)}
    >
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} style={{ stroke: t === 0 ? CHART.baseline : CHART.grid }} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} style={{ fill: CHART.muted }} className="tabular-nums">
                {(axisFormat ?? format)(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = PAD.left + band * i + band / 2;
            const h = Math.max(0, y(0) - y(d.value));
            const r = Math.min(4, barW / 2, h);
            const x0 = cx - barW / 2;
            const yTop = y(d.value);
            const dim = highlightLast && i !== data.length - 1 && hover !== i;
            const path =
              h <= 0
                ? ""
                : `M${x0},${y(0)} L${x0},${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} L${x0 + barW - r},${yTop} Q${x0 + barW},${yTop} ${x0 + barW},${yTop + r} L${x0 + barW},${y(0)} Z`;
            return (
              <g key={d.title}>
                {hover === i ? <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} style={{ fill: CHART.grid }} opacity={0.6} /> : null}
                {path ? <path d={path} style={{ fill: color }} fillOpacity={dim ? 0.45 : hover === i ? 1 : 0.9} /> : null}
                {i % every === 0 || i === data.length - 1 ? (
                  <text x={cx} y={height - 7} textAnchor="middle" fontSize={11} style={{ fill: CHART.muted }}>
                    {d.label}
                  </text>
                ) : null}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
      ) : null}
      {hovered && hover !== null ? (
        <div
          className={`${TOOLTIP_CLASS} top-0`}
          role="status"
          style={{ left: Math.min(Math.max(PAD.left + band * hover + band / 2 - 64, 0), Math.max(0, width - 144)) }}
        >
          <div className="text-sm font-semibold tabular-nums text-text">{format(hovered.value)}</div>
          <div className="text-muted">{hovered.title}</div>
          {hovered.detail ? <div className="text-muted">{hovered.detail}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
