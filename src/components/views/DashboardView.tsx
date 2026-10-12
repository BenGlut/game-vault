"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { monthLabel } from "@/lib/stats";
import { MarketplaceTag } from "@/components/BrandLogos";
import AreaChart from "@/components/charts/AreaChart";
import ColumnChart from "@/components/charts/ColumnChart";
import BarList from "@/components/charts/BarList";
import { SERIES, compact, euroFmt, intFmt } from "@/components/charts/core";
import { AlertIcon, ChevronRightIcon, CoinIcon, LayersIcon, LibraryIcon, PlusIcon, StarIcon, TagIcon, TrendUpIcon, TruckIcon } from "@/components/icons";
import { Badge, Button, ButtonLink, Card, CardLink, EmptyState, PageHeader, StatGrid, StatTile, StatusBadge, cx } from "@/components/ui/primitives";
import GameCard, { CardGrid } from "@/components/game/GameCard";
import GameCover from "@/components/game/GameCover";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import { useVault } from "@/components/vault/VaultProvider";
import ActivityList from "./ActivityList";
import { OrderProgress, dateFr } from "./orderParts";

export default function DashboardView() {
  const { stats, data } = useVault();
  const { open } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const router = useRouter();
  const sellers = useMemo(() => new Map(data.sellers.map((s) => [s.id, s.name])), [data.sellers]);

  const last12 = stats.months.slice(-12);
  const last18 = stats.months.slice(-18);
  const gain = stats.collectionValue - stats.costOfOwned;
  const gainPct = stats.costOfOwned ? Math.round((gain / stats.costOfOwned) * 100) : null;
  const wanted = stats.rows
    .filter((r) => r.state === "wanted" && r.game.kind !== "hardware")
    .sort(
      (a, b) =>
        ["haute", "moyenne", "basse", null].indexOf(a.game.buyPriority) - ["haute", "moyenne", "basse", null].indexOf(b.game.buyPriority) ||
        (a.game.qualityTier ?? "Z").localeCompare(b.game.qualityTier ?? "Z"),
    )
    .slice(0, 6);
  const hour = new Date().getHours();
  const todos = [
    { label: "Exemplaires à vérifier", n: stats.needsReview, href: "/collection?verif=1", icon: <AlertIcon size={15} /> },
    { label: "Jeux possédés sans cote", n: stats.withoutQuote, href: "/collection?cote=0", icon: <TagIcon size={15} /> },
    { label: "Doublons en stock", n: stats.duplicates, href: "/collection?doublons=1", icon: <LayersIcon size={15} /> },
  ];

  return (
    <div className="animate-page space-y-4 sm:space-y-5">
      <PageHeader
        title={hour < 6 || hour >= 18 ? "Bonsoir" : "Bonjour"}
        subtitle={new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase())}
        actions={
          <>
            <ButtonLink href="/estimateur" icon={<TagIcon size={15} />}>
              Estimer une annonce
            </ButtonLink>
            <Button variant="primary" icon={<PlusIcon size={15} />} onClick={() => openNewGame()} className="max-sm:hidden">
              Nouveau jeu
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatTile
          label="Jeux possédés"
          icon={<LibraryIcon size={14} />}
          value={intFmt.format(stats.ownedGames)}
          detail={`${intFmt.format(stats.ownedItems)} exemplaires`}
          trend={last12.map((m) => m.ownedTotal)}
          href="/collection"
        />
        <StatTile
          label="Dépensé sur 12 mois"
          icon={<CoinIcon size={14} />}
          value={euroFmt.format(stats.spent12m)}
          detail={`${euroFmt.format(stats.spentTotal)} au total`}
          trend={last12.map((m) => m.spent)}
          href="/statistiques"
        />
        <StatTile label="Wishlist" icon={<StarIcon size={14} />} value={intFmt.format(stats.wishlist)} detail={`${stats.wishlistHigh} en priorité haute`} href="/wishlist" />
        <StatTile
          label="En route"
          icon={<TruckIcon size={14} />}
          value={euroFmt.format(stats.incomingAmount)}
          detail={`${stats.incomingOrders.length} commande${stats.incomingOrders.length > 1 ? "s" : ""}`}
          href="/commandes"
          tone={stats.incomingOrders.length ? "accent" : "default"}
        />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* chiffre phare + évolution */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-medium text-muted">Valeur de la collection</h2>
              <div className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{euroFmt.format(stats.collectionValue)}</div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
                {stats.costOfOwned > 0 ? (
                  <Badge tone={gain >= 0 ? "ok" : "ko"} size="md">
                    <TrendUpIcon size={13} className={gain < 0 ? "rotate-180" : ""} />
                    {gain >= 0 ? "+" : ""}
                    {euroFmt.format(gain)}
                    {gainPct !== null ? ` · ${gain >= 0 ? "+" : ""}${gainPct} %` : ""}
                  </Badge>
                ) : null}
                <span className="text-muted">
                  par rapport aux prix payés · {intFmt.format(stats.valuedItems)} exemplaires cotés sur {intFmt.format(stats.ownedItems)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <AreaChart
              height={220}
              data={last18.map((m) => ({
                label: monthLabel(m.month),
                title: monthLabel(m.month, true),
                values: { value: m.valueTotal, spent: m.spentTotal },
              }))}
              series={[
                { key: "value", label: "Valeur à la cote actuelle", color: SERIES[0], fill: true },
                { key: "spent", label: "Dépensé, cumulé", color: SERIES[1] },
              ]}
              format={(v) => euroFmt.format(v)}
              axisFormat={(v) => compact(v, " €")}
            />
          </div>
        </Card>

        <Card title="Par console" subtitle="Exemplaires possédés et valeur" action={<CardLink href="/statistiques">Tout voir</CardLink>}>
          <BarList
            items={stats.byPlatform
              .filter((p) => p.count > 0)
              .slice(0, 8)
              .map((p) => ({
                key: p.platformId,
                label: p.label,
                value: p.count,
                display: `${p.count} · ${euroFmt.format(p.value)}`,
                onClick: () => router.push(`/collection?console=${p.platformId}`),
              }))}
          />
        </Card>
      </div>

      {/* à faire : raccourcis vers les listes filtrées */}
      <nav aria-label="À faire" className="grid gap-2 sm:grid-cols-3">
        {todos.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-[13px] shadow-[var(--shadow-card)] transition hover:border-border-strong hover:bg-surface-2/50"
          >
            <span className={cx("flex h-7 w-7 items-center justify-center rounded-lg", t.n ? "bg-accent/10 text-accent" : "bg-surface-2 text-muted")}>{t.icon}</span>
            <span className="flex-1 text-text-2 group-hover:text-text">{t.label}</span>
            <span className={cx("font-semibold tabular-nums", t.n ? "text-text" : "text-muted")}>{t.n}</span>
            <ChevronRightIcon size={14} className="text-muted transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card
          title="Dépenses par mois"
          subtitle={`${last12.length > 1 ? `${last12.length} derniers mois` : "Ce mois-ci"}, commandes non annulées`}
          className="lg:col-span-3"
          action={<CardLink href="/statistiques">Détails</CardLink>}
        >
          <ColumnChart
            label="Dépenses par mois"
            data={last12.map((m) => ({
              label: monthLabel(m.month),
              title: monthLabel(m.month, true),
              value: m.spent,
              detail: `${m.orders} commande${m.orders > 1 ? "s" : ""} · ${m.acquired} arrivée${m.acquired > 1 ? "s" : ""}`,
            }))}
            format={(v) => euroFmt.format(v)}
            axisFormat={(v) => compact(v, " €")}
            highlightLast
          />
        </Card>
        <Card title="Activité récente" className="lg:col-span-2" action={<CardLink href="/historique">Historique</CardLink>}>
          <ActivityList entries={data.changeLog.slice(0, 5)} onOpenGame={open} compact />
        </Card>
      </div>

      <Card
        title="Commandes en route"
        subtitle={stats.incomingOrders.length ? `${euroFmt.format(stats.incomingAmount)} engagés` : undefined}
        action={<CardLink href="/commandes">Toutes</CardLink>}
        padded={false}
      >
          {stats.incomingOrders.length ? (
            <ul className="divide-y divide-border border-t border-border">
              {stats.incomingOrders.slice(0, 5).map((o) => {
                const first = data.games.find((g) => g.id === o.items[0]?.gameId);
                return (
                  <li key={o.id}>
                    <Link
                      href={`/commandes/?commande=${o.id}`}
                      className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition hover:bg-surface-2/50 sm:px-5 md:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,18rem)_6rem]"
                    >
                      <div className="row-span-2 sm:row-span-1">{first ? <GameCover gameId={first.id} title={first.canonicalTitle} rounded="rounded" width={40} /> : null}</div>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">
                          {first?.canonicalTitle ?? "—"}
                          {o.items.length > 1 ? <span className="text-muted"> + {o.items.length - 1}</span> : null}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                          <MarketplaceTag marketplace={o.marketplace} size={12} />
                          {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} · {dateFr(o.orderedAt)}
                        </span>
                      </span>
                      <span className="hidden md:block">
                        <OrderProgress order={o} />
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="text-[13px] font-semibold tabular-nums">{euroFmt.format(o.totalPaid ?? 0)}</span>
                        <StatusBadge status={o.status} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <EmptyState title="Rien en route" icon={<TruckIcon size={18} />}>
                Les commandes passées apparaîtront ici jusqu’à leur réception.
              </EmptyState>
            </div>
          )}
      </Card>

      <Card title="À chasser en priorité" subtitle="Wishlist, par priorité puis qualité" action={<CardLink href="/wishlist">Wishlist</CardLink>}>
        {wanted.length ? (
          <CardGrid dense>
            {wanted.map((r) => (
              <GameCard key={r.game.id} row={r} showState={false} footer={r.quotes?.cib ? euroFmt.format(r.quotes.cib.median) : "sans cote"} />
            ))}
          </CardGrid>
        ) : (
          <EmptyState title="La wishlist est vide" icon={<StarIcon size={18} />} />
        )}
      </Card>

      {stats.recent.length ? (
        <Card title="Derniers arrivés" action={<CardLink href="/collection?tri=recent">Collection</CardLink>}>
          <CardGrid dense>
            {stats.recent.slice(0, 8).map((r) => (
              <GameCard key={r.game.id} row={r} showState={false} footer={r.lastAcquired ? dateFr(r.lastAcquired) : null} />
            ))}
          </CardGrid>
        </Card>
      ) : null}
    </div>
  );
}
