"use client";

import { useMemo, useState } from "react";
import type { GameRow } from "@/lib/stats";
import { euroFmt, intFmt } from "@/components/charts/core";
import { CoinIcon, PlusIcon, StarIcon, TagIcon, AlertIcon } from "@/components/icons";
import {
  Badge,
  Button,
  Chip,
  ChipRow,
  EmptyState,
  FilterBar,
  PageHeader,
  PriorityBadge,
  SearchField,
  SectionHeader,
  Segmented,
  StatGrid,
  StatTile,
} from "@/components/ui/primitives";
import { Select } from "@/components/ui/fields";
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
  title: "Titre (A → Z)",
};

const GROUPS: { key: string | null; title: string; tone: "ko" | "accent" | "neutral" }[] = [
  { key: "haute", title: "Priorité haute", tone: "ko" },
  { key: "moyenne", title: "Priorité moyenne", tone: "accent" },
  { key: "basse", title: "Priorité basse", tone: "neutral" },
  { key: null, title: "Sans priorité", tone: "neutral" },
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

  const wanted = useMemo(() => stats.rows.filter((r) => r.state === "wanted" && r.game.kind === "game"), [stats.rows]);
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
      footer={target(r) !== null ? `${euroFmt.format(target(r)!)}${r.quotes?.cib ? "" : " loose"}` : "sans cote"}
    />
  );

  return (
    <div className="animate-page">
      <PageHeader
        title="Wishlist"
        subtitle="Les jeux à trouver, en boîte française"
        actions={
          <Button variant="primary" icon={<PlusIcon size={15} />} onClick={() => openNewGame()} className="max-sm:hidden">
            Ajouter un jeu
          </Button>
        }
      />

      <div className="mb-5">
        <StatGrid>
          <StatTile label="À trouver" icon={<StarIcon size={14} />} value={intFmt.format(wanted.length)} detail={`sur ${platformCounts.length} consoles`} />
          <StatTile label="Budget estimé" icon={<CoinIcon size={14} />} value={euroFmt.format(budget)} detail={`à la cote, ${quoted} jeux cotés`} tone="accent" />
          <StatTile label="Priorité haute" icon={<AlertIcon size={14} />} value={intFmt.format(stats.wishlistHigh)} detail="à guetter en premier" />
          <StatTile label="Cote moyenne" icon={<TagIcon size={14} />} value={quoted ? euroFmt.format(budget / quoted) : "—"} detail="par jeu coté" />
        </StatGrid>
      </div>

      <FilterBar
        top={
          <>
            <SearchField className="basis-full sm:flex-1 sm:basis-56" value={query} onChange={setQuery} placeholder="Chercher dans la wishlist…" />
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
            <Select label="Trier par" className="w-full sm:w-48" value={sort} options={Object.keys(SORTS)} labels={SORTS} onChange={(v) => setSort(v as Sort)} />
          </>
        }
      >
        <ChipRow label="Console">
          <Chip active={!platform} onClick={() => setPlatform("")} count={wanted.length}>
            Toutes
          </Chip>
          {platformCounts.map(([id, { label, n }]) => (
            <Chip key={id} active={platform === id} onClick={() => setPlatform(platform === id ? "" : id)} count={n}>
              {label}
            </Chip>
          ))}
        </ChipRow>
      </FilterBar>

      {results.length === 0 ? (
        <EmptyState title="Rien à afficher" icon={<StarIcon size={18} />}>
          La wishlist est vide pour ces filtres.
        </EmptyState>
      ) : sort === "priority" ? (
        <div className="space-y-9">
          {GROUPS.map((g) => {
            const list = results.filter((r) => r.game.buyPriority === g.key);
            if (!list.length) return null;
            return (
              <section key={g.title}>
                <SectionHeader
                  title={
                    <span className="inline-flex items-center gap-2">
                      {g.title}
                      <Badge tone={g.tone}>{list.length}</Badge>
                    </span>
                  }
                  meta={`${euroFmt.format(list.reduce((s, r) => s + (target(r) ?? 0), 0))} à la cote`}
                />
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
