"use client";

import { useMemo, useState } from "react";
import type { Game, InventoryItem } from "@/lib/schema";
import { StatusBadge } from "@/components/ui";
import { inputClass, Select } from "./fields";
import type { VaultData } from "./api";
import { gameState, matches, type GameState } from "./model";
import GameEditor from "./GameEditor";

const STATE_FILTERS: Record<string, string> = {
  owned: "Possédés",
  incoming: "En route",
  wanted: "À acheter",
  none: "Catalogue seul",
};

const MAX_RESULTS = 80;

export default function GamesPanel({
  data,
  selectedId,
  onSelect,
  onSaveGame,
  onSaveItem,
  onDeleteItem,
  onAddItem,
}: {
  data: VaultData;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onSaveGame: (next: Game) => Promise<unknown>;
  onSaveItem: (next: InventoryItem) => Promise<unknown>;
  onDeleteItem: (item: InventoryItem) => Promise<unknown>;
  onAddItem: (gameId: string, status: "wishlist" | "owned") => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [state, setState] = useState("");

  const itemsByGame = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const i of data.inventory) map.set(i.gameId, [...(map.get(i.gameId) ?? []), i]);
    return map;
  }, [data.inventory]);

  const platformName = useMemo(() => new Map(data.platforms.map((p) => [p.id, p.shortName])), [data.platforms]);
  const usedPlatforms = useMemo(
    () => data.platforms.filter((p) => data.games.some((g) => g.platformId === p.id)),
    [data.platforms, data.games],
  );

  const results = useMemo(() => {
    return data.games
      .filter((g) => (!platform || g.platformId === platform) && matches(g, query))
      .map((g) => ({ game: g, items: itemsByGame.get(g.id) ?? [], state: gameState(itemsByGame.get(g.id) ?? []) }))
      .filter((r) => !state || r.state === (state as GameState))
      .sort((a, b) => a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr"));
  }, [data.games, itemsByGame, platform, query, state]);

  const selected = selectedId ? data.games.find((g) => g.id === selectedId) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className={selected ? "hidden lg:block" : ""}>
        <div className="space-y-2">
          <input
            className={inputClass}
            type="search"
            placeholder="Rechercher un jeu (titre, autre nom, franchise)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={platform}
              options={usedPlatforms.map((p) => p.id)}
              labels={Object.fromEntries(usedPlatforms.map((p) => [p.id, p.name]))}
              allowEmpty="Toutes les consoles"
              onChange={setPlatform}
            />
            <Select value={state} options={Object.keys(STATE_FILTERS)} labels={STATE_FILTERS} allowEmpty="Tous" onChange={setState} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {results.length} jeu{results.length > 1 ? "x" : ""}
          {results.length > MAX_RESULTS ? ` — ${MAX_RESULTS} premiers affichés, affinez la recherche` : ""}
        </p>
        <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {results.slice(0, MAX_RESULTS).map(({ game, items }) => {
            const statuses = [...new Set(items.map((i) => i.status))];
            return (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => onSelect(game.id)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-surface-2 ${
                    game.id === selectedId ? "bg-accent-soft" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{game.canonicalTitle}</span>
                    <span className="block text-xs text-muted">
                      {platformName.get(game.platformId) ?? game.platformId}
                      {game.edition ? ` · ${game.edition}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-wrap justify-end gap-1">
                    {statuses.map((s) => (
                      <StatusBadge key={s} status={s} />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        {selected ? (
          <>
            <button type="button" onClick={() => onSelect(null)} className="mb-3 text-sm text-muted hover:text-text lg:hidden">
              ← Retour à la liste
            </button>
            <GameEditor
              key={`${selected.id}:${JSON.stringify(selected)}`}
              game={selected}
              items={itemsByGame.get(selected.id) ?? []}
              platform={data.platforms.find((p) => p.id === selected.platformId)}
              onSaveGame={onSaveGame}
              onSaveItem={onSaveItem}
              onDeleteItem={onDeleteItem}
              onAddItem={(status) => onAddItem(selected.id, status)}
            />
          </>
        ) : (
          <div className="hidden rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted lg:block">
            Choisissez un jeu dans la liste pour modifier sa fiche et ses exemplaires.
          </div>
        )}
      </div>
    </div>
  );
}
