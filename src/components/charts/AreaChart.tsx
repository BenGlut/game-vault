"use client";

import { useState } from "react";
import { ACCENT, CHART, niceTicks, useWidth } from "./core";

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

const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

/**
 * Courbe(s) dans le temps sur un seul axe. Réticule vertical qui s'aligne sur le
 * point le plus proche, infobulle listant toutes les séries, légende dès 2 séries.
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

  // une étiquette d'axe toutes les ~70 px
  const every = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 70))));

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = data.length <= 1 ? 0 : Math.round((px / rect.width) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const hovered = hover !== null ? data[hover] : undefined;

  return (
    <div>
      {series.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 rounded-full" style={{ background: colorOf(s) }} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && data.length ? (
          <svg width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(", ")}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colorOf(s)} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={colorOf(s)} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? CHART.baseline : CHART.grid} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={CHART.muted} className="tabular-nums">
                  {(axisFormat ?? format)(t)}
                </text>
              </g>
            ))}
            {data.map((d, i) =>
              i % every === 0 || i === data.length - 1 ? (
                <text key={d.title} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={CHART.muted}>
                  {d.label}
                </text>
              ) : null,
            )}
            {series.map((s) => {
              const pts = data.map((d, i) => `${x(i)},${y(d.values[s.key] ?? 0)}`);
              return (
                <g key={s.key}>
                  {s.fill ? (
                    <path
                      d={`M${x(0)},${y(0)} L${pts.join(" L")} L${x(data.length - 1)},${y(0)} Z`}
                      fill={`url(#fill-${s.key})`}
                    />
                  ) : null}
                  <polyline points={pts.join(" ")} fill="none" stroke={colorOf(s)} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  <circle
                    cx={x(data.length - 1)}
                    cy={y(data[data.length - 1]?.values[s.key] ?? 0)}
                    r={4}
                    fill={colorOf(s)}
                    stroke={CHART.surface}
                    strokeWidth={2}
                  />
                </g>
              );
            })}
            {hovered && hover !== null ? (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke={CHART.muted} strokeOpacity={0.5} />
                {series.map((s) => (
                  <circle
                    key={s.key}
                    cx={x(hover)}
                    cy={y(hovered.values[s.key] ?? 0)}
                    r={4.5}
                    fill={colorOf(s)}
                    stroke={CHART.surface}
                    strokeWidth={2}
                  />
                ))}
              </g>
            ) : null}
            <rect
              x={PAD.left}
              y={PAD.top}
              width={innerW}
              height={innerH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        ) : null}
        {hovered && hover !== null ? (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-xl border border-border-strong bg-bg-elev/95 px-3 py-2 text-xs shadow-[var(--shadow-card)] backdrop-blur"
            style={{
              left: Math.min(Math.max(x(hover) - 72, 0), Math.max(0, width - 168)),
            }}
          >
            <div className="mb-1 text-muted">{hovered.title}</div>
            {series.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: colorOf(s) }} />
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
