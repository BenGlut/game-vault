"use client";

import Link from "next/link";
import { useState } from "react";
import type { Game } from "@/lib/schema";
import { euro } from "@/lib/labels";
import { isOwned } from "@/lib/collection";
import { MARKETPLACE_LABELS } from "@/lib/stats";
import MiniEstimator from "@/components/MiniEstimator";
import { StatusBadge, TierBadge, PriorityBadge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/fields";
import { useVault } from "@/components/vault/VaultProvider";
import GameCover from "./GameCover";
import GameSheet from "./GameSheet";
import InventoryEditor from "./InventoryEditor";

const ARCHIVED = ["cancelled", "refunded", "sold"];

function searchText(s: string): string {
  return s.replace(/[:–—_/]+/g, " ").replace(/\s+/g, " ").trim();
}

/** MobyGames connaît le titre anglais : premier alias sans accent, sinon le titre. */
function englishTitle(game: Game): string {
  return game.aliases.find((a) => !/[À-ÿ]/.test(a) && a !== game.canonicalTitle) ?? game.canonicalTitle;
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Contenu complet d'un jeu : partagé par le panneau latéral et la page /jeu. */
export default function GameDetail({ gameId, onNavigate }: { gameId: string; onNavigate?: () => void }) {
  const { rowById, data, addItem } = useVault();
  const [busy, setBusy] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const row = rowById.get(gameId);
  if (!row) return <p className="p-6 text-sm text-muted">Ce jeu n’existe plus dans la base.</p>;
  const { game, platform, quotes } = row;

  const active = row.items.filter((i) => !ARCHIVED.includes(i.status));
  const archived = row.items.filter((i) => ARCHIVED.includes(i.status));
  const hasWishlist = row.items.some((i) => i.status === "wishlist");
  const statuses = [...new Set(active.map((i) => i.status))];
  const orders = data.orders
    .filter((o) => o.items.some((it) => it.gameId === game.id))
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const sellers = new Map(data.sellers.map((s) => [s.id, s.name]));
  const ownedPaid = row.items.filter(isOwned).reduce((s, i) => s + (i.purchasePrice?.amount ?? 0), 0);
  const gain = row.value !== null && ownedPaid > 0 ? row.value - ownedPaid : null;

  async function add(status: "wishlist" | "owned") {
    setBusy(true);
    await addItem(game.id, status);
    setBusy(false);
  }

  const orderLabel = (orderId: string | null) => {
    const o = orderId ? data.orders.find((x) => x.id === orderId) : undefined;
    if (!o) return undefined;
    const seller = o.sellerId ? sellers.get(o.sellerId) : null;
    return `${MARKETPLACE_LABELS[o.marketplace] ?? o.marketplace}${seller ? ` · ${seller}` : ""} · commandé le ${new Date(
      `${o.orderedAt}T12:00:00`,
    ).toLocaleDateString("fr-FR")}`;
  };

  return (
    <div>
      {/* en-tête : jaquette nette sur fond flouté */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 scale-125 opacity-35 blur-3xl" aria-hidden>
          <GameCover gameId={game.id} title={game.canonicalTitle} rounded="rounded-none" className="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-elev/40 via-bg-elev/80 to-bg-elev" aria-hidden />
        <div className="relative flex gap-4 px-5 pb-5 pt-6">
          <div className="w-28 shrink-0 sm:w-32">
            <GameCover gameId={game.id} title={game.canonicalTitle} className="shadow-[0_20px_45px_-15px_rgba(0,0,0,0.9)] ring-1 ring-border-strong" />
          </div>
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <TierBadge tier={game.qualityTier} />
              {statuses.map((s) => (
                <StatusBadge key={s} status={s} count={active.filter((i) => i.status === s).length} />
              ))}
              <PriorityBadge priority={row.state === "wanted" ? game.buyPriority : null} />
            </div>
            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight">{game.canonicalTitle}</h2>
            <p className="mt-1 text-xs text-muted">
              {platform?.name ?? game.platformId}
              {game.releaseYear ? ` · ${game.releaseYear}` : ""}
              {game.edition ? ` · ${game.edition}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <a
                href={`https://www.vinted.fr/catalog?search_text=${encodeURIComponent(searchText(`${game.canonicalTitle} ${platform?.shortName ?? ""}`))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-surface/80 px-2.5 py-1 text-xs transition hover:border-accent/50 hover:text-accent"
              >
                Vinted ↗
              </a>
              <a
                href={`https://www.mobygames.com/search/?q=${encodeURIComponent(searchText(englishTitle(game)))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-surface/80 px-2.5 py-1 text-xs transition hover:border-accent/50 hover:text-accent"
              >
                Notes et fiche ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pb-8">
        {/* valeur en un coup d'œil */}
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Cote boîte", quotes?.cib ? euro(quotes.cib.median) : "—"],
            ["Payé", ownedPaid > 0 ? euro(ownedPaid) : "—"],
            ["Plus-value", gain === null ? "—" : `${gain >= 0 ? "+" : ""}${euro(gain)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="text-[11px] text-muted">{label}</div>
              <div
                className={`mt-0.5 text-sm font-semibold tabular-nums ${
                  label === "Plus-value" && gain !== null ? (gain >= 0 ? "text-ok" : "text-ko") : ""
                }`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <Section
          title={active.length > 1 ? `${active.length} lignes` : "Exemplaire"}
          aside={
            <div className="flex gap-1.5">
              {!hasWishlist && row.state !== "owned" && row.state !== "incoming" ? (
                <Button disabled={busy} onClick={() => add("wishlist")}>
                  + Wishlist
                </Button>
              ) : null}
              <Button disabled={busy} onClick={() => add("owned")}>
                + Exemplaire
              </Button>
            </div>
          }
        >
          <div className="space-y-2">
            {active.map((i) => (
              <InventoryEditor key={i.id} item={i} orderLabel={orderLabel(i.orderId)} />
            ))}
            {active.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted">
                Ni possédé ni en wishlist : seulement au catalogue.
              </p>
            ) : null}
            {archived.length ? (
              <button type="button" onClick={() => setShowArchive((v) => !v)} className="text-xs text-muted transition hover:text-text">
                {showArchive ? "Masquer" : "Afficher"} {archived.length} ligne{archived.length > 1 ? "s" : ""} archivée
                {archived.length > 1 ? "s" : ""} (annulée, remboursée, vendue)
              </button>
            ) : null}
            {showArchive ? archived.map((i) => <InventoryEditor key={i.id} item={i} orderLabel={orderLabel(i.orderId)} />) : null}
          </div>
        </Section>

        <Section title="Cotes">
          <div className="overflow-hidden rounded-xl border border-border">
            {(
              [
                ["En boîte", quotes?.cib],
                ["Loose", quotes?.loose],
              ] as const
            ).map(([label, q]) => (
              <div key={label} className="flex items-center justify-between border-b border-border bg-surface px-3 py-2.5 text-sm last:border-0">
                <span className="text-muted">{label}</span>
                {q ? (
                  <span className="tabular-nums">
                    <span className="text-xs text-muted">{euro(q.low)} – </span>
                    <span className="font-semibold">{euro(q.median)}</span>
                    <span className="text-xs text-muted"> – {euro(q.high)}</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted">pas de cote</span>
                )}
              </div>
            ))}
          </div>
          {quotes?.cib || quotes?.loose ? (
            <>
              <p className="mt-1.5 text-[11px] text-muted">
                Source {(quotes.cib ?? quotes.loose)?.source}, relevé du {(quotes.cib ?? quotes.loose)?.observedAt}
              </p>
              <MiniEstimator quotes={quotes} />
            </>
          ) : null}
        </Section>

        <Section title="Commandes">
          {orders.length ? (
            <div className="space-y-1.5">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/commandes/?commande=${o.id}`}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs transition hover:border-accent/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="truncate text-muted">
                      {MARKETPLACE_LABELS[o.marketplace] ?? o.marketplace}
                      {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} · {o.orderedAt}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{euro(o.totalPaid)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">Aucune commande pour ce jeu.</p>
          )}
        </Section>

        <Section title="Fiche du jeu">
          <GameSheet key={JSON.stringify(game)} game={game} platform={platform} />
        </Section>
      </div>
    </div>
  );
}
