"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { searchDocs } from "@/lib/fuzzy";
import { toSearchDoc } from "@/lib/search";
import { GAME_STATE_LABELS } from "@/lib/collection";
import { ChevronRightIcon, NAV_ICONS, PlusIcon, SearchIcon } from "@/components/icons";
import { useVault } from "@/components/vault/VaultProvider";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import GameCover from "@/components/game/GameCover";
import { Kbd, TierBadge, cx, useFocusTrap } from "@/components/ui/primitives";
import { NAV_ITEMS } from "./nav";

type Result =
  | { kind: "game"; id: string; title: string; sub: string; tier: string | null }
  | { kind: "page"; href: string; title: string }
  | { kind: "new"; title: string };

const GROUP_LABELS: Record<Result["kind"], string> = { game: "Jeux", page: "Pages", new: "Actions" };

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
  const listRef = useRef<HTMLUListElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

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
        tier: row?.game.qualityTier ?? null,
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

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

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
    <div className="fixed inset-0 z-[65] flex items-start justify-center px-3 pt-[10vh] sm:px-4" role="dialog" aria-modal="true" aria-label="Recherche">
      <div className="animate-fade absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]" onClick={onClose} />
      <div ref={trapRef} className="animate-pop relative w-full max-w-xl overflow-hidden rounded-xl border border-border-strong bg-bg-elev shadow-[var(--shadow-pop)]">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon size={17} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Chercher un jeu, une page…"
            className="h-13 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[cursor] ? `palette-opt-${cursor}` : undefined}
            aria-autocomplete="list"
          />
          <Kbd>Échap</Kbd>
        </div>
        <ul ref={listRef} id="palette-results" role="listbox" aria-label="Résultats" className="max-h-[min(60vh,440px)] overflow-y-auto p-1.5">
          {results.map((r, i) => {
            const Icon = r.kind === "page" ? NAV_ICONS[r.href] : r.kind === "new" ? PlusIcon : null;
            const header = i === 0 || results[i - 1]!.kind !== r.kind;
            return (
              <Fragment key={`${r.kind}-${r.kind === "game" ? r.id : r.title}`}>
                {header ? (
                  <li role="presentation" className="px-2.5 pb-1 pt-2.5 text-[11px] font-medium text-muted first:pt-1">
                    {GROUP_LABELS[r.kind]}
                  </li>
                ) : null}
                <li
                  id={`palette-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => choose(r)}
                  className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors", i === cursor ? "bg-surface-2" : "")}
                >
                  {r.kind === "game" ? (
                    <div className="w-8 shrink-0">
                      <GameCover gameId={r.id} title={r.title} rounded="rounded" width={40} />
                    </div>
                  ) : Icon ? (
                    <span
                      className={cx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        r.kind === "new" ? "border-transparent bg-brand text-brand-ink" : "border-border bg-surface text-muted",
                      )}
                    >
                      <Icon size={15} />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      {r.kind === "game" ? <TierBadge tier={r.tier} size="sm" /> : null}
                      <span className="truncate font-medium">{r.title}</span>
                    </span>
                    {r.kind === "game" ? <span className="block text-xs text-muted">{r.sub}</span> : null}
                  </span>
                  {i === cursor ? <ChevronRightIcon size={15} className="shrink-0 text-muted" /> : null}
                </li>
              </Fragment>
            );
          })}
        </ul>
        <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> parcourir
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↵</Kbd> ouvrir
          </span>
        </div>
      </div>
    </div>
  );
}
