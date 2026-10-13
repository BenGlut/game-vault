"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GameRow } from "@/lib/stats";
import { amiiboForGame, gamesForAmiibo, compatGameIndexes } from "@/lib/amiibo";
import { normalizeTitle } from "@/lib/normalize";
import { AmiiboIcon, CatalogIcon } from "@/components/icons";
import { Button, EmptyState, FilterBar, PageHeader, SearchField, SectionHeader, StatGrid, StatTile } from "@/components/ui/primitives";
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

  const amiibo = useMemo(() => stats.rows.filter((r) => r.game.kind === "amiibo"), [stats.rows]);
  const shown = amiibo.filter((r) => matches(r.game, query));

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
      const keys = new Set([r.game.normalizedTitle, ...r.game.aliases.map(normalizeTitle)]);
      const entry = data.amiibo.find((a) => keys.has(a.n));
      if (!entry) continue;
      const titles = gamesForAmiibo(entry.id, data.compat)
        .map((g) => mine.get(g.index))
        .filter((t): t is string => !!t);
      out.set(r.game.id, [...new Set(titles)]);
    }
    return out;
  }, [data, stats.rows, amiibo]);

  // jeux de la collection qui acceptent des amiibo : la raison d'en chercher
  const gamesWithAmiibo = useMemo(() => {
    if (!data) return 0;
    return stats.rows.filter((r) => r.game.kind === "game" && r.ownedCount > 0 && amiiboForGame(r.game, data.compat).length > 0).length;
  }, [data, stats.rows]);

  const group = (key: (typeof SECTIONS)[number]["key"]) =>
    shown
      .filter((r) => r.state === key)
      .sort((a, b) => a.game.canonicalTitle.localeCompare(b.game.canonicalTitle, "fr"));

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

      <FilterBar top={<SearchField className="basis-full sm:flex-1" value={query} onChange={setQuery} placeholder="Chercher un amiibo…" />} />

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
