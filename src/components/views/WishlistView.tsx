"use client";

import { useMemo, useState } from "react";
import type { GameRow } from "@/lib/stats";
import { euroFmt, intFmt } from "@/components/charts/core";
import { Chip, EmptyState, PageHeader, PriorityBadge, Segmented, StatTile } from "@/components/ui/primitives";
import { Button, Select, inputClass } from "@/components/ui/fields";
import { SearchIcon } from "@/components/icons";
import GameCard, { CardGrid } from "@/components/game/GameCard";
import { useNewGame } from "@/components/game/NewGameForm";
import { useVault } from "@/components/vault/VaultProvider";
import { matches } from "@/components/vault/model";
import { formatOf } from "@/lib/platform-format";

type Priority = "all" | "haute" | "moyenne" | "basse";
type Sort = "priority" | "quality" | "cheap" | "title";

const SORTS: Record<Sort, string> = {
  priority: "Priorité",
  quality: "Qualité",
  cheap: "Cote la plus basse",
  title: "Titre",
};

const GROUPS: { key: string | null; title: string }[] = [
  { key: "haute", title: "Priorité haute" },
  { key: "moyenne", title: "Priorité moyenne" },
  { key: "basse", title: "Priorité basse" },
  { key: null, title: "Sans priorité" },
];

const tierRank = (t: string | null) => (t ? "SABCD".indexOf(t) : 9);
const target = (r: GameRow) => r.quotes?.cib?.median ?? r.quotes?.loose?.median ?? null;

export default function WishlistView() {
  const { stats } = useVault();
  const { openNewGame } = useNewGame();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [priority, setPriority] = useState<Priority>("all");
  const [sort, setSort] = useState<Sort>("priority");

  const wanted = useMemo(() => stats.rows.filter((r) => r.state === "wanted" && r.game.kind !== "hardware"), [stats.rows]);
  const budget = wanted.reduce((s, r) => s + (target(r) ?? 0), 0);
  const quoted = wanted.filter((r) => target(r) !== null).length;

  const platformCounts = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const r of wanted) {
      const e = m.get(r.game.platformId) ?? { label: r.platform?.shortName ?? r.game.platformId, n: 0 };
      e.n++;
      m.set(r.game.platformId, e);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [wanted]);

  const results = useMemo(() => {
    const list = wanted.filter(
      (r) => (!platform || r.game.platformId === platform) && (priority === "all" || r.game.buyPriority === priority) && matches(r.game, query),
    );
    return list.sort((a, b) => {
      if (sort === "quality") return tierRank(a.game.qualityTier) - tierRank(b.game.qualityTier);
      if (sort === "cheap") return (target(a) ?? 1e9) - (target(b) ?? 1e9);
      if (sort === "title") return a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr");
      return tierRank(a.game.qualityTier) - tierRank(b.game.qualityTier) || a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr");
    });
  }, [wanted, platform, priority, query, sort]);

  const card = (r: GameRow) => (
    <GameCard
      key={r.game.id}
      row={r}
      showState={false}
      ratio={platform ? formatOf(platform).ratio : undefined}
      badge={sort !== "priority" ? <PriorityBadge priority={r.game.buyPriority} /> : undefined}
      footer={
        target(r) !== null ? (
          <span className="tabular-nums text-muted">
            cote {euroFmt.format(target(r)!)}
            {r.quotes?.cib ? "" : " loose"}
          </span>
        ) : (
          <span className="text-muted/70">sans cote</span>
        )
      }
    />
  );

  return (
    <div className="animate-page">
      <PageHeader
        title="Wishlist"
        subtitle="Les jeux à trouver, en boîte FR"
        actions={
          <Button variant="primary" onClick={() => openNewGame()}>
            Ajouter un jeu
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="À trouver" value={intFmt.format(wanted.length)} detail={`${platformCounts.length} consoles`} />
        <StatTile label="Budget estimé" value={euroFmt.format(budget)} detail={`à la cote, ${quoted} jeux cotés`} tone="accent" />
        <StatTile label="Priorité haute" value={intFmt.format(stats.wishlistHigh)} detail="à guetter en premier" />
        <StatTile
          label="Cote moyenne"
          value={quoted ? euroFmt.format(budget / quoted) : "—"}
          detail="par jeu coté"
        />
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-56">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher dans la wishlist…" className={`${inputClass} pl-9`} />
          </div>
          <Segmented<Priority>
            label="Priorité"
            value={priority}
            onChange={setPriority}
            options={[
              { value: "all", label: "Toutes" },
              { value: "haute", label: "Haute" },
              { value: "moyenne", label: "Moyenne" },
              { value: "basse", label: "Basse" },
            ]}
          />
          <div className="w-48">
            <Select value={sort} options={Object.keys(SORTS)} labels={SORTS} onChange={(v) => setSort(v as Sort)} />
          </div>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          <Chip active={!platform} onClick={() => setPlatform("")} count={wanted.length}>
            Toutes
          </Chip>
          {platformCounts.map(([id, { label, n }]) => (
            <Chip key={id} active={platform === id} onClick={() => setPlatform(platform === id ? "" : id)} count={n}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState title="Rien à afficher">La wishlist est vide pour ces filtres.</EmptyState>
      ) : sort === "priority" ? (
        <div className="space-y-10">
          {GROUPS.map((g) => {
            const list = results.filter((r) => r.game.buyPriority === g.key);
            if (!list.length) return null;
            return (
              <section key={g.title}>
                <div className="mb-4 flex items-baseline gap-3 border-b border-border pb-2">
                  <h2 className="text-lg font-semibold">{g.title}</h2>
                  <span className="text-sm text-muted">
                    {list.length} jeu{list.length > 1 ? "x" : ""} · {euroFmt.format(list.reduce((s, r) => s + (target(r) ?? 0), 0))}
                  </span>
                </div>
                <CardGrid>{list.map(card)}</CardGrid>
              </section>
            );
          })}
        </div>
      ) : (
        <CardGrid>{results.map(card)}</CardGrid>
      )}
    </div>
  );
}
