"use client";

import { useMemo } from "react";
import type { ChangeLogEntry } from "@/lib/schema";
import { activityGameId, humanizeMessage, type ActivityContext } from "@/lib/activity";
import { MARKETPLACE_LABELS } from "@/lib/stats";
import { ChevronRightIcon } from "@/components/icons";
import { cx } from "@/components/ui/primitives";
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

/** Origine d'une modification, en clair. */
export function actorLabel(actor: string): string {
  return actor === "web" ? "En ligne" : "Agent";
}

/** Fil des modifications : en ligne (web) ou par l'agent (CLI, MCP), avec lien vers le jeu concerné. */
export default function ActivityList({
  entries,
  onOpenGame,
  compact = false,
}: {
  entries: ChangeLogEntry[];
  onOpenGame: (id: string) => void;
  compact?: boolean;
}) {
  const { data } = useVault();
  const ctx = useMemo<ActivityContext>(() => {
    const sellers = new Map(data.sellers.map((s) => [s.id, s.name]));
    return {
      titles: new Map(data.games.map((g) => [g.id, g.canonicalTitle])),
      inventory: new Map(data.inventory.map((i) => [i.id, i.gameId])),
      orders: new Map(
        data.orders.map((o) => {
          const seller = o.sellerId ? sellers.get(o.sellerId) : null;
          const shop = MARKETPLACE_LABELS[o.marketplace] ?? o.marketplace;
          return [o.id, { label: seller ? `${shop} chez ${seller}` : shop, gameId: o.items[0]?.gameId ?? null }];
        }),
      ),
    };
  }, [data.games, data.inventory, data.orders, data.sellers]);
  if (!entries.length) return <p className="text-[13px] text-muted">Aucune modification.</p>;
  return (
    <ul className="-mx-2 space-y-px">
      {entries.map((e) => {
        const gameId = activityGameId(e, ctx);
        return (
          <li key={e.id}>
            <button
              type="button"
              disabled={!gameId}
              onClick={() => gameId && onOpenGame(gameId)}
              className="group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition enabled:hover:bg-surface-2/70"
            >
              <span className={cx("mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full", e.actor === "web" ? "bg-accent" : "bg-info")} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className={cx("block text-[13px] text-text", compact && "line-clamp-1")}>{humanizeMessage(e.message, ctx)}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {actorLabel(e.actor)} · {compact ? `${relativeDay(e.at)} à ` : ""}
                  {timeFr.format(new Date(e.at))}
                </span>
              </span>
              {gameId ? <ChevronRightIcon size={14} className="mt-1 shrink-0 text-muted opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
