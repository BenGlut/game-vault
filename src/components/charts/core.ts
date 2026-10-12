"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Socle des graphiques maison (SVG) : mesure responsive, graduations propres,
 * palette catégorielle par thème (jetons --series-1…8 de globals.css), validée contre la
 * surface des cartes de chaque thème (≥ 3:1, tests/theme-contrast.test.ts) — ordre fixe,
 * jamais cyclé. Ce sont des var() CSS : elles suivent le thème sans re-rendu et
 * s'appliquent par `style` (fill / stroke) dans les SVG.
 */

export const SERIES = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `var(--series-${i})`);

/** Couleur de marque pour un graphique à série unique (pas de légende, le titre nomme la série). */
export const ACCENT = "var(--chart-accent)";

export const CHART = {
  grid: "var(--chart-grid)",
  baseline: "var(--chart-baseline)",
  ink: "var(--text)",
  muted: "var(--muted)",
  surface: "var(--surface)",
};

/** Infobulle commune des graphiques. */
export const TOOLTIP_CLASS =
  "pointer-events-none absolute z-10 rounded-lg border border-border-strong bg-bg-elev/95 px-3 py-2 text-xs shadow-[var(--shadow-pop)] backdrop-blur";

export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry?.contentRect.width ?? 0)));
    ro.observe(el);
    setWidth(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Graduations « rondes » (1, 2, 5 × 10^n) couvrant [0, max]. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 100) / 100);
  if ((ticks[ticks.length - 1] ?? 0) < max) ticks.push(Math.round((ticks.length * step) * 100) / 100);
  return ticks;
}

export const euroFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const euroCents = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const intFmt = new Intl.NumberFormat("fr-FR");

/** Valeur compacte pour les axes : 1 200 → 1,2 k. */
export function compact(n: number, unit = ""): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k${unit}`;
  return `${Math.round(n).toLocaleString("fr-FR")}${unit}`;
}
