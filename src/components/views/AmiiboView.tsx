"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GameRow } from "@/lib/stats";
import {
  AMIIBO_TYPE_GROUPS,
  DEFAULT_AMIIBO_TYPE,
  amiiboForGame,
  compatGameIndexes,
  entryKeys,
  gamesForAmiibo,
  inTypeGroup,
  typeGroupOf,
  typeRank,
  type AmiiboCatalogEntry,
  type AmiiboTypeGroup,
} from "@/lib/amiibo";
import { normalizeTitle } from "@/lib/normalize";
import { AmiiboIcon, CatalogIcon } from "@/components/icons";
import { Button, Chip, ChipRow, EmptyState, FilterBar, PageHeader, SearchField, SectionHeader, StatGrid, StatTile } from "@/components/ui/primitives";
import GameCard, { CardGrid } from "@/components/game/GameCard";
import { useAmiiboData } from "@/components/game/AmiiboCompat";
import { useVault } from "@/components/vault/VaultProvider";
import { matches } from "@/components/vault/model";

const SECTIONS: { key: "owned" | "incoming" | "wanted"; title: string }[] = [
  { key: "owned", title: "Ma collection" },
  { key: "incoming", title: "En route" },
  { key: "wanted", title: "Wishlist" },
];

/**
 * Les amiibo à part des jeux : possédés, en route, recherchés, et pour chacun les
 * jeux de la collection où il débloque quelque chose.
 */
export default function AmiiboView() {
  const { stats } = useVault();
  const data = useAmiiboData();
  const [query, setQuery] = useState("");
  // comme le catalogue : figurines par défaut, les cartes à part
  const [typeGroup, setTypeGroup] = useState<AmiiboTypeGroup>(DEFAULT_AMIIBO_TYPE);

  const amiibo = useMemo(() => stats.rows.filter((r) => r.game.kind === "amiibo"), [stats.rows]);

  // entrée du catalogue de chaque amiibo de la base (titre, alias anglais ou ancien titre)
  const entryOf = useMemo(() => {
    const out = new Map<string, AmiiboCatalogEntry>();
    if (!data) return out;
    const byKey = new Map<string, AmiiboCatalogEntry>();
    for (const a of data.amiibo) for (const k of entryKeys(a)) if (!byKey.has(k)) byKey.set(k, a);
    for (const r of amiibo) {
      const hit = [r.game.normalizedTitle, ...r.game.aliases.map(normalizeTitle)].map((k) => byKey.get(k)).find(Boolean);
      if (hit) out.set(r.game.id, hit);
    }
    return out;
  }, [data, amiibo]);

  // figurines et cartes séparées dès que la collection contient plusieurs types
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { figurine: 0, carte: 0, autre: 0, tous: amiibo.length };
    for (const r of amiibo) {
      const g = typeGroupOf(entryOf.get(r.game.id)?.ty);
      counts[g] = (counts[g] ?? 0) + 1;
    }
    return counts;
  }, [amiibo, entryOf]);
  const severalTypes = ["figurine", "carte", "autre"].filter((g) => typeCounts[g]).length > 1;
  // un seul type dans la collection : pas de puces ; puce choisie vide : tout montrer
  const activeType = severalTypes && typeCounts[typeGroup] ? typeGroup : "tous";
  const shown = amiibo.filter((r) => matches(r.game, query) && inTypeGroup(entryOf.get(r.game.id)?.ty, activeType));

  // jeux de la collection (possédés ou en route) avec lesquels chaque amiibo fonctionne
  const myGamesFor = useMemo(() => {
    const out = new Map<string, string[]>();
    if (!data) return out;
    const mine = new Map<number, string>();
    for (const r of stats.rows) {
      if (r.game.kind !== "game" || (r.ownedCount === 0 && r.state !== "incoming")) continue;
      for (const i of compatGameIndexes(r.game, data.compat)) mine.set(i, r.game.canonicalTitle);
    }
    for (const r of amiibo) {
      const entry = entryOf.get(r.game.id);
      if (!entry) continue;
      const titles = gamesForAmiibo(entry.id, data.compat)
        .map((g) => mine.get(g.index))
        .filter((t): t is string => !!t);
      out.set(r.game.id, [...new Set(titles)]);
    }
    return out;
  }, [data, stats.rows, amiibo, entryOf]);

  // jeux de la collection qui acceptent des amiibo : la raison d'en chercher
  const gamesWithAmiibo = useMemo(() => {
    if (!data) return 0;
    return stats.rows.filter((r) => r.game.kind === "game" && r.ownedCount > 0 && amiiboForGame(r.game, data.compat).length > 0).length;
  }, [data, stats.rows]);

  const group = (key: (typeof SECTIONS)[number]["key"]) =>
    shown
      .filter((r) => r.state === key)
      // « Tous » : figurines, puis autres objets, puis cartes
      .sort(
        (a, b) =>
          typeRank(entryOf.get(a.game.id)?.ty) - typeRank(entryOf.get(b.game.id)?.ty) ||
          a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr"),
      );

  const footer = (r: GameRow) => {
    const games = myGamesFor.get(r.game.id) ?? [];
    return games.length ? (
      <span className="line-clamp-2 text-xs text-muted" title={games.join(", ")}>
        {games.length} de mes jeux : {games.slice(0, 2).join(", ")}
        {games.length > 2 ? "…" : ""}
      </span>
    ) : null;
  };

  return (
    <div className="animate-page">
      <PageHeader
        title="Amiibo"
        subtitle="Les figurines de la collection et les jeux où elles débloquent du contenu"
        actions={
          <Link href="/catalogue/?plateforme=amiibo">
            <Button icon={<CatalogIcon size={14} />}>Tous les amiibo</Button>
          </Link>
        }
      />
      <StatGrid>
        <StatTile label="Possédés" icon={<AmiiboIcon size={14} />} value={String(amiibo.filter((r) => r.state === "owned").length)} />
        <StatTile label="En route" value={String(amiibo.filter((r) => r.state === "incoming").length)} />
        <StatTile label="Wishlist" value={String(amiibo.filter((r) => r.state === "wanted").length)} />
        <StatTile label="Mes jeux compatibles" value={String(gamesWithAmiibo)} detail="jeux possédés qui acceptent des amiibo" />
      </StatGrid>

      <FilterBar top={<SearchField className="basis-full sm:flex-1" value={query} onChange={setQuery} placeholder="Chercher un amiibo…" />}>
        {severalTypes ? (
          <ChipRow label="Type d’amiibo">
            {AMIIBO_TYPE_GROUPS.filter((g) => typeCounts[g.id]).map((g) => (
              <Chip key={g.id} active={activeType === g.id} onClick={() => setTypeGroup(g.id)} count={typeCounts[g.id]}>
                {g.label}
              </Chip>
            ))}
          </ChipRow>
        ) : null}
      </FilterBar>

      {amiibo.length === 0 ? (
        <EmptyState title="Aucun amiibo pour l’instant" icon={<AmiiboIcon size={18} />}>
          Parcourez le catalogue des amiibo et filtrez par jeu compatible pour trouver ceux qui débloquent du contenu dans vos jeux.
        </EmptyState>
      ) : (
        SECTIONS.map(({ key, title }) => {
          const rows = group(key);
          if (!rows.length) return null;
          return (
            <section key={key} className="mb-10">
              <SectionHeader title={title} meta={`${rows.length}`} />
              <CardGrid>
                {rows.map((r) => (
                  // la ligne de jeux compatibles passe sous la carte : le pied de carte, lui, ne revient pas à la ligne
                  <div key={r.game.id} className="min-w-0">
                    <GameCard row={r} ratio={1} />
                    <div className="mt-1 px-0.5">{footer(r)}</div>
                  </div>
                ))}
              </CardGrid>
            </section>
          );
        })
      )}
    </div>
  );
}
