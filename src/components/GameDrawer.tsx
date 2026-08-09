"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import type { Game, Platform, GameQuotes } from "@/lib/schema";
import { STATUS_LABELS, CONDITION_LABELS, COMPLETENESS_LABELS, euro, POSSESSION } from "@/lib/labels";
import { TIER_COLORS, STATUS_COLORS } from "@/components/GameCard";

export interface DrawerItem {
  id: string;
  status: string;
  quantity?: number;
  condition?: string;
  completeness?: string;
  verificationStatus?: string;
  acquiredAt?: string | null;
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
}: {
  children: React.ReactNode;
  quotes?: Record<string, GameQuotes>;
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [row, close]);

  const q = row ? quotes[row.game.id] : undefined;
  const owned = row?.items.filter((i) => POSSESSION.includes(i.status)) ?? [];

  return (
    <Ctx.Provider value={{ open, enabled: true }}>
      {children}

      {row ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={row.game.canonicalTitle}>
          <button
            type="button"
            aria-label="Fermer"
            onClick={close}
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-250 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-border-strong bg-bg-elev shadow-2xl transition-transform duration-300 ease-out ${
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
              <div className="relative flex items-start gap-4 p-5">
                {row.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.coverUrl}
                    alt={`Jaquette de ${row.game.canonicalTitle}`}
                    className="w-28 shrink-0 rounded-xl border border-border-strong shadow-2xl"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-28 shrink-0 items-center justify-center rounded-xl bg-surface-2 px-2 text-center text-xs text-muted">
                    pas de jaquette
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {row.game.qualityTier ? (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded font-mono text-xs font-bold ${TIER_COLORS[row.game.qualityTier] ?? ""}`}
                      >
                        {row.game.qualityTier}
                      </span>
                    ) : null}
                    {row.items.map((i) => (
                      <span
                        key={i.id}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_COLORS[i.status] ?? "bg-surface-2 text-muted ring-border"}`}
                      >
                        {STATUS_LABELS[i.status] ?? i.status}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold leading-tight">{row.game.canonicalTitle}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {row.platform?.name ?? row.game.platformId} · {row.game.region}
                    {row.game.franchise ? ` · ${row.game.franchise}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Fermer le panneau"
                  className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4 px-5 pb-6">
              {/* exemplaires : le modèle ERP donne une ligne par article */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {row.items.length > 1 ? `${row.items.length} exemplaires` : "Exemplaire"}
                </h3>
                <div className="space-y-2">
                  {row.items.map((i) => (
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
                    </div>
                  ))}
                  {row.items.length === 0 ? (
                    <p className="text-sm text-muted">Aucun exemplaire en stock.</p>
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
                </section>
              ) : (
                <p className="text-xs text-muted">Pas encore de cote pour ce jeu.</p>
              )}

              <Link
                href={`/jeu/${row.game.id}/`}
                className="block rounded-xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-center text-sm font-medium text-accent transition hover:bg-accent/20"
              >
                Ouvrir la fiche complète
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
