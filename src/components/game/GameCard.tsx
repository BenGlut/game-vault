"use client";

import type { ReactNode } from "react";
import type { GameRow } from "@/lib/stats";
import { StatusBadge, TierBadge } from "@/components/ui/primitives";
import GameCover from "./GameCover";
import { useGameDrawer } from "./GameDrawer";

const STATE_STATUS: Record<string, string | null> = {
  owned: "owned",
  incoming: "ordered",
  wanted: "wishlist",
  none: null,
};

/**
 * Carte poster : la jaquette fait la carte, titre et console dessous. Un clic
 * ouvre le panneau du jeu sans quitter la page (filtres conservés).
 */
export default function GameCard({
  row,
  footer,
  badge,
  showState = true,
  ratio,
}: {
  row: GameRow;
  footer?: ReactNode;
  badge?: ReactNode;
  showState?: boolean;
  /** proportions du cadre ; par défaut celles de la console du jeu */
  ratio?: number;
}) {
  const { open } = useGameDrawer();
  const status = STATE_STATUS[row.state];
  return (
    <button
      type="button"
      onClick={() => open(row.game.id)}
      className="group block w-full text-left focus-visible:outline-none"
    >
      <div className="relative overflow-hidden rounded-xl ring-1 ring-border transition duration-300 group-hover:-translate-y-1 group-hover:ring-accent/50 group-hover:shadow-[var(--shadow-hover)] group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <GameCover gameId={row.game.id} title={row.game.canonicalTitle} rounded="rounded-none" ratio={ratio ?? 0.75} width={200} />
        <div className="absolute left-2 top-2 flex gap-1">
          <TierBadge tier={row.game.qualityTier} />
        </div>
        {badge ? <div className="absolute right-2 top-2">{badge}</div> : null}
        {showState && status ? (
          <div className="absolute bottom-2 left-2">
            <StatusBadge status={status} count={row.state === "owned" ? row.ownedCount : undefined} />
          </div>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <div className="line-clamp-2 text-[13px] font-medium leading-snug">{row.game.canonicalTitle}</div>
        <div className="mt-0.5 truncate text-xs text-muted">
          {row.platform?.shortName ?? row.game.platformId}
          {row.game.edition ? ` · ${row.game.edition}` : ""}
        </div>
        {footer ? <div className="mt-0.5 text-xs">{footer}</div> : null}
      </div>
    </button>
  );
}

export function CardGrid({ children, dense = false }: { children: ReactNode; dense?: boolean }) {
  return (
    <div
      className={`grid gap-x-4 gap-y-6 ${
        dense
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      }`}
    >
      {children}
    </div>
  );
}
