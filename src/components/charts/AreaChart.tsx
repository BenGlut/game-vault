"use client";

import { useId, useState } from "react";
import { ACCENT, CHART, TOOLTIP_CLASS, niceTicks, useWidth } from "./core";

export interface AreaSeries {
  key: string;
  label: string;
  color?: string;
  /** remplissage léger sous la courbe (série principale) */
  fill?: boolean;
}

export interface AreaPoint {
  /** libellé court sur l'axe */
  label: string;
  /** libellé complet dans l'infobulle */
  title: string;
  values: Record<string, number>;
}

const PAD = { top: 12, right: 12, bottom: 26, left: 48 };

/**
 * Courbe(s) dans le temps sur un seul axe. Réticule vertical qui s'aligne sur le
 * point le plus proche, infobulle listant toutes les séries, légende dès 2 séries.
 * Clavier : flèches gauche/droite pour parcourir les points.
 */
export default function AreaChart({
  data,
  series,
  height = 240,
  format,
  axisFormat,
}: {
  data: AreaPoint[];
  series: AreaSeries[];
  height?: number;
  format: (v: number) => string;
  axisFormat?: (v: number) => string;
}) {
  const uid = useId().replace(/:/g, "");
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const colorOf = (s: AreaSeries) => s.color ?? ACCENT;

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] ?? max;
  const x = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  // une étiquette d'axe toutes les ~64 px
  const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 64))));

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = data.length <= 1 ? 0 : Math.round((px / rect.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(data.length - 1, (h ?? data.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
  }

  const hovered = hover !== null ? data[hover] : undefined;
  const label = series.map((s) => s.label).join(", ");

  return (
    <div>
      {series.length > 1 ? (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Légende">
          {series.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: colorOf(s) }} />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div
        ref={ref}
        className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-label={`Graphique : ${label}. Flèches gauche et droite pour lire les valeurs.`}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        {width > 0 && data.length ? (
          <svg width={width} height={height} role="img" aria-label={label}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: colorOf(s), stopOpacity: 0.22 }} />
                  <stop offset="100%" style={{ stopColor: colorOf(s), stopOpacity: 0.01 }} />
                </linearGradient>
              ))}
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} style={{ stroke: t === 0 ? CHART.baseline : CHART.grid }} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} style={{ fill: CHART.muted }} className="tabular-nums">
                  {(axisFormat ?? format)(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) =>
              i % every === 0 || i === data.length - 1 ? (
                <text key={d.title} x={x(i)} y={height - 7} textAnchor="middle" fontSize={11} style={{ fill: CHART.muted }}>
                  {d.label}
                </text>
              ) : null,
            )}
            {series.map((s) => {
              const pts = data.map((d, i) => `${x(i)},${y(d.values[s.key] ?? 0)}`);
              return (
                <g key={s.key}>
                  {s.fill ? <path d={`M${x(0)},${y(0)} L${pts.join(" L")} L${x(data.length - 1)},${y(0)} Z`} fill={`url(#${uid}-${s.key})`} /> : null}
                  <polyline points={pts.join(" ")} fill="none" style={{ stroke: colorOf(s) }} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  <circle
                    cx={x(data.length - 1)}
                    cy={y(data[data.length - 1]?.values[s.key] ?? 0)}
                    r={3.5}
                    style={{ fill: colorOf(s), stroke: CHART.surface }}
                    strokeWidth={2}
                  />
                </g>
              );
            })}
            {hovered && hover !== null ? (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} style={{ stroke: CHART.muted }} strokeOpacity={0.45} strokeDasharray="3 3" />
                {series.map((s) => (
                  <circle key={s.key} cx={x(hover)} cy={y(hovered.values[s.key] ?? 0)} r={4.5} style={{ fill: colorOf(s), stroke: CHART.surface }} strokeWidth={2} />
                ))}
              </g>
            ) : null}
            <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
          </svg>
        ) : null}
        {hovered && hover !== null ? (
          <div className={`${TOOLTIP_CLASS} top-0 min-w-40`} style={{ left: Math.min(Math.max(x(hover) - 80, 0), Math.max(0, width - 176)) }} role="status">
            <div className="mb-1 font-medium text-muted">{hovered.title}</div>
            {series.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-4 py-0.5">
                <span className="inline-flex items-center gap-1.5 text-text-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: colorOf(s) }} />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums text-text">{format(hovered.values[s.key] ?? 0)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
