"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { COMPLETENESS_LABELS, euro } from "@/lib/labels";
import { isOwned } from "@/lib/collection";
import type { GameRow } from "@/lib/stats";
import { euroFmt, intFmt } from "@/components/charts/core";
import { Chip, EmptyState, PageHeader, Segmented, StatusBadge, TierBadge } from "@/components/ui/primitives";
import { Button, Select, inputClass } from "@/components/ui/fields";
import { GridIcon, ListIcon, SearchIcon } from "@/components/icons";
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
  title: "Titre",
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
      if (sort === "paid") return b.cost - a.cost;
      if (sort === "quality") return tierRank(a.game.qualityTier) - tierRank(b.game.qualityTier);
      return a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr");
    });
  }, [inScope, platform, completeness, special, query, sort]);

  const totalValue = results.reduce((s, r) => s + (r.value ?? 0), 0);
  const resetLimit = () => setLimit(PAGE);

  return (
    <div className="animate-page">
      <PageHeader
        title="Ma collection"
        subtitle={`${intFmt.format(stats.ownedGames)} jeux possédés · ${intFmt.format(stats.ownedItems)} exemplaires · ${euroFmt.format(stats.collectionValue)}`}
        actions={
          <Button variant="primary" onClick={() => openNewGame()}>
            Nouveau jeu
          </Button>
        }
      />

      <div className="sticky top-[57px] z-20 -mx-4 mb-5 space-y-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-56">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetLimit();
              }}
              placeholder="Titre, autre nom, franchise…"
              className={`${inputClass} pl-9`}
            />
          </div>
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
          <div className="w-40">
            <Select value={completeness} options={Object.keys(COMPLETENESS_LABELS)} labels={COMPLETENESS_LABELS} allowEmpty="Toute complétude" onChange={setCompleteness} />
          </div>
          <div className="w-44">
            <Select value={sort} options={Object.keys(SORTS)} labels={SORTS} onChange={(v) => setSort(v as Sort)} />
          </div>
          <div className="hidden sm:block">
            <Segmented
              label="Affichage"
              value={view}
              onChange={setView}
              options={[
                { value: "grid", label: <GridIcon size={15} /> },
                { value: "list", label: <ListIcon size={15} /> },
              ]}
            />
          </div>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
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
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          {intFmt.format(results.length)} jeu{results.length > 1 ? "x" : ""}
          {totalValue > 0 ? ` · ${euroFmt.format(totalValue)} à la cote` : ""}
        </span>
        {special ? (
          <button
            type="button"
            onClick={() => router.replace("/collection")}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
          >
            {SPECIAL[special]!.label} <span aria-hidden>×</span>
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <EmptyState title="Aucun jeu ne correspond">Essayez une autre console ou un autre mot.</EmptyState>
      ) : view === "grid" ? (
        <CardGrid>
          {results.slice(0, limit).map((r) => (
            <GameCard
              key={r.game.id}
              row={r}
              showState={scope !== "owned"}
              ratio={platform ? formatOf(platform).ratio : undefined}
              footer={r.value !== null ? <span className="tabular-nums text-muted">{euroFmt.format(r.value)}</span> : null}
            />
          ))}
        </CardGrid>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Jeu</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">Console</th>
                <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Complétude</th>
                <th className="px-3 py-2.5 text-right font-medium">Payé</th>
                <th className="px-4 py-2.5 text-right font-medium">Cote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.slice(0, limit).map((r) => {
                const owned = r.items.filter(isOwned);
                return (
                  <tr key={r.game.id} onClick={() => open(r.game.id)} className="cursor-pointer bg-bg-elev transition hover:bg-surface">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 shrink-0">
                          <GameCover gameId={r.game.id} title={r.game.canonicalTitle} rounded="rounded-md" width={40} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <TierBadge tier={r.game.qualityTier} />
                            <span className="truncate font-medium">{r.game.canonicalTitle}</span>
                          </div>
                          {r.state !== "owned" ? (
                            <div className="mt-0.5">
                              <StatusBadge status={r.state === "incoming" ? "ordered" : "wishlist"} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2 text-muted md:table-cell">{r.platform?.shortName ?? r.game.platformId}</td>
                    <td className="hidden px-3 py-2 text-muted lg:table-cell">
                      {[...new Set(owned.map((i) => COMPLETENESS_LABELS[i.completeness]))].join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted">{r.cost > 0 ? euro(r.cost) : "—"}</td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{r.value !== null ? euro(r.value) : "—"}</td>
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
