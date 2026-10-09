"use client";

import { ACCENT, CHART } from "./core";

/** Tendance compacte d'une tuile : trait atténué, dernier point à l'accent. */
export default function Sparkline({ values, width = 96, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const x = (i: number) => 2 + (i / (values.length - 1)) * (width - 4);
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  const last = values.length - 1;
  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <polyline
        points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
        fill="none"
        stroke={CHART.muted}
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={x(last)} cy={y(values[last] ?? 0)} r={3} fill={ACCENT} stroke={CHART.surface} strokeWidth={1.5} />
    </svg>
  );
}
