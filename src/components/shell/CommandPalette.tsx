"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { searchDocs } from "@/lib/fuzzy";
import { toSearchDoc } from "@/lib/search";
import { GAME_STATE_LABELS } from "@/lib/collection";
import { NAV_ICONS, PlusIcon, SearchIcon } from "@/components/icons";
import { useVault } from "@/components/vault/VaultProvider";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import GameCover from "@/components/game/GameCover";
import { NAV_ITEMS } from "./nav";

type Result =
  | { kind: "game"; id: string; title: string; sub: string }
  | { kind: "page"; href: string; title: string }
  | { kind: "new"; title: string };

/**
 * Recherche globale (⌘K, Ctrl+K ou /) : un jeu de la base, une page ou
 * « Nouveau jeu ». Tolérante aux fautes et aux abréviations (même moteur que l'estimateur).
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, rowById } = useVault();
  const { open: openGame } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const docs = useMemo(() => data.games.map(toSearchDoc), [data.games]);
  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "n", weight: 2 },
          { name: "a", weight: 1.5 },
          { name: "t", weight: 1 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
      }),
    [docs],
  );

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    const pages: Result[] = NAV_ITEMS.filter((n) => !q || n.label.toLowerCase().includes(q.toLowerCase())).map((n) => ({
      kind: "page",
      href: n.href,
      title: n.label,
    }));
    if (!q) return [{ kind: "new", title: "Nouveau jeu" }, ...pages];
    const games: Result[] = searchDocs(docs, fuse, q, 8).map(({ item }) => {
      const row = rowById.get(item.id);
      return {
        kind: "game",
        id: item.id,
        title: item.t,
        sub: `${row?.platform?.shortName ?? item.p} · ${GAME_STATE_LABELS[row?.state ?? "none"]}`,
      };
    });
    return [...games, ...pages.slice(0, 3), { kind: "new", title: `Ajouter « ${q} »` }];
  }, [query, docs, fuse, rowById]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  function choose(r: Result | undefined) {
    if (!r) return;
    onClose();
    if (r.kind === "game") openGame(r.id);
    else if (r.kind === "page") router.push(r.href);
    else openNewGame(query.trim() ? { title: query.trim() } : undefined);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[cursor]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Recherche">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-pop relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-bg-elev shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Chercher un jeu, une page…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
          />
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted sm:block">Échap</kbd>
        </div>
        <ul id="palette-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {results.map((r, i) => {
            const Icon = r.kind === "page" ? NAV_ICONS[r.href] : r.kind === "new" ? PlusIcon : null;
            return (
              <li key={`${r.kind}-${r.kind === "game" ? r.id : r.title}`} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(r)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    i === cursor ? "bg-surface-2" : ""
                  }`}
                >
                  {r.kind === "game" ? (
                    <div className="w-8 shrink-0">
                      <GameCover gameId={r.id} title={r.title} rounded="rounded-md" width={40} />
                    </div>
                  ) : Icon ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
                      <Icon size={16} />
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block truncate">{r.title}</span>
                    {r.kind === "game" ? <span className="block text-xs text-muted">{r.sub}</span> : null}
                    {r.kind === "page" ? <span className="block text-xs text-muted">Aller à la page</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
