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
import { Card, Chip, EmptyState, PageHeader, StatTile, StatusBadge } from "@/components/ui/primitives";
import { Button, Select, inputClass } from "@/components/ui/fields";
import { SearchIcon } from "@/components/icons";
import GameCover from "@/components/game/GameCover";
import { useGameDrawer } from "@/components/game/GameDrawer";
import { useVault, type OrderAction } from "@/components/vault/VaultProvider";
import { today } from "@/components/vault/model";
import { normalizeTitle } from "@/lib/normalize";

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

const dateFr = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function OrderItems({ order }: { order: Order }) {
  const { rowById } = useVault();
  const { open } = useGameDrawer();
  return (
    <ul className="space-y-1.5">
      {order.items.map((it, n) => {
        const row = rowById.get(it.gameId);
        return (
          <li key={`${it.gameId}-${n}`}>
            <button
              type="button"
              onClick={() => open(it.gameId)}
              className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left text-sm transition hover:bg-surface-2"
            >
              <div className="w-7 shrink-0">
                <GameCover gameId={it.gameId} title={row?.game.canonicalTitle ?? it.gameId} rounded="rounded" width={40} />
              </div>
              <span className="min-w-0 flex-1 truncate">{row?.game.canonicalTitle ?? it.gameId}</span>
              <span className="shrink-0 text-xs text-muted">{row?.platform?.shortName}</span>
              <span className="w-16 shrink-0 text-right tabular-nums text-muted">{euro(it.unitPrice)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Commande en cours : contenu, et les transitions disponibles à la date choisie. */
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
    <li className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <MarketplaceTag marketplace={order.marketplace} className="text-sm font-medium" />
            {seller ? <span className="text-sm text-muted">· {seller.name}</span> : null}
          </div>
          <p className="mt-1 text-xs text-muted">
            Commandée le {dateFr(order.orderedAt)}
            {order.fulfilledAt ? ` · expédiée le ${dateFr(order.fulfilledAt)}` : ""}
            {order.estimatedDeliveryAt ? ` · prévue le ${dateFr(order.estimatedDeliveryAt)}` : ""}
          </p>
        </div>
        <span className="text-lg font-semibold tabular-nums">{euro(order.totalPaid)}</span>
      </div>
      <OrderItems order={order} />
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <input className={`${inputClass} w-auto py-1.5`} type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        {pending ? (
          <>
            <span className="basis-full text-xs text-ko sm:basis-auto">
              Marquer {ACTIONS.find((a) => a.action === pending)?.label.toLowerCase()} le {dateFr(date)} ?
            </span>
            <Button onClick={() => setPending(null)}>Non</Button>
            <Button variant="danger" disabled={busy} onClick={() => run(pending)}>
              Confirmer
            </Button>
          </>
        ) : (
          available.map((a) => (
            <Button
              key={a.action}
              variant={a.action === "deliver" ? "primary" : a.risky ? "danger" : "secondary"}
              disabled={busy || !date}
              onClick={() => (a.risky ? setPending(a.action) : run(a.action))}
            >
              {a.label}
            </Button>
          ))
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
    const el = document.getElementById(`commande-${focus}`);
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
    <div className="animate-page space-y-6">
      <PageHeader title="Commandes" subtitle="Suivi des achats, de la commande à la réception" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Dépensé au total" value={euroFmt.format(stats.spentTotal)} detail={`${intFmt.format(stats.ordersCount)} commandes`} />
        <StatTile label="Prix moyen par jeu" value={stats.avgItemPrice !== null ? euro(stats.avgItemPrice) : "—"} detail="port et frais compris" />
        <StatTile label="Port et protection" value={euroFmt.format(stats.shippingTotal)} detail={stats.spentTotal ? `${Math.round((stats.shippingTotal / stats.spentTotal) * 100)} % des dépenses` : undefined} />
        <StatTile label="En route" value={euroFmt.format(stats.incomingAmount)} detail={`${stats.incomingOrders.length} commande${stats.incomingOrders.length > 1 ? "s" : ""}`} tone={stats.incomingOrders.length ? "accent" : "default"} />
      </div>

      {stats.incomingOrders.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">En cours</h2>
          <ul className="grid gap-4 lg:grid-cols-2">
            {stats.incomingOrders.map((o) => (
              <ActiveOrder key={`${o.id}:${o.status}`} order={o} />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Dépenses par mois" subtitle={`Depuis ${last24[0] ? monthLabel(last24[0].month, true) : "le début"}`} className="lg:col-span-3">
          <ColumnChart
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
              display: `${euroFmt.format(m.value)} · ${m.count} commande${m.count > 1 ? "s" : ""} · ${
                stats.spentTotal ? Math.round((m.value / stats.spentTotal) * 100) : 0
              } %`,
            }))}
          />
          {stats.topSellers.length ? (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Vendeurs les plus fréquents</h3>
              <ul className="space-y-1.5 text-sm">
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Historique</h2>
          <span className="text-sm text-muted">{intFmt.format(history.length)} commandes</span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 basis-56">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Jeu, vendeur, référence…" className={`${inputClass} pl-9`} />
          </div>
          <div className="w-44">
            <Select
              value={marketplace}
              options={marketplaces}
              labels={MARKETPLACE_LABELS}
              allowEmpty="Toutes plateformes"
              onChange={setMarketplace}
            />
          </div>
        </div>
        <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
          <Chip active={!status} onClick={() => setStatus("")}>
            Toutes
          </Chip>
          {Object.entries(STATUS_FILTERS).map(([k, label]) => (
            <Chip key={k} active={status === k} onClick={() => setStatus(status === k ? "" : k)} count={data.orders.filter((o) => o.status === k).length}>
              {label}
            </Chip>
          ))}
        </div>

        {history.length === 0 ? (
          <EmptyState title="Aucune commande trouvée" />
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border">
            {history.slice(0, limit).map((o) => {
              const open = expanded === o.id;
              const first = data.games.find((g) => g.id === o.items[0]?.gameId);
              return (
                <li key={o.id} id={`commande-${o.id}`} className={`border-b border-border last:border-0 ${focus === o.id ? "bg-accent-soft" : "bg-bg-elev"}`}>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : o.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface"
                  >
                    <div className="w-8 shrink-0">
                      {first ? <GameCover gameId={first.id} title={first.canonicalTitle} rounded="rounded-md" width={40} /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {first?.canonicalTitle ?? "—"}
                        {o.items.length > 1 ? <span className="text-muted"> + {o.items.length - 1}</span> : null}
                      </div>
                      <div className="truncate text-xs text-muted">
                        <MarketplaceTag marketplace={o.marketplace} size={12} className="align-middle" />
                        {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} · {dateFr(o.orderedAt)}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                    <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">{euro(o.totalPaid)}</span>
                  </button>
                  {open ? (
                    <div className="border-t border-border bg-surface px-4 py-3">
                      <OrderItems order={o} />
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                        {[
                          ["Articles", euro(o.itemsTotal)],
                          ["Port", euro(o.shippingCost)],
                          ["Protection", euro(o.buyerProtection)],
                          ["Référence", o.reference ?? "—"],
                          ["Reçue le", o.deliveredAt ? dateFr(o.deliveredAt) : "—"],
                          ["Annulée le", o.cancelledAt ? dateFr(o.cancelledAt) : "—"],
                          ["Remboursée le", o.refundedAt ? dateFr(o.refundedAt) : "—"],
                        ].map(([k, v]) => (
                          <div key={k} className="min-w-0">
                            <dt className="text-muted">{k}</dt>
                            <dd className="truncate">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {o.privateNotes ? <p className="mt-2 text-xs text-muted">{o.privateNotes}</p> : null}
                      {o.status === "delivered" ? (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          {refundFor === o.id ? (
                            <>
                              <span className="text-xs text-ko">Marquer remboursée aujourd’hui ? Les jeux sortent de la collection.</span>
                              <Button onClick={() => setRefundFor(null)}>Non</Button>
                              <Button variant="danger" onClick={() => transitionOrder(o.id, "refund", today()).then(() => setRefundFor(null))}>
                                Confirmer
                              </Button>
                            </>
                          ) : (
                            <Button variant="danger" onClick={() => setRefundFor(o.id)}>
                              Remboursée
                            </Button>
                          )}
                        </div>
                      ) : null}
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
