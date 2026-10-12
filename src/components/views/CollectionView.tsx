"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { COMPLETENESS_LABELS, euro } from "@/lib/labels";
import { isOwned } from "@/lib/collection";
import type { GameRow } from "@/lib/stats";
import { euroFmt, intFmt } from "@/components/charts/core";
import {
  ActiveFilter,
  Button,
  Chip,
  ChipRow,
  EmptyState,
  FilterBar,
  PageHeader,
  SearchField,
  Segmented,
  StatusBadge,
  TierBadge,
  table,
} from "@/components/ui/primitives";
import { Select } from "@/components/ui/fields";
import { GridIcon, ListIcon, LibraryIcon, PlusIcon } from "@/components/icons";
import GameCard, { CardGrid } from "@/components/game/GameCard";
import GameCover from "@/components/game/GameCover";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import { useVault } from "@/components/vault/VaultProvider";
import { matches } from "@/components/vault/model";
import { formatOf } from "@/lib/platform-format";

type Scope = "owned" | "incoming" | "all";
type Sort = "title" | "recent" | "value" | "paid" | "quality";

const SORTS: Record<Sort, string> = {
  title: "Titre (A → Z)",
  recent: "Arrivée récente",
  value: "Cote la plus haute",
  paid: "Prix payé",
  quality: "Qualité",
};

const SPECIAL: Record<string, { label: string; test: (r: GameRow) => boolean }> = {
  verif: { label: "Exemplaires à vérifier", test: (r) => r.items.some((i) => isOwned(i) && i.verificationStatus === "needs_review") },
  cote: { label: "Sans cote", test: (r) => r.ownedCount > 0 && r.value === null },
  doublons: { label: "Doublons", test: (r) => r.ownedCount > 1 },
};

const PAGE = 60;

export default function CollectionView() {
  const { stats } = useVault();
  const { open } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const params = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("owned");
  const [platform, setPlatform] = useState(params.get("console") ?? "");
  const [completeness, setCompleteness] = useState("");
  const [sort, setSort] = useState<Sort>(params.get("tri") === "recent" ? "recent" : "title");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [limit, setLimit] = useState(PAGE);
  const special = Object.keys(SPECIAL).find((k) => params.get(k)) ?? null;

  const games = useMemo(() => stats.rows.filter((r) => r.game.kind !== "hardware"), [stats.rows]);
  const inScope = useMemo(
    () =>
      games.filter((r) =>
        scope === "owned" ? r.state === "owned" : scope === "incoming" ? r.state === "incoming" : r.state !== "none" || r.items.length > 0,
      ),
    [games, scope],
  );

  const platformCounts = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const r of inScope) {
      const e = m.get(r.game.platformId) ?? { label: r.platform?.shortName ?? r.game.platformId, n: 0 };
      e.n++;
      m.set(r.game.platformId, e);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [inScope]);

  const results = useMemo(() => {
    const filtered = inScope.filter(
      (r) =>
        (!platform || r.game.platformId === platform) &&
        (!completeness || r.items.some((i) => isOwned(i) && i.completeness === completeness)) &&
        (!special || SPECIAL[special]!.test(r)) &&
        matches(r.game, query),
    );
    const tierRank = (t: string | null) => (t ? "SABCD".indexOf(t) : 9);
    return filtered.sort((a, b) => {
      if (sort === "recent") return (b.lastAcquired ?? "").localeCompare(a.lastAcquired ?? "");
      if (sort === "value") return (b.value ?? -1) - (a.value ?? -1);
      if (sort === "paid") return (b.paid ?? 0) - (a.paid ?? 0);
      if (sort === "quality") return tierRank(a.game.qualityTier) - tierRank(b.game.qualityTier);
      return a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr");
    });
  }, [inScope, platform, completeness, special, query, sort]);

  const totalValue = results.reduce((s, r) => s + (r.value ?? 0), 0);
  const resetLimit = () => setLimit(PAGE);
  const filtered = !!(query || platform || completeness || special);

  return (
    <div className="animate-page">
      <PageHeader
        title="Ma collection"
        subtitle={`${intFmt.format(stats.ownedGames)} jeux possédés · ${intFmt.format(stats.ownedItems)} exemplaires · ${euroFmt.format(stats.collectionValue)} à la cote`}
        actions={
          <Button variant="primary" icon={<PlusIcon size={15} />} onClick={() => openNewGame()} className="max-sm:hidden">
            Nouveau jeu
          </Button>
        }
      />

      <FilterBar
        top={
          <>
            <SearchField
              className="basis-full sm:flex-1 sm:basis-56"
              value={query}
              onChange={(v) => {
                setQuery(v);
                resetLimit();
              }}
              placeholder="Titre, autre nom, franchise…"
              label="Chercher dans la collection"
            />
            <Segmented<Scope>
              label="Périmètre"
              value={scope}
              onChange={(v) => {
                setScope(v);
                resetLimit();
              }}
              options={[
                { value: "owned", label: "Possédés" },
                { value: "incoming", label: "En route" },
                { value: "all", label: "Tout" },
              ]}
            />
            <Select
              label="Complétude"
              className="w-[calc(50%-4px)] sm:w-44"
              value={completeness}
              options={Object.keys(COMPLETENESS_LABELS)}
              labels={COMPLETENESS_LABELS}
              allowEmpty="Toute complétude"
              onChange={setCompleteness}
            />
            <Select label="Trier par" className="w-[calc(50%-4px)] sm:w-44" value={sort} options={Object.keys(SORTS)} labels={SORTS} onChange={(v) => setSort(v as Sort)} />
            <span className="ml-auto sm:ml-0">
              <Segmented
                label="Affichage"
                value={view}
                onChange={setView}
                options={[
                  { value: "grid", label: <GridIcon size={15} />, title: "Grille de jaquettes" },
                  { value: "list", label: <ListIcon size={15} />, title: "Liste" },
                ]}
              />
            </span>
          </>
        }
      >
        <ChipRow label="Console">
          <Chip active={!platform} onClick={() => setPlatform("")} count={inScope.length}>
            Toutes
          </Chip>
          {platformCounts.map(([id, { label, n }]) => (
            <Chip
              key={id}
              active={platform === id}
              onClick={() => {
                setPlatform(platform === id ? "" : id);
                resetLimit();
              }}
              count={n}
            >
              {label}
            </Chip>
          ))}
        </ChipRow>
      </FilterBar>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted" aria-live="polite">
        <span>
          <span className="font-medium text-text">{intFmt.format(results.length)}</span> jeu{results.length > 1 ? "x" : ""}
          {totalValue > 0 ? ` · ${euroFmt.format(totalValue)} à la cote` : ""}
        </span>
        {special ? <ActiveFilter onClear={() => router.replace("/collection")}>{SPECIAL[special]!.label}</ActiveFilter> : null}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="Aucun jeu ne correspond"
          icon={<LibraryIcon size={18} />}
          action={
            filtered ? (
              <Button
                onClick={() => {
                  setQuery("");
                  setPlatform("");
                  setCompleteness("");
                  if (special) router.replace("/collection");
                }}
              >
                Effacer les filtres
              </Button>
            ) : null
          }
        >
          Essayez une autre console ou un autre mot.
        </EmptyState>
      ) : view === "grid" ? (
        <CardGrid wide={!!platform && formatOf(platform).ratio > 1.25}>
          {results.slice(0, limit).map((r) => (
            <GameCard
              key={r.game.id}
              row={r}
              showState={scope !== "owned"}
              ratio={platform ? formatOf(platform).ratio : undefined}
              footer={r.value !== null ? euroFmt.format(r.value) : null}
            />
          ))}
        </CardGrid>
      ) : (
        <div className={table.wrap}>
          {/* largeurs fixes : le titre se tronque au lieu de pousser la cote hors de l'écran */}
          <table className={`${table.table} table-fixed`}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>Jeu</th>
                <th className={`${table.th} hidden w-24 md:table-cell`}>Console</th>
                <th className={`${table.th} hidden w-44 lg:table-cell`}>Complétude</th>
                <th className={`${table.th} hidden w-24 text-right sm:table-cell`}>Payé</th>
                <th className={`${table.th} w-24 text-right`}>Cote</th>
              </tr>
            </thead>
            <tbody className={table.body}>
              {results.slice(0, limit).map((r) => {
                const owned = r.items.filter(isOwned);
                return (
                  <tr key={r.game.id} className={`${table.row} cursor-pointer`} onClick={() => open(r.game.id)}>
                    <td className={table.td}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 shrink-0">
                          <GameCover gameId={r.game.id} title={r.game.canonicalTitle} rounded="rounded" width={40} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <TierBadge tier={r.game.qualityTier} size="sm" />
                            {/* bouton réel : la ligne s'ouvre aussi au clavier */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                open(r.game.id);
                              }}
                              className="min-w-0 truncate text-left font-medium hover:text-accent"
                            >
                              {r.game.canonicalTitle}
                            </button>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                            <span className="md:hidden">{r.platform?.shortName ?? r.game.platformId}</span>
                            {r.state !== "owned" ? <StatusBadge status={r.state === "incoming" ? "ordered" : "wishlist"} /> : null}
                            {r.ownedCount > 1 ? <span>×{r.ownedCount}</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${table.td} hidden text-text-2 md:table-cell`}>{r.platform?.shortName ?? r.game.platformId}</td>
                    <td className={`${table.td} hidden text-text-2 lg:table-cell`}>
                      {[...new Set(owned.map((i) => COMPLETENESS_LABELS[i.completeness]))].join(", ") || "—"}
                    </td>
                    <td className={`${table.td} hidden text-right tabular-nums text-text-2 sm:table-cell`}>{r.paid !== null ? euro(r.paid) : "—"}</td>
                    <td className={`${table.td} text-right font-medium tabular-nums`}>{r.value !== null ? euro(r.value) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {results.length > limit ? (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => setLimit((l) => l + PAGE * 2)}>Afficher plus ({intFmt.format(results.length - limit)} restants)</Button>
        </div>
      ) : null}
    </div>
  );
}
