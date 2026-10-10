"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { euro } from "@/lib/labels";
import { monthLabel } from "@/lib/stats";
import AreaChart from "@/components/charts/AreaChart";
import ColumnChart from "@/components/charts/ColumnChart";
import BarList from "@/components/charts/BarList";
import RankedShare from "@/components/charts/RankedShare";
import type { Breakdown } from "@/lib/stats";

/** Ordre logique, du plus complet au moins complet. */
const COMPLETENESS_ORDER = [
  { key: "sealed", label: "Sous blister", hint: "neuf, jamais ouvert" },
  { key: "CIB", label: "Complet", hint: "boîte, notice et jeu" },
  { key: "no_manual", label: "Sans notice", hint: "boîte et jeu" },
  { key: "box_only", label: "Boîte seule", hint: "sans le jeu" },
  { key: "loose", label: "Loose", hint: "jeu seul" },
  { key: "code_in_box", label: "Code dans la boîte", hint: "pas de cartouche" },
];

/** Du neuf à l'abîmé. */
const CONDITION_ORDER = [
  { key: "new", label: "Neuf", hint: "" },
  { key: "like_new", label: "Comme neuf", hint: "aucune trace" },
  { key: "very_good", label: "Très bon", hint: "traces légères" },
  { key: "good", label: "Bon", hint: "usure visible" },
  { key: "acceptable", label: "Acceptable", hint: "défauts marqués" },
  { key: "poor", label: "Abîmé", hint: "à remplacer" },
];

const countOf = (list: Breakdown[], key: string) => list.find((b) => b.key === key)?.count ?? 0;
import { ACCENT, SERIES, compact, euroFmt, intFmt } from "@/components/charts/core";
import { Card, PageHeader, Segmented, StatTile } from "@/components/ui/primitives";
import GameCover from "@/components/game/GameCover";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault } from "@/components/vault/VaultProvider";

type Period = "12" | "24" | "all";

export default function StatsView() {
  const { stats } = useVault();
  const { open } = useGameDrawer();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("24");

  const months = useMemo(
    () => (period === "all" ? stats.months : stats.months.slice(-Number(period))),
    [stats.months, period],
  );
  const first = months[0];
  const last = months[months.length - 1];
  const spentInPeriod = months.reduce((s, m) => s + m.spent, 0);
  const arrivedInPeriod = months.reduce((s, m) => s + m.acquired, 0);
  const gain = stats.collectionValue - stats.costOfOwned;
  const withYear = months.length > 14;

  const tiers = useMemo(() => {
    const owned = stats.rows.filter((r) => r.ownedCount > 0 && r.game.kind !== "hardware");
    return ["S", "A", "B", "C", "D"].map((t) => ({ tier: t, n: owned.filter((r) => r.game.qualityTier === t).length }));
  }, [stats.rows]);

  return (
    <div className="animate-page space-y-6">
      <PageHeader
        title="Statistiques"
        subtitle="Ce que vaut la collection, ce qu’elle a coûté et comment elle grandit"
        actions={
          <Segmented<Period>
            label="Période"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "12", label: "12 mois" },
              { value: "24", label: "24 mois" },
              { value: "all", label: "Tout" },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Valeur à la cote" value={euroFmt.format(stats.collectionValue)} detail={`${intFmt.format(stats.valuedItems)} exemplaires cotés`} tone="accent" />
        <StatTile label="Payé (exemplaires possédés)" value={euroFmt.format(stats.costOfOwned)} detail={`${intFmt.format(stats.pricedItems)} prix connus`} />
        <StatTile
          label="Plus-value latente"
          value={`${gain >= 0 ? "+" : ""}${euroFmt.format(gain)}`}
          detail={stats.costOfOwned ? `${gain >= 0 ? "+" : ""}${Math.round((gain / stats.costOfOwned) * 100)} % sur les prix payés` : undefined}
        />
        <StatTile
          label="Sur la période"
          value={euroFmt.format(spentInPeriod)}
          detail={`${intFmt.format(arrivedInPeriod)} exemplaires arrivés`}
        />
      </div>

      <Card
        title="Valeur et dépenses cumulées"
        subtitle={
          first && last
            ? `De ${monthLabel(first.month, true)} à ${monthLabel(last.month, true)} · valeur des exemplaires possédés à la cote d’aujourd’hui`
            : undefined
        }
      >
        <AreaChart
          height={280}
          data={months.map((m) => ({ label: monthLabel(m.month, withYear && m.month.endsWith("-01")), title: monthLabel(m.month, true), values: { value: m.valueTotal, spent: m.spentTotal } }))}
          series={[
            { key: "value", label: "Valeur à la cote", color: SERIES[0], fill: true },
            { key: "spent", label: "Dépensé, cumulé", color: SERIES[1] },
          ]}
          format={(v) => euroFmt.format(v)}
          axisFormat={(v) => compact(v, " €")}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Taille de la collection" subtitle="Exemplaires possédés en fin de mois">
          <AreaChart
            data={months.map((m) => ({ label: monthLabel(m.month), title: monthLabel(m.month, true), values: { owned: m.ownedTotal } }))}
            series={[{ key: "owned", label: "Exemplaires", color: ACCENT, fill: true }]}
            format={(v) => `${intFmt.format(v)} exemplaires`}
            axisFormat={(v) => compact(v)}
          />
        </Card>
        <Card title="Arrivées par mois" subtitle="Exemplaires reçus">
          <ColumnChart
            data={months.map((m) => ({
              label: monthLabel(m.month),
              title: monthLabel(m.month, true),
              value: m.acquired,
              detail: m.spent ? `${euroFmt.format(m.spent)} dépensés` : undefined,
            }))}
            format={(v) => `${intFmt.format(v)} exemplaire${v > 1 ? "s" : ""}`}
            axisFormat={(v) => compact(v)}
            color={SERIES[2]!}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Exemplaires par console">
          <BarList
            items={stats.byPlatform
              .filter((p) => p.count > 0)
              .map((p) => ({
                key: p.platformId,
                label: p.label,
                value: p.count,
                display: `${p.count}${p.wanted ? ` · ${p.wanted} en wishlist` : ""}`,
                onClick: () => router.push(`/collection?console=${p.platformId}`),
              }))}
          />
        </Card>
        <Card title="Valeur par console" subtitle="À la cote, exemplaires possédés">
          <BarList
            color={SERIES[0]!}
            items={[...stats.byPlatform]
              .filter((p) => p.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((p) => ({
                key: p.platformId,
                label: p.label,
                value: p.value,
                display: `${euroFmt.format(p.value)} · ${p.count ? euroFmt.format(p.value / p.count) : "—"} / ex.`,
                onClick: () => router.push(`/collection?console=${p.platformId}`),
              }))}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Complétude" subtitle="Ce qu’il y a dans la boîte, pour les exemplaires possédés">
          <RankedShare
            color={SERIES[0]!}
            rows={COMPLETENESS_ORDER.map((c) => ({ ...c, count: countOf(stats.byCompleteness, c.key) }))}
            unknown={countOf(stats.byCompleteness, "unknown")}
          />
        </Card>
        <Card title="État" subtitle="L’usure des exemplaires possédés, du neuf à l’abîmé">
          <RankedShare
            color={SERIES[2]!}
            rows={CONDITION_ORDER.map((c) => ({ ...c, count: countOf(stats.byCondition, c.key) }))}
            unknown={countOf(stats.byCondition, "unknown")}
          />
        </Card>
        <Card title="Qualité des jeux" subtitle="Jeux possédés notés, de S (incontournable) à D">
          <BarList
            color={SERIES[6]}
            items={tiers.map((t) => ({ key: t.tier, label: `Niveau ${t.tier}`, value: t.n, display: intFmt.format(t.n) }))}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Les pièces les plus cotées">
          <ul className="divide-y divide-border">
            {stats.topValue.slice(0, 8).map((r, i) => (
              <li key={r.game.id}>
                <button type="button" onClick={() => open(r.game.id)} className="flex w-full items-center gap-3 py-2.5 text-left transition hover:opacity-80">
                  <span className="w-5 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                  <div className="w-9 shrink-0">
                    <GameCover gameId={r.game.id} title={r.game.canonicalTitle} rounded="rounded-md" width={40} />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{r.game.canonicalTitle}</span>
                    <span className="block text-xs text-muted">{r.platform?.shortName}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{euroFmt.format(r.value ?? 0)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Les meilleures affaires" subtitle="Cote actuelle moins prix payé">
          <ul className="divide-y divide-border">
            {stats.bestGains.slice(0, 8).map(({ row, item, value, gain: g }) => (
              <li key={item.id}>
                <button type="button" onClick={() => open(row.game.id)} className="flex w-full items-center gap-3 py-2.5 text-left transition hover:opacity-80">
                  <div className="w-9 shrink-0">
                    <GameCover gameId={row.game.id} title={row.game.canonicalTitle} rounded="rounded-md" width={40} />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{row.game.canonicalTitle}</span>
                    <span className="block text-xs text-muted">
                      payé {euro(item.purchasePrice?.amount)} · coté {euro(value)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-ok">+{euroFmt.format(g)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
