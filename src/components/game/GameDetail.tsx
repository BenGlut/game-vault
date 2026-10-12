"use client";

import Link from "next/link";
import { useState } from "react";
import type { Game } from "@/lib/schema";
import { euro } from "@/lib/labels";
import { isOwned } from "@/lib/collection";
import { MARKETPLACE_LABELS } from "@/lib/stats";
import BrandLogo, { MarketplaceTag } from "@/components/BrandLogos";
import MiniEstimator from "@/components/MiniEstimator";
import { ChevronDownIcon, ChevronRightIcon, ExternalIcon, PlusIcon, StarIcon } from "@/components/icons";
import { Button, StatusBadge, TierBadge, PriorityBadge, cx } from "@/components/ui/primitives";
import { useVault } from "@/components/vault/VaultProvider";
import { coverUrl } from "@/components/vault/model";
import CoverHero from "./CoverHero";
import { useCoverSource } from "./coverSources";
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

/** Recherches prêtes à l'emploi chez les marchands de référence. */
export function shopLinks(title: string, platform: string, english = title): { brand: string; label: string; href: string }[] {
  const q = searchText(`${title} ${platform}`);
  return [
    { brand: "vinted", label: "Vinted", href: `https://www.vinted.fr/catalog?search_text=${encodeURIComponent(q)}` },
    {
      brand: "micromania",
      label: "Micromania",
      href: `https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=${encodeURIComponent(searchText(title))}`,
    },
    { brand: "amazon", label: "Amazon", href: `https://www.amazon.fr/s?k=${encodeURIComponent(q)}&i=videogames` },
    { brand: "moby", label: "Avis", href: `https://www.mobygames.com/search/?q=${encodeURIComponent(searchText(english))}` },
  ];
}

/** Liens marchands côte à côte (règle de comparaison : Vinted, Micromania occasion, Amazon neuf). */
export function ShopLinks({ links }: { links: { brand: string; label: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {links.map((l) => (
        <a
          key={l.brand}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-text-2 shadow-[var(--shadow-sm)] transition hover:border-border-strong hover:text-text"
        >
          {l.brand !== "moby" ? <BrandLogo brand={l.brand} size={14} /> : <StarIcon size={13} className="text-muted" />}
          {l.label}
          <ExternalIcon size={12} className="text-muted" />
          <span className="sr-only">(nouvel onglet)</span>
        </a>
      ))}
    </div>
  );
}

export function PanelSection({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex min-h-7 items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold">{title}</h3>
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
  const source = useCoverSource(gameId);
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

  const figures: { label: string; value: string; tone?: "ok" | "ko" }[] = [
    { label: "Cote en boîte", value: quotes?.cib ? euro(quotes.cib.median) : "—" },
    { label: "Payé", value: ownedPaid > 0 ? euro(ownedPaid) : "—" },
    { label: "Plus-value", value: gain === null ? "—" : `${gain >= 0 ? "+" : ""}${euro(gain)}`, tone: gain === null ? undefined : gain >= 0 ? "ok" : "ko" },
  ];

  return (
    <div>
      {/* en-tête pensé par console : proportions, teinte et type de boîte */}
      <CoverHero
        platformId={game.platformId}
        platformName={platform?.name ?? game.platformId}
        src={source?.u}
        fallback={coverUrl(game.id)}
        title={game.canonicalTitle}
        square={source?.sq}
      />
      <div className="px-5 pb-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <TierBadge tier={game.qualityTier} />
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} count={active.filter((i) => i.status === s).length} />
          ))}
          <PriorityBadge priority={row.state === "wanted" ? game.buyPriority : null} />
        </div>
        <h2 className="mt-2.5 text-xl font-semibold leading-tight tracking-[-0.02em]">{game.canonicalTitle}</h2>
        <p className="mt-1 text-[13px] text-muted">
          {platform?.name ?? game.platformId}
          {game.releaseYear ? ` · ${game.releaseYear}` : ""}
          {game.edition ? ` · ${game.edition}` : ""}
        </p>
        <div className="mt-4">
          <ShopLinks links={shopLinks(game.canonicalTitle, platform?.shortName ?? "", englishTitle(game))} />
        </div>
      </div>

      <div className="space-y-7 px-5 pb-10">
        {/* valeur en un coup d'œil */}
        <dl className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          {figures.map((f) => (
            <div key={f.label} className="px-3 py-3 text-center">
              <dt className="text-[11px] font-medium text-muted">{f.label}</dt>
              <dd className={cx("mt-1 text-[15px] font-semibold tabular-nums", f.tone === "ok" && "text-ok", f.tone === "ko" && "text-ko")}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <PanelSection
          title={active.length > 1 ? `${active.length} exemplaires et lignes` : "Exemplaire"}
          aside={
            <div className="flex gap-1.5">
              {!hasWishlist && row.state !== "owned" && row.state !== "incoming" ? (
                <Button size="sm" disabled={busy} icon={<StarIcon size={13} />} onClick={() => add("wishlist")}>
                  Wishlist
                </Button>
              ) : null}
              <Button size="sm" disabled={busy} icon={<PlusIcon size={13} />} onClick={() => add("owned")}>
                Exemplaire
              </Button>
            </div>
          }
        >
          <div className="space-y-2">
            {active.map((i) => (
              <InventoryEditor key={i.id} item={i} orderLabel={orderLabel(i.orderId)} />
            ))}
            {active.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-strong px-3 py-3 text-[13px] text-muted">Ni possédé ni en wishlist : seulement au catalogue.</p>
            ) : null}
            {archived.length ? (
              <button
                type="button"
                onClick={() => setShowArchive((v) => !v)}
                aria-expanded={showArchive}
                className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-muted transition hover:text-text"
              >
                <ChevronDownIcon size={14} className={cx("transition", showArchive && "rotate-180")} />
                {showArchive ? "Masquer" : "Afficher"} {archived.length} ligne{archived.length > 1 ? "s" : ""} archivée{archived.length > 1 ? "s" : ""} (annulée,
                remboursée, vendue)
              </button>
            ) : null}
            {showArchive ? archived.map((i) => <InventoryEditor key={i.id} item={i} orderLabel={orderLabel(i.orderId)} />) : null}
          </div>
        </PanelSection>

        <PanelSection title="Cotes">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {(
              [
                ["En boîte", quotes?.cib],
                ["Loose", quotes?.loose],
              ] as const
            ).map(([label, q]) => (
              <div key={label} className="flex items-center justify-between border-b border-border px-3.5 py-2.5 text-[13px] last:border-0">
                <span className="text-text-2">{label}</span>
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
        </PanelSection>

        <PanelSection title="Commandes">
          {orders.length ? (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/commandes/?commande=${o.id}`}
                  onClick={onNavigate}
                  className="group flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5 text-xs transition last:border-0 hover:bg-surface-2/60"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusBadge status={o.status} />
                    <span className="truncate text-muted">
                      <MarketplaceTag marketplace={o.marketplace} size={12} className="align-middle" />
                      {o.sellerId && sellers.get(o.sellerId) ? ` · ${sellers.get(o.sellerId)}` : ""} ·{" "}
                      {new Date(`${o.orderedAt}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums">
                    {euro(o.totalPaid)}
                    <ChevronRightIcon size={14} className="text-muted transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">Aucune commande pour ce jeu.</p>
          )}
        </PanelSection>

        <PanelSection title="Fiche du jeu">
          <GameSheet key={JSON.stringify(game)} game={game} platform={platform} />
        </PanelSection>
      </div>
    </div>
  );
}
