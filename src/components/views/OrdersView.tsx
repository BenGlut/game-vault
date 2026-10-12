"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/schema";
import { euro } from "@/lib/labels";
import { MARKETPLACE_LABELS, monthLabel } from "@/lib/stats";
import ColumnChart from "@/components/charts/ColumnChart";
import BarList from "@/components/charts/BarList";
import { MarketplaceTag } from "@/components/BrandLogos";
import { compact, euroFmt, intFmt } from "@/components/charts/core";
import { CartIcon, ChevronDownIcon, CoinIcon, PackageIcon, TruckIcon } from "@/components/icons";
import {
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  PageHeader,
  SearchField,
  SectionHeader,
  StatGrid,
  StatTile,
  StatusBadge,
  cx,
  table,
} from "@/components/ui/primitives";
import { Select, sizedInput } from "@/components/ui/fields";
import GameCover from "@/components/game/GameCover";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault, type OrderAction } from "@/components/vault/VaultProvider";
import { today } from "@/components/vault/model";
import { normalizeTitle } from "@/lib/normalize";
import { OrderProgress, dateFr } from "./orderParts";

const ACTIONS: { action: OrderAction; label: string; from: string[]; risky?: boolean }[] = [
  { action: "fulfill", label: "Expédiée", from: ["ordered"] },
  { action: "deliver", label: "Reçue", from: ["ordered", "fulfilled"] },
  { action: "cancel", label: "Annulée", from: ["ordered", "fulfilled"], risky: true },
  { action: "refund", label: "Remboursée", from: ["ordered", "fulfilled", "delivered"], risky: true },
];

const STATUS_FILTERS: Record<string, string> = {
  ordered: "Commandées",
  fulfilled: "Expédiées",
  delivered: "Reçues",
  cancelled: "Annulées",
  refunded: "Remboursées",
};

function OrderItems({ order }: { order: Order }) {
  const { rowById } = useVault();
  const { open } = useGameDrawer();
  return (
    <ul className="space-y-0.5">
      {order.items.map((it, n) => {
        const row = rowById.get(it.gameId);
        return (
          <li key={`${it.gameId}-${n}`}>
            <button
              type="button"
              onClick={() => open(it.gameId)}
              className="group flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left text-[13px] transition hover:bg-surface-2/70"
            >
              <div className="w-7 shrink-0">
                <GameCover gameId={it.gameId} title={row?.game.canonicalTitle ?? it.gameId} rounded="rounded" width={40} />
              </div>
              <span className="min-w-0 flex-1 truncate group-hover:text-accent">{row?.game.canonicalTitle ?? it.gameId}</span>
              <span className="shrink-0 text-xs text-muted">{row?.platform?.shortName}</span>
              <span className="w-16 shrink-0 text-right tabular-nums text-text-2">{euro(it.unitPrice)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Détail du montant payé : articles, port, protection, total. */
function Amounts({ order }: { order: Order }) {
  const rows: [string, number | null][] = [
    ["Articles", order.itemsTotal],
    ["Port", order.shippingCost],
    ["Protection acheteur", order.buyerProtection],
  ];
  if (order.lotDiscount) rows.push(["Remise lot", -order.lotDiscount]);
  return (
    <dl className="space-y-1 text-xs">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <dt className="text-muted">{k}</dt>
          <dd className="tabular-nums text-text-2">{euro(v)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t border-border pt-1.5 text-[13px] font-semibold">
        <dt>Total payé</dt>
        <dd className="tabular-nums">{euro(order.totalPaid)}</dd>
      </div>
    </dl>
  );
}

/** Commande en cours : suivi, contenu, et les transitions disponibles à la date choisie. */
function ActiveOrder({ order }: { order: Order }) {
  const { data, transitionOrder } = useVault();
  const [date, setDate] = useState(today());
  const [pending, setPending] = useState<OrderAction | null>(null);
  const [busy, setBusy] = useState(false);
  const seller = data.sellers.find((s) => s.id === order.sellerId);
  const available = ACTIONS.filter((a) => a.from.includes(order.status) && a.action !== "refund");

  async function run(action: OrderAction) {
    setBusy(true);
    await transitionOrder(order.id, action, date);
    setBusy(false);
    setPending(null);
  }

  return (
    <li id={`commande-${order.id}`} className="flex flex-col rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <MarketplaceTag marketplace={order.marketplace} className="text-[13px] font-medium" />
            {seller ? <span className="truncate text-[13px] text-muted">· {seller.name}</span> : null}
          </div>
          {order.reference ? <p className="mt-1 text-xs text-muted">Réf. {order.reference}</p> : null}
        </div>
        <span className="text-lg font-semibold tabular-nums">{euro(order.totalPaid)}</span>
      </div>
      <div className="px-4 pb-3">
        <OrderProgress order={order} />
      </div>
      <div className="border-t border-border px-2.5 py-2">
        <OrderItems order={order} />
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-surface-2/40 p-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          <span>Le</span>
          <input className={sizedInput("w-auto").replace("h-9", "h-8")} type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date du changement" />
        </label>
        {pending ? (
          <div role="alert" className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <span className="basis-full text-xs font-medium text-ko sm:basis-auto">
              Marquer {ACTIONS.find((a) => a.action === pending)?.label.toLowerCase()} le {dateFr(date, true)} ?
            </span>
            <Button size="sm" onClick={() => setPending(null)}>
              Non
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => run(pending)}>
              Confirmer
            </Button>
          </div>
        ) : (
          <div className="ml-auto flex flex-wrap gap-2">
            {available.map((a) => (
              <Button
                key={a.action}
                size="sm"
                variant={a.action === "deliver" ? "primary" : a.risky ? "danger-ghost" : "secondary"}
                disabled={busy || !date}
                onClick={() => (a.risky ? setPending(a.action) : run(a.action))}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function OrdersView() {
  const { data, stats, transitionOrder } = useVault();
  const params = useSearchParams();
  const focus = params.get("commande");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [expanded, setExpanded] = useState<string | null>(focus);
  const [limit, setLimit] = useState(30);
  const [refundFor, setRefundFor] = useState<string | null>(null);
  const sellers = useMemo(() => new Map(data.sellers.map((s) => [s.id, s.name])), [data.sellers]);
  const titles = useMemo(() => new Map(data.games.map((g) => [g.id, g.normalizedTitle])), [data.games]);

  useEffect(() => {
    if (!focus) return;
    setExpanded(focus);
    const el = document.getElementById(`historique-${focus}`) ?? document.getElementById(`commande-${focus}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  const history = useMemo(() => {
    const q = normalizeTitle(query);
    return [...data.orders]
      .filter(
        (o) =>
          (!status || o.status === status) &&
          (!marketplace || o.marketplace === marketplace) &&
          (!q ||
            normalizeTitle(sellers.get(o.sellerId ?? "") ?? "").includes(q) ||
            (o.reference ?? "").toLowerCase().includes(q) ||
            o.items.some((it) => (titles.get(it.gameId) ?? "").includes(q))),
      )
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  }, [data.orders, status, marketplace, query, sellers, titles]);

  const last24 = stats.months.slice(-24);
  const marketplaces = [...new Set(data.orders.map((o) => o.marketplace))];

  return (
    <div className="animate-page space-y-8">
      <div>
        <PageHeader title="Commandes" subtitle="Suivi des achats, de la commande à la réception" />
        <StatGrid>
          <StatTile label="Dépensé au total" icon={<CoinIcon size={14} />} value={euroFmt.format(stats.spentTotal)} detail={`${intFmt.format(stats.ordersCount)} commandes`} />
          <StatTile
            label="Prix moyen par jeu"
            icon={<CartIcon size={14} />}
            value={stats.avgItemPrice !== null ? euro(stats.avgItemPrice) : "—"}
            detail="port et frais compris"
          />
          <StatTile
            label="Port et protection"
            icon={<PackageIcon size={14} />}
            value={euroFmt.format(stats.shippingTotal)}
            detail={stats.spentTotal ? `${Math.round((stats.shippingTotal / stats.spentTotal) * 100)} % des dépenses` : undefined}
          />
          <StatTile
            label="En route"
            icon={<TruckIcon size={14} />}
            value={euroFmt.format(stats.incomingAmount)}
            detail={`${stats.incomingOrders.length} commande${stats.incomingOrders.length > 1 ? "s" : ""}`}
            tone={stats.incomingOrders.length ? "accent" : "default"}
          />
        </StatGrid>
      </div>

      {stats.incomingOrders.length ? (
        <section>
          <SectionHeader title="En cours" meta={`${stats.incomingOrders.length} commande${stats.incomingOrders.length > 1 ? "s" : ""} · ${euroFmt.format(stats.incomingAmount)}`} />
          <ul className="grid gap-4 md:grid-cols-2">
            {stats.incomingOrders.map((o) => (
              <ActiveOrder key={`${o.id}:${o.status}`} order={o} />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Dépenses par mois" subtitle={`Depuis ${last24[0] ? monthLabel(last24[0].month, true) : "le début"}`} className="lg:col-span-3">
          <ColumnChart
            label="Dépenses par mois"
            data={last24.map((m) => ({
              label: monthLabel(m.month),
              title: monthLabel(m.month, true),
              value: m.spent,
              detail: `${m.orders} commande${m.orders > 1 ? "s" : ""}`,
            }))}
            format={(v) => euroFmt.format(v)}
            axisFormat={(v) => compact(v, " €")}
            highlightLast
          />
        </Card>
        <Card title="Où j’achète" subtitle="Montant par plateforme" className="lg:col-span-2">
          <BarList
            items={stats.byMarketplace.map((m) => ({
              key: m.key,
              label: <MarketplaceTag marketplace={m.key} />,
              value: m.value,
              display: `${euroFmt.format(m.value)} · ${stats.spentTotal ? Math.round((m.value / stats.spentTotal) * 100) : 0} %`,
            }))}
          />
          {stats.topSellers.length ? (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="mb-2 text-xs font-medium text-muted">Vendeurs les plus fréquents</h3>
              <ul className="space-y-1.5 text-[13px]">
                {stats.topSellers.slice(0, 5).map((s) => (
                  <li key={s.name} className="flex justify-between gap-3">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {s.orders} · {euroFmt.format(s.spent)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      </div>

      <section>
        <SectionHeader title="Historique" meta={`${intFmt.format(history.length)} commande${history.length > 1 ? "s" : ""}`} />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchField className="basis-full sm:flex-1 sm:basis-56" value={query} onChange={setQuery} placeholder="Jeu, vendeur, référence…" label="Chercher une commande" />
          <Select
            label="Plateforme"
            className="w-full sm:w-48"
            value={marketplace}
            options={marketplaces}
            labels={MARKETPLACE_LABELS}
            allowEmpty="Toutes plateformes"
            onChange={setMarketplace}
          />
        </div>
        <div className="mb-4">
          <ChipRow label="Statut">
            <Chip active={!status} onClick={() => setStatus("")}>
              Toutes
            </Chip>
            {Object.entries(STATUS_FILTERS).map(([k, label]) => (
              <Chip key={k} active={status === k} onClick={() => setStatus(status === k ? "" : k)} count={data.orders.filter((o) => o.status === k).length}>
                {label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {history.length === 0 ? (
          <EmptyState title="Aucune commande trouvée" icon={<CartIcon size={18} />}>
            Essayez un autre mot ou un autre statut.
          </EmptyState>
        ) : (
          <ul className={table.wrap}>
            {history.slice(0, limit).map((o) => {
              const isOpen = expanded === o.id;
              const first = data.games.find((g) => g.id === o.items[0]?.gameId);
              return (
                <li
                  key={o.id}
                  id={`historique-${o.id}`}
                  className={cx("border-b border-border last:border-0", focus === o.id && "bg-accent/[0.06]")}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-surface-2/60 sm:px-4"
                  >
                    <div className="w-8 shrink-0">{first ? <GameCover gameId={first.id} title={first.canonicalTitle} rounded="rounded" width={40} /> : null}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">
                        {first?.canonicalTitle ?? "—"}
                        {o.items.length > 1 ? <span className="text-muted"> + {o.items.length - 1}</span> : null}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                        <MarketplaceTag marketplace={o.marketplace} size={12} />
                        <span className="truncate">
                          {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} · {dateFr(o.orderedAt, true)}
                        </span>
                      </div>
                    </div>
                    <span className="hidden sm:block">
                      <StatusBadge status={o.status} />
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[13px] font-semibold tabular-nums">{euro(o.totalPaid)}</span>
                      <span className="sm:hidden">
                        <StatusBadge status={o.status} />
                      </span>
                    </span>
                    <ChevronDownIcon size={16} className={cx("shrink-0 text-muted transition", isOpen && "rotate-180")} />
                  </button>
                  {isOpen ? (
                    <div className="grid gap-4 border-t border-border bg-surface-2/40 px-3 py-4 sm:px-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                      <div className="min-w-0 space-y-4">
                        <OrderProgress order={o} />
                        <OrderItems order={o} />
                        {o.privateNotes ? <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-2">{o.privateNotes}</p> : null}
                      </div>
                      <div className="space-y-3">
                        <Amounts order={o} />
                        {o.reference ? <p className="text-xs text-muted">Référence {o.reference}</p> : null}
                        {o.status === "delivered" ? (
                          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                            {refundFor === o.id ? (
                              <>
                                <span role="alert" className="basis-full text-xs font-medium text-ko">
                                  Marquer remboursée aujourd’hui ? Les jeux sortent de la collection.
                                </span>
                                <Button size="sm" onClick={() => setRefundFor(null)}>
                                  Non
                                </Button>
                                <Button size="sm" variant="danger" onClick={() => transitionOrder(o.id, "refund", today()).then(() => setRefundFor(null))}>
                                  Confirmer
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="danger-ghost" onClick={() => setRefundFor(o.id)}>
                                Remboursée
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {history.length > limit ? (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setLimit((l) => l + 50)}>Afficher plus</Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
