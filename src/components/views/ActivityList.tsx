"use client";

import type { ChangeLogEntry } from "@/lib/schema";
import { useVault } from "@/components/vault/VaultProvider";

const timeFr = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const days = Math.round((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000);
  if (days === 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  if (days < 7) return d.toLocaleDateString("fr-FR", { weekday: "long" }).replace(/^./, (c) => c.toUpperCase());
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: days > 300 ? "numeric" : undefined });
}

/** Fil des modifications : en ligne (web) ou par l'agent (CLI), avec lien vers le jeu concerné. */
export default function ActivityList({
  entries,
  onOpenGame,
  compact = false,
}: {
  entries: ChangeLogEntry[];
  onOpenGame: (id: string) => void;
  compact?: boolean;
}) {
  const { rowById, data } = useVault();
  const inventory = new Map(data.inventory.map((i) => [i.id, i.gameId]));
  if (!entries.length) return <p className="text-sm text-muted">Aucune modification.</p>;
  return (
    <ul className="space-y-1">
      {entries.map((e) => {
        const ids = e.affected.flatMap((a) => a.ids);
        const gameId = ids.find((id) => rowById.has(id)) ?? ids.map((id) => inventory.get(id)).find(Boolean);
        return (
          <li key={e.id}>
            <button
              type="button"
              disabled={!gameId}
              onClick={() => gameId && onOpenGame(gameId)}
              className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition enabled:hover:bg-surface-2"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.actor === "web" ? "bg-accent" : "bg-info"}`} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${compact ? "line-clamp-1" : ""}`}>{e.message}</span>
                <span className="block text-xs text-muted">
                  {e.actor === "web" ? "En ligne" : "Agent"} · {relativeDay(e.at)} à {timeFr.format(new Date(e.at))}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
