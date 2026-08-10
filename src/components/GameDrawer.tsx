"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import type { Game, Platform, GameQuotes } from "@/lib/schema";
import { STATUS_LABELS, CONDITION_LABELS, COMPLETENESS_LABELS, euro, POSSESSION } from "@/lib/labels";
import { TIER_COLORS, STATUS_COLORS } from "@/components/GameCard";
import MiniEstimator from "@/components/MiniEstimator";

export interface DrawerOrder {
  id: string;
  status: string;
  marketplace: string;
  orderedAt: string;
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
  totalPaid: number | null;
}

export interface DrawerItem {
  id: string;
  status: string;
  quantity?: number;
  condition?: string;
  completeness?: string;
  verificationStatus?: string;
  acquiredAt?: string | null;
  orderId?: string | null;
  currentEstimate?: { low: number; median: number; high: number } | null;
}

export interface DrawerGame {
  game: Game;
  platform?: Platform;
  coverUrl: string | null;
  items: DrawerItem[];
}

interface DrawerCtx {
  open: (row: DrawerGame) => void;
  enabled: boolean;
}

const Ctx = createContext<DrawerCtx>({ open: () => {}, enabled: false });

/** Permet aux cartes d'ouvrir le panneau ; sans provider, elles restent de simples liens. */
export function useGameDrawer(): DrawerCtx {
  return useContext(Ctx);
}

/**
 * Panneau latéral : la fiche glisse depuis la droite sans quitter la page en cours,
 * pour enchaîner les consultations sans perdre ses filtres.
 */
export function GameDrawerProvider({
  children,
  quotes = {},
  orders = {},
}: {
  children: React.ReactNode;
  quotes?: Record<string, GameQuotes>;
  /** commandes liées, indexées par identifiant de jeu */
  orders?: Record<string, DrawerOrder[]>;
}) {
  const [row, setRow] = useState<DrawerGame | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback((r: DrawerGame) => {
    setRow(r);
    // laisse un frame au navigateur pour jouer la transition d'entrée
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => setRow(null), 250);
  }, []);

  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [row, close]);

  const q = row ? quotes[row.game.id] : undefined;
  const owned = row?.items.filter((i) => POSSESSION.includes(i.status)) ?? [];
  // une commande annulée ou remboursée n'est pas du stock : on l'archive
  const ARCHIVED = ["cancelled", "refunded"];
  const active = row?.items.filter((i) => !ARCHIVED.includes(i.status)) ?? [];
  const archived = row?.items.filter((i) => ARCHIVED.includes(i.status)) ?? [];

  return (
    <Ctx.Provider value={{ open, enabled: true }}>
      {children}

      {row ? (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          role="dialog"
          aria-label={row.game.canonicalTitle}
        >
          <aside
            className={`pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-border-strong bg-bg-elev shadow-[-25px_0_60px_-15px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* en-tête visuel */}
            <div className="relative">
              {row.coverUrl ? (
                <div className="absolute inset-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.coverUrl}
                    alt=""
                    aria-hidden
                    className="h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-bg-elev/50 to-bg-elev" />
                </div>
              ) : null}
              <button
                type="button"
                onClick={close}
                aria-label="Fermer le panneau"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* la jaquette est l'élément principal : plein cadre, rien à côté */}
              <div className="relative px-6 pb-4 pt-8">
                {row.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.coverUrl}
                    alt={`Jaquette de ${row.game.canonicalTitle}`}
                    className="mx-auto w-full max-w-[260px] rounded-2xl border border-border-strong shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <div className="mx-auto flex aspect-[3/4] w-full max-w-[260px] items-center justify-center rounded-2xl bg-surface-2 px-4 text-center text-sm text-muted">
                    pas de jaquette
                  </div>
                )}

                <div className="mt-5 text-center">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5">
                    {row.game.qualityTier ? (
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${TIER_COLORS[row.game.qualityTier] ?? ""}`}
                      >
                        {row.game.qualityTier}
                      </span>
                    ) : null}
                    {/* un badge par statut distinct, avec le nombre s'il y en a plusieurs */}
                    {[...new Set(row.items.map((i) => i.status))].map((st) => {
                      const n = row.items.filter((i) => i.status === st).length;
                      return (
                        <span
                          key={st}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_COLORS[st] ?? "bg-surface-2 text-muted ring-border"}`}
                        >
                          {STATUS_LABELS[st] ?? st}
                          {n > 1 ? ` ×${n}` : ""}
                        </span>
                      );
                    })}
                  </div>
                  <h2 className="text-xl font-bold leading-tight">{row.game.canonicalTitle}</h2>
                  <p className="mt-1.5 text-xs text-muted">
                    {row.platform?.name ?? row.game.platformId} · {row.game.region}
                    {row.game.franchise ? ` · ${row.game.franchise}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 pb-6">
              {/* exemplaires : le modèle ERP donne une ligne par article */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {active.length > 1 ? `${active.length} exemplaires` : "Exemplaire"}
                </h3>
                <div className="space-y-2">
                  {active.map((i) => (
                    <div key={i.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[i.status] ?? "bg-surface-2 text-muted ring-border"}`}
                        >
                          {STATUS_LABELS[i.status] ?? i.status}
                        </span>
                        <span className="text-xs text-muted">
                          {i.verificationStatus === "verified" ? "✓ vérifié" : "à vérifier"}
                        </span>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <dt className="text-muted">État</dt>
                        <dd className="text-right">{CONDITION_LABELS[i.condition ?? "unknown"]}</dd>
                        <dt className="text-muted">Complétude</dt>
                        <dd className="text-right">{COMPLETENESS_LABELS[i.completeness ?? "unknown"]}</dd>
                        {i.acquiredAt ? (
                          <>
                            <dt className="text-muted">Acquis le</dt>
                            <dd className="text-right">{i.acquiredAt}</dd>
                          </>
                        ) : null}
                      </dl>
                      {(() => {
                        // remonter à la commande d'origine de cet exemplaire précis
                        const o = i.orderId
                          ? orders[row.game.id]?.find((x) => x.id === i.orderId)
                          : undefined;
                        if (!o) return null;
                        return (
                          <Link
                            href={`/commandes/#${o.id}`}
                            className="mt-2 flex items-center justify-between rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs transition hover:bg-accent-soft hover:text-accent"
                          >
                            <span className="capitalize">
                              {o.marketplace} · {o.orderedAt}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {o.totalPaid !== null ? (
                                <span className="font-mono">{euro(o.totalPaid)}</span>
                              ) : null}
                              <span aria-hidden>→</span>
                            </span>
                          </Link>
                        );
                      })()}
                    </div>
                  ))}
                  {active.length === 0 ? (
                    <p className="text-sm text-muted">Aucun exemplaire en stock.</p>
                  ) : null}
                  {archived.length ? (
                    <p className="pt-1 text-[11px] text-muted">
                      {archived.length} exemplaire{archived.length > 1 ? "s" : ""} annulé
                      {archived.length > 1 ? "s" : ""} ou remboursé{archived.length > 1 ? "s" : ""},
                      conservé{archived.length > 1 ? "s" : ""} dans l&apos;historique des commandes.
                    </p>
                  ) : null}
                </div>
              </section>

              {/* cotes */}
              {q?.cib || q?.loose ? (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Cotes (basse / médiane / haute)
                  </h3>
                  <div className="space-y-1.5">
                    {q.cib ? (
                      <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                        <span>Avec boîte</span>
                        <span className="font-mono text-xs">
                          {euro(q.cib.low)} · <span className="text-accent">{euro(q.cib.median)}</span> ·{" "}
                          {euro(q.cib.high)}
                        </span>
                      </div>
                    ) : null}
                    {q.loose ? (
                      <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                        <span>Cartouche seule</span>
                        <span className="font-mono text-xs">
                          {euro(q.loose.low)} ·{" "}
                          <span className="text-accent">{euro(q.loose.median)}</span> ·{" "}
                          {euro(q.loose.high)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {owned.length > 1 && q.cib ? (
                    <p className="mt-2 text-xs text-muted">
                      {owned.length} exemplaires possédés ≈ {euro(q.cib.median * owned.length)} à la
                      médiane.
                    </p>
                  ) : null}
                  <MiniEstimator quotes={q} />
                </section>
              ) : (
                <p className="text-xs text-muted">Pas encore de cote pour ce jeu.</p>
              )}

              {/* commandes liées */}
              {orders[row.game.id]?.length ? (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Commandes
                  </h3>
                  <div className="space-y-1.5">
                    {orders[row.game.id]!.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs"
                      >
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${STATUS_COLORS[o.status] ?? "bg-surface-2 text-muted ring-border"}`}
                        >
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                        <span className="text-muted">
                          {o.marketplace} · {o.orderedAt}
                          {o.estimatedDeliveryAt && !o.deliveredAt
                            ? ` · livraison ~${o.estimatedDeliveryAt}`
                            : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* fiche du jeu (référence produit) */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Fiche du jeu
                </h3>
                <dl className="rounded-xl border border-border bg-surface px-3 py-2 text-xs">
                  {(
                    [
                      ["Plateforme", row.platform?.name ?? row.game.platformId],
                      ["Région", row.game.region],
                      ["Langues", row.game.languages.join(", ") || "—"],
                      ["Franchise", row.game.franchise ?? "—"],
                      ["Éditeur", row.game.publisher ?? "—"],
                      ["Développeur", row.game.developer ?? "—"],
                      ["Année", row.game.releaseYear ? String(row.game.releaseYear) : "—"],
                      ["Édition", row.game.edition ?? "—"],
                      ["Support", row.game.mediaType],
                      ["Qualité", row.game.qualityTier ?? "—"],
                      ["Priorité d'achat", row.game.buyPriority ?? "—"],
                      ["EAN", row.game.externalIds?.ean ?? "—"],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-border py-1.5 last:border-0"
                    >
                      <dt className="text-muted">{label}</dt>
                      <dd className="text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
                {row.game.aliases.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {row.game.aliases.map((a) => (
                      <span key={a} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-[11px] text-muted">
                  <code className="font-mono">{row.game.id}</code>
                </p>
              </section>

              <Link
                href={`/jeu/${row.game.id}/`}
                className="block rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-xs text-muted transition hover:border-accent/40 hover:text-accent"
              >
                Ouvrir en pleine page ↗
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
