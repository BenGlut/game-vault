"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Socle des graphiques maison (SVG) : mesure responsive, graduations propres,
 * palette catégorielle validée pour le fond sombre (#12141d) — ordre fixe, jamais cyclé.
 */

export const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];

/** Couleur de marque pour un graphique à série unique (pas de légende, le titre nomme la série). */
export const ACCENT = "#f5b642";

export const CHART = {
  grid: "#1f2432",
  baseline: "#2f364a",
  ink: "#eef1f7",
  muted: "#8a93a8",
  surface: "#12141d",
};

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
