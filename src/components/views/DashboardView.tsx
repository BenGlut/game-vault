"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { monthLabel } from "@/lib/stats";
import { MARKETPLACE_LABELS } from "@/lib/stats";
import AreaChart from "@/components/charts/AreaChart";
import ColumnChart from "@/components/charts/ColumnChart";
import BarList from "@/components/charts/BarList";
import { SERIES, compact, euroFmt, intFmt } from "@/components/charts/core";
import { Card, CardLink, PageHeader, StatTile, StatusBadge } from "@/components/ui/primitives";
import GameCard, { CardGrid } from "@/components/game/GameCard";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useNewGame } from "@/components/game/NewGameForm";
import { useVault } from "@/components/vault/VaultProvider";
import { Button } from "@/components/ui/fields";
import ActivityList from "./ActivityList";

const dateFr = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function DashboardView() {
  const { stats, data } = useVault();
  const { open } = useGameDrawer();
  const { openNewGame } = useNewGame();
  const router = useRouter();
  const sellers = useMemo(() => new Map(data.sellers.map((s) => [s.id, s.name])), [data.sellers]);

  const last12 = stats.months.slice(-12);
  const last18 = stats.months.slice(-18);
  const gain = stats.collectionValue - stats.costOfOwned;
  const wanted = stats.rows
    .filter((r) => r.state === "wanted" && r.game.kind !== "hardware")
    .sort(
      (a, b) =>
        ["haute", "moyenne", "basse", null].indexOf(a.game.buyPriority) - ["haute", "moyenne", "basse", null].indexOf(b.game.buyPriority) ||
        (a.game.qualityTier ?? "Z").localeCompare(b.game.qualityTier ?? "Z"),
    )
    .slice(0, 6);
  const hour = new Date().getHours();

  return (
    <div className="animate-page space-y-6">
      <PageHeader
        title={hour < 6 || hour >= 18 ? "Bonsoir" : "Bonjour"}
        subtitle={new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <>
            <Link
              href="/estimateur"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition hover:border-border-strong"
            >
              Estimer une annonce
            </Link>
            <Button variant="primary" onClick={() => openNewGame()}>
              Nouveau jeu
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* chiffre phare + évolution */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm text-muted">Valeur de la collection</div>
              <div className="mt-1 text-5xl font-semibold tracking-tight">{euroFmt.format(stats.collectionValue)}</div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="text-muted">
                  {intFmt.format(stats.valuedItems)} exemplaires cotés sur {intFmt.format(stats.ownedItems)}
                </span>
                {stats.costOfOwned > 0 ? (
                  <span className={gain >= 0 ? "text-ok" : "text-ko"}>
                    {gain >= 0 ? "+" : ""}
                    {euroFmt.format(gain)} par rapport aux prix payés
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <AreaChart
              height={230}
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

        <div className="grid grid-cols-2 gap-4">
          <StatTile
            label="Jeux possédés"
            value={intFmt.format(stats.ownedGames)}
            detail={`${intFmt.format(stats.ownedItems)} exemplaires`}
            trend={last12.map((m) => m.ownedTotal)}
            href="/collection"
          />
          <StatTile
            label="Dépensé sur 12 mois"
            value={euroFmt.format(stats.spent12m)}
            detail={`${euroFmt.format(stats.spentTotal)} au total`}
            trend={last12.map((m) => m.spent)}
            href="/statistiques"
          />
          <StatTile
            label="Wishlist"
            value={intFmt.format(stats.wishlist)}
            detail={`${stats.wishlistHigh} en priorité haute`}
            href="/wishlist"
          />
          <StatTile
            label="En route"
            value={euroFmt.format(stats.incomingAmount)}
            detail={`${stats.incomingOrders.length} commande${stats.incomingOrders.length > 1 ? "s" : ""}`}
            href="/commandes"
            tone={stats.incomingOrders.length ? "accent" : "default"}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card
          title="Dépenses par mois"
          subtitle={`${last12.length > 1 ? `${last12.length} derniers mois` : "Ce mois-ci"}, commandes non annulées`}
          className="lg:col-span-3"
          action={<CardLink href="/statistiques">Détails</CardLink>}
        >
          <ColumnChart
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
        <Card title="Par console" subtitle="Exemplaires possédés" className="lg:col-span-2" action={<CardLink href="/statistiques">Tout voir</CardLink>}>
          <BarList
            items={stats.byPlatform
              .filter((p) => p.count > 0)
              .slice(0, 7)
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Commandes en route"
          subtitle={stats.incomingOrders.length ? `${euroFmt.format(stats.incomingAmount)} engagés` : undefined}
          action={<CardLink href="/commandes">Toutes</CardLink>}
        >
          {stats.incomingOrders.length ? (
            <ul className="divide-y divide-border">
              {stats.incomingOrders.slice(0, 5).map((o) => {
                const titles = o.items.map((it) => data.games.find((g) => g.id === it.gameId)?.canonicalTitle ?? it.gameId);
                return (
                  <li key={o.id}>
                    <Link href={`/commandes/?commande=${o.id}`} className="flex items-center gap-3 py-3 transition hover:opacity-80">
                      <StatusBadge status={o.status} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{titles.join(", ")}</span>
                        <span className="block text-xs text-muted">
                          {MARKETPLACE_LABELS[o.marketplace] ?? o.marketplace}
                          {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} · {dateFr(o.orderedAt)}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{euroFmt.format(o.totalPaid ?? 0)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">Rien en route pour le moment.</p>
          )}
        </Card>

        <Card title="À chasser en priorité" subtitle="Wishlist, priorité puis qualité" action={<CardLink href="/wishlist">Wishlist</CardLink>}>
          {wanted.length ? (
            <div className="grid grid-cols-3 gap-x-3 gap-y-4">
              {wanted.map((r) => (
                <GameCard
                  key={r.game.id}
                  row={r}
                  showState={false}
                  footer={
                    r.quotes?.cib ? <span className="text-muted">cote {euroFmt.format(r.quotes.cib.median)}</span> : <span className="text-muted">sans cote</span>
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">La wishlist est vide.</p>
          )}
        </Card>
      </div>

      {stats.recent.length ? (
        <Card title="Derniers arrivés" action={<CardLink href="/collection?tri=recent">Collection</CardLink>}>
          <CardGrid dense>
            {stats.recent.slice(0, 8).map((r) => (
              <GameCard key={r.game.id} row={r} showState={false} footer={r.lastAcquired ? <span className="text-muted">{dateFr(r.lastAcquired)}</span> : null} />
            ))}
          </CardGrid>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="À faire">
          <ul className="space-y-2 text-sm">
            {[
              { label: "Exemplaires à vérifier", n: stats.needsReview, href: "/collection?verif=1" },
              { label: "Jeux possédés sans cote", n: stats.withoutQuote, href: "/collection?cote=0" },
              { label: "Doublons en stock", n: stats.duplicates, href: "/collection?doublons=1" },
            ].map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  className="flex items-center justify-between rounded-xl border border-border bg-bg-elev px-3 py-2.5 transition hover:border-accent/40"
                >
                  <span>{t.label}</span>
                  <span className={`font-semibold tabular-nums ${t.n ? "text-accent" : "text-muted"}`}>{t.n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Activité récente" className="lg:col-span-2" action={<CardLink href="/historique">Historique</CardLink>}>
          <ActivityList entries={data.changeLog.slice(0, 6)} onOpenGame={open} compact />
        </Card>
      </div>
    </div>
  );
}
