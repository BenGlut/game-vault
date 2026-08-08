"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Game, Platform } from "@/lib/schema";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";

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

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#f5b64225] text-[#f5b642]",
  A: "bg-[#4ade8020] text-[#4ade80]",
  B: "bg-[#60a5fa20] text-[#60a5fa]",
  C: "bg-[#8a93a820] text-[#8a93a8]",
  D: "bg-[#f8717120] text-[#f87171]",
};

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
      <div className="space-y-2">
        {filtered.map((r) => (
          <Link
            key={r.game.id}
            href={`/jeu/${r.game.id}/`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent/40 hover:bg-surface-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              {r.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.coverUrl} alt="" loading="lazy" className="h-14 w-12 shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-surface-2 text-xs text-muted">
                  ?
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{r.game.canonicalTitle}</span>
                  {r.game.qualityTier ? (
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${TIER_COLORS[r.game.qualityTier] ?? ""}`}>
                      {r.game.qualityTier}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
                    {r.platform?.shortName ?? r.game.platformId}
                  </span>
                  {r.game.franchise ? <span>{r.game.franchise}</span> : null}
                </div>
              </div>
            </div>
            {r.game.buyPriority ? (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[r.game.buyPriority] ?? ""}`}>
                priorité {r.game.buyPriority}
              </span>
            ) : null}
          </Link>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-muted">
            Rien pour cette plateforme.
          </div>
        ) : null}
      </div>
    </div>
  );
}
