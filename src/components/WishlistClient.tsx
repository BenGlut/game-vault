"use client";

import { useEffect, useMemo, useState } from "react";
import type { Game, Platform } from "@/lib/schema";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { GameCard, GameGrid } from "@/components/GameCard";

interface Item {
  id: string;
  status: string;
  quantity: number;
}
interface GameRow {
  game: Game;
  items: Item[];
  platform: Platform | undefined;
  coverUrl: string | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  haute: "bg-[#f8717120] text-[#f87171]",
  moyenne: "bg-[#f5b64220] text-[#f5b642]",
  basse: "bg-[#8a93a820] text-[#8a93a8]",
};

/** Wishlist filtrable par plateforme (boutons consoles, filtre persisté dans l'URL). */
export default function WishlistClient({ rows }: { rows: GameRow[] }) {
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plateforme");
    if (p) setPlatform(p);
  }, []);

  useEffect(() => {
    const qs = platform ? `?plateforme=${platform}` : window.location.pathname;
    window.history.replaceState(null, "", qs);
  }, [platform]);

  const platforms = useMemo(() => {
    const counts = new Map<string, { shortName: string; count: number }>();
    for (const r of rows) {
      const cur = counts.get(r.game.platformId) ?? {
        shortName: r.platform?.shortName ?? r.game.platformId.toUpperCase(),
        count: 0,
      };
      cur.count++;
      counts.set(r.game.platformId, cur);
    }
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [rows]);

  const filtered = platform ? rows.filter((r) => r.game.platformId === platform) : rows;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPlatform("")}
          aria-pressed={platform === ""}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
            platform === ""
              ? "border-accent bg-accent-soft text-accent"
              : "border-border bg-surface text-muted hover:border-accent/40 hover:text-text"
          }`}
        >
          Toutes
        </button>
        {platforms.map(([id, { shortName, count }]) => {
          const Icon = CONSOLE_ICONS[id];
          const active = platform === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPlatform(active ? "" : id)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface text-muted hover:border-accent/40 hover:text-text"
              }`}
            >
              {Icon ? <Icon size={26} /> : null}
              {shortName}
              <span className="font-mono text-xs text-accent">{count}</span>
            </button>
          );
        })}
      </div>
      <p className="mb-3 text-sm text-muted">
        {filtered.length} jeu{filtered.length > 1 ? "x" : ""} en wishlist
      </p>
      <GameGrid>
        {filtered.map((r) => (
          <GameCard
            key={r.game.id}
            game={r.game}
            platform={r.platform}
            coverUrl={r.coverUrl}
            items={r.items}
            badge={
              r.game.buyPriority ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${PRIORITY_STYLES[r.game.buyPriority] ?? ""}`}
                >
                  {r.game.buyPriority}
                </span>
              ) : undefined
            }
          />
        ))}
      </GameGrid>
      <div>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
            Rien pour cette plateforme.
          </div>
        ) : null}
      </div>
    </div>
  );
}
