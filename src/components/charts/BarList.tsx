"use client";

import type { ReactNode } from "react";
import { ACCENT } from "./core";

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  /** texte affiché en bout de ligne (valeur formatée + détail) */
  display: string;
  color?: string;
  onClick?: () => void;
}

/**
 * Classement horizontal : libellé, barre proportionnelle, valeur en bout de ligne
 * (étiquette directe, pas besoin d'infobulle). Barres fines à bout arrondi.
 */
export default function BarList({ items, color = ACCENT }: { items: BarItem[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const content = (
          <>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted">{item.display}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(1.5, (item.value / max) * 100)}%`, background: item.color ?? color }}
              />
            </div>
          </>
        );
        return (
          <li key={item.key}>
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="block w-full rounded-lg text-left transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {content}
              </button>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
