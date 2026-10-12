"use client";

import type { ReactNode } from "react";
import type { GameRow } from "@/lib/stats";
import { StatusBadge, TierBadge, cx } from "@/components/ui/primitives";
import GameCover from "./GameCover";
import { useGameDrawer } from "./GameDrawer";

const STATE_STATUS: Record<string, string | null> = {
  owned: "owned",
  incoming: "ordered",
  wanted: "wishlist",
  none: null,
};

/**
 * Carte jaquette : la jaquette fait la carte, titre et console dessous. Un clic
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
  /** proportions du cadre ; par défaut 3:4 */
  ratio?: number;
}) {
  const { open } = useGameDrawer();
  const status = STATE_STATUS[row.state];
  return (
    <button type="button" onClick={() => open(row.game.id)} className="group block w-full min-w-0 rounded-lg text-left focus-visible:outline-offset-4">
      <div className="cover-lift relative overflow-hidden rounded-lg ring-1 ring-[var(--cover-ring)]">
        <GameCover gameId={row.game.id} title={row.game.canonicalTitle} rounded="rounded-none" ratio={ratio ?? 0.75} width={200} />
        <div className="absolute left-1.5 top-1.5 flex gap-1">
          <TierBadge tier={row.game.qualityTier} className="shadow-[var(--shadow-sm)]" />
        </div>
        {badge ? <div className="absolute right-1.5 top-1.5">{badge}</div> : null}
        {showState && status ? (
          <div className="absolute bottom-1.5 left-1.5 rounded-md bg-bg-elev/90 backdrop-blur-sm">
            <StatusBadge status={status} count={row.state === "owned" ? row.ownedCount : undefined} />
          </div>
        ) : null}
      </div>
      <div className="mt-2 px-0.5">
        <div className="line-clamp-2 text-[13px] font-medium leading-snug text-text transition group-hover:text-accent">{row.game.canonicalTitle}</div>
        <div className={cx("mt-0.5 flex items-center justify-between gap-2 text-xs text-muted")}>
          <span className="truncate">
            {row.platform?.shortName ?? row.game.platformId}
            {row.game.edition ? ` · ${row.game.edition}` : ""}
          </span>
          {footer ? <span className="shrink-0 tabular-nums">{footer}</span> : null}
        </div>
      </div>
    </button>
  );
}

export function CardGrid({ children, dense = false, wide = false }: { children: ReactNode; dense?: boolean; wide?: boolean }) {
  return (
    <div
      className={cx(
        "grid gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6",
        dense
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8"
          : wide
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      )}
    >
      {children}
    </div>
  );
}
