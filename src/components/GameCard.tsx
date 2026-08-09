"use client";

import Link from "next/link";
import type { Game, Platform } from "@/lib/schema";
import { STATUS_LABELS } from "@/lib/labels";
import { useGameDrawer } from "@/components/GameDrawer";

export const TIER_COLORS: Record<string, string> = {
  S: "bg-[#f5b642] text-black",
  A: "bg-[#4ade80] text-black",
  B: "bg-[#60a5fa] text-black",
  C: "bg-[#8a93a8] text-black",
  D: "bg-[#f87171] text-black",
};

export const STATUS_COLORS: Record<string, string> = {
  owned: "bg-[#4ade8025] text-[#4ade80] ring-[#4ade8040]",
  delivered: "bg-[#4ade8025] text-[#4ade80] ring-[#4ade8040]",
  ordered: "bg-[#60a5fa25] text-[#60a5fa] ring-[#60a5fa40]",
  fulfilled: "bg-[#60a5fa25] text-[#93c5fd] ring-[#60a5fa40]",
  wishlist: "bg-[#c084fc25] text-[#c084fc] ring-[#c084fc40]",
  duplicate: "bg-[#f5b64225] text-[#f5b642] ring-[#f5b64240]",
  sold: "bg-[#8a93a825] text-[#8a93a8] ring-[#8a93a840]",
  cancelled: "bg-[#f8717125] text-[#f87171] ring-[#f8717140]",
  refunded: "bg-[#f8717125] text-[#fca5a5] ring-[#f8717140]",
};

export interface CardItem {
  id: string;
  status: string;
  quantity?: number;
  condition?: string;
  completeness?: string;
  verificationStatus?: string;
  acquiredAt?: string | null;
  currentEstimate?: { low: number; median: number; high: number } | null;
}

/**
 * Carte poster : la jaquette occupe toute la carte, les métadonnées se
 * superposent en bas. Base visuelle commune à Collection, Wishlist,
 * Recommandations et Doublons.
 */
export function GameCard({
  game,
  platform,
  coverUrl,
  items = [],
  badge,
  footer,
}: {
  game: Game;
  platform?: Platform;
  coverUrl: string | null;
  items?: CardItem[];
  /** pastille en haut à droite (priorité, verdict…) */
  badge?: React.ReactNode;
  /** ligne libre sous le titre (cote, prix…) */
  footer?: React.ReactNode;
}) {
  const copies = items.length;
  const status = items[0]?.status;
  const drawer = useGameDrawer();

  return (
    <Link
      href={`/jeu/${game.id}/`}
      className="group block"
      onClick={(e) => {
        // clic simple → panneau latéral ; ctrl/cmd/molette gardent la navigation
        if (!drawer.enabled || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        drawer.open({ game, platform, coverUrl, items });
      }}>
      <div className="poster">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={`Jaquette de ${game.canonicalTitle}`} loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2 px-3 text-center text-xs text-muted">
            {game.canonicalTitle}
          </div>
        )}
        <div className="poster-veil" />

        {/* haut : qualité + badge libre */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          {game.qualityTier ? (
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold shadow-lg ${TIER_COLORS[game.qualityTier] ?? ""}`}
              title={`Qualité ${game.qualityTier}`}
            >
              {game.qualityTier}
            </span>
          ) : (
            <span />
          )}
          {badge}
        </div>

        {/* bas : statut + plateforme */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {status ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset backdrop-blur-sm ${STATUS_COLORS[status] ?? "bg-surface-2 text-muted ring-border"}`}
              >
                {STATUS_LABELS[status] ?? status}
              </span>
            ) : null}
            {copies > 1 ? (
              <span className="rounded-full bg-[#f5b64230] px-2 py-0.5 text-[11px] font-semibold text-accent ring-1 ring-inset ring-[#f5b64250] backdrop-blur-sm">
                ×{copies}
              </span>
            ) : null}
            <span className="ml-auto rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white/80 backdrop-blur-sm">
              {platform?.shortName ?? game.platformId}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <div className="truncate text-sm font-medium text-text transition group-hover:text-accent">
          {game.canonicalTitle}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted">
          {footer ?? game.franchise ?? platform?.name ?? ""}
        </div>
      </div>
    </Link>
  );
}

/** Grille responsive standard pour les cartes poster. */
export function GameGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {children}
    </div>
  );
}
