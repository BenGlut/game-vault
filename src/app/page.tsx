import Link from "next/link";
import {
  getStats,
  getChangeLog,
  getGameRows,
  getOrders,
  getQuotes,
  getOrdersByGame,
  getPlatforms,
  euro,
  POSSESSION,
  STATUS_LABELS,
  type GameRow,
} from "@/lib/data";
import { PageTitle } from "@/components/ui";
import { GameCard } from "@/components/GameCard";
import { GameDrawerProvider } from "@/components/GameDrawer";
import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { NAV_ICONS, GamepadIcon } from "@/components/icons";

/** Tuile de statistique cliquable vers la section correspondante. */
function StatTile({
  href,
  label,
  value,
  sub,
  accent,
}: {
  href: string;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  const Icon = NAV_ICONS[href] ?? GamepadIcon;
  return (
    <Link
      href={`${href}/`}
      className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        accent
          ? "border-accent/40 bg-accent-soft hover:border-accent"
          : "border-border bg-surface hover:border-accent/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        <Icon size={16} className={accent ? "text-accent" : "text-muted"} />
      </div>
      <div className={`mt-1.5 text-2xl font-bold ${accent ? "text-accent" : ""}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted">{sub}</div> : null}
    </Link>
  );
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link href={`${href}/`} className="shrink-0 text-xs text-accent hover:underline">
        {cta} →
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const stats = getStats();
  const rows = getGameRows();
  const quotes = getQuotes();
  const orders = getOrders();
  const platforms = getPlatforms();

  const owned = rows.filter((r) => r.items.some((i) => POSSESSION.includes(i.status)));
  const wishlist = rows.filter((r) => r.items.some((i) => i.status === "wishlist"));
  const inTransit = orders.filter((o) => ["ordered", "fulfilled"].includes(o.status));
  const spent = orders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + (o.totalPaid ?? 0), 0);

  // valeur de la collection à la cote médiane (CIB si connue, sinon loose)
  let collectionValue = 0;
  for (const r of owned) {
    const q = quotes[r.game.id];
    const median = q?.cib?.median ?? q?.loose?.median ?? 0;
    collectionValue += median * r.items.filter((i) => POSSESSION.includes(i.status)).length;
  }

  const needsReview = rows.filter((r) =>
    r.items.some((i) => i.verificationStatus === "needs_review"),
  );
  const duplicates = owned.filter(
    (r) => r.items.filter((i) => POSSESSION.includes(i.status)).length > 1,
  );

  // jeux les plus valorisés de la collection
  const topValue = [...owned]
    .map((r) => ({ row: r, median: quotes[r.game.id]?.cib?.median ?? quotes[r.game.id]?.loose?.median ?? 0 }))
    .filter((x) => x.median > 0)
    .sort((a, b) => b.median - a.median)
    .slice(0, 6);

  const topWishlist = [...wishlist]
    .filter((r) => r.game.buyPriority === "haute")
    .sort((a, b) => (a.game.qualityTier ?? "Z").localeCompare(b.game.qualityTier ?? "Z"))
    .slice(0, 6);

  const platformCounts = Object.entries(stats.byPlatform)
    .map(([id, n]) => ({
      id,
      n: n as number,
      shortName: platforms.find((p) => p.id === id)?.shortName ?? id.toUpperCase(),
    }))
    .sort((a, b) => b.n - a.n);

  const log = getChangeLog().slice(-5).reverse();

  const gameById = new Map<string, GameRow>(rows.map((r) => [r.game.id, r]));

  return (
    <GameDrawerProvider quotes={quotes} orders={getOrdersByGame()}>
      <PageTitle
        title="Tableau de bord"
        sub={`Collection à jour au ${new Date(stats.generatedAt).toLocaleDateString("fr-FR")}`}
      />

      {/* chiffres clés */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          href="/collection"
          label="Jeux possédés"
          value={String(owned.length)}
          sub={`${stats.ownedItems} exemplaires en stock`}
        />
        <StatTile
          href="/valeur"
          label="Valeur estimée"
          value={collectionValue ? euro(collectionValue) : "—"}
          sub={spent ? `${euro(spent)} dépensés en achats suivis` : "cote médiane"}
          accent
        />
        <StatTile
          href="/commandes"
          label="En transit"
          value={euro(inTransit.reduce((n, o) => n + (o.totalPaid ?? 0), 0))}
          sub={`${inTransit.length} commandes, ${inTransit.reduce((n, o) => n + o.itemCount, 0)} articles`}
        />
        <StatTile
          href="/wishlist"
          label="Wishlist"
          value={String(wishlist.length)}
          sub={`${wishlist.filter((r) => r.game.buyPriority === "haute").length} en priorité haute`}
        />
      </div>

      {/* commandes en attente */}
      {inTransit.length > 0 ? (
        <section className="mt-8">
          <SectionHeader title="Commandes en attente" href="/commandes" cta="Toutes les commandes" />
          <p className="-mt-2 mb-3 text-xs text-muted">
            {euro(inTransit.reduce((n, o) => n + (o.totalPaid ?? 0), 0))} immobilisés —{" "}
            {inTransit.filter((o) => o.status === "fulfilled").length} en acheminement,{" "}
            {inTransit.filter((o) => o.status === "ordered").length} encore chez le vendeur
          </p>
          <div className="space-y-2">
            {inTransit.map((o) => (
              <Link
                key={o.id}
                href="/commandes/"
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-accent/40"
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.status === "fulfilled"
                      ? "bg-[#60a5fa25] text-[#93c5fd]"
                      : "bg-[#60a5fa25] text-[#60a5fa]"
                  }`}
                >
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>
                <span className="text-sm capitalize">{o.marketplace}</span>
                <span className="text-sm text-muted">
                  {o.itemCount} article{o.itemCount > 1 ? "s" : ""}
                </span>
                <span className="hidden text-xs text-muted sm:inline">
                  commandé le {o.orderedAt}
                  {o.fulfilledAt ? ` · expédié le ${o.fulfilledAt}` : ""}
                </span>
                <div className="ml-auto flex items-center gap-3 text-xs text-muted">
                  {o.estimatedDeliveryAt ? (
                    <span className="text-accent">livraison ~{o.estimatedDeliveryAt}</span>
                  ) : (
                    <span>commandé le {o.orderedAt}</span>
                  )}
                  {o.totalPaid !== null ? (
                    <span className="font-mono text-text">{euro(o.totalPaid)}</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* à chasser */}
        {topWishlist.length > 0 ? (
          <section>
            <SectionHeader title="À chasser en priorité" href="/recommandations" cta="Toutes les recommandations" />
            <div className="grid grid-cols-3 gap-3">
              {topWishlist.map((r) => (
                <GameCard
                  key={r.game.id}
                  game={r.game}
                  platform={r.platform}
                  coverUrl={r.coverUrl}
                  items={r.items}
                  showStatus={false}
                  footer={(() => {
                    const q = quotes[r.game.id];
                    const m = q?.cib?.median ?? q?.loose?.median;
                    return m ? `cote ${euro(m)}` : "cote à saisir";
                  })()}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* pièces les plus valorisées */}
        {topValue.length > 0 ? (
          <section>
            <SectionHeader title="Pièces les plus valorisées" href="/valeur" cta="Voir la valeur" />
            <div className="grid grid-cols-3 gap-3">
              {topValue.map(({ row, median }) => (
                <GameCard
                  key={row.game.id}
                  game={row.game}
                  platform={row.platform}
                  coverUrl={row.coverUrl}
                  items={row.items}
                  showStatus={false}
                  footer={<span className="font-mono text-accent">{euro(median)}</span>}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* répartition + à faire */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionHeader title="Par plateforme" href="/plateformes" cta="Toutes les plateformes" />
          <div className="space-y-1.5">
            {platformCounts.map(({ id, n, shortName }) => {
              const Icon = CONSOLE_ICONS[id];
              const max = platformCounts[0]?.n ?? 1;
              return (
                <Link
                  key={id}
                  href={`/collection/?plateforme=${id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition hover:border-accent/40"
                >
                  <span className="w-6 shrink-0 text-muted">
                    {Icon ? <Icon size={22} /> : <GamepadIcon size={16} />}
                  </span>
                  <span className="w-16 shrink-0 text-sm">{shortName}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-accent/70"
                      style={{ width: `${Math.round((n / max) * 100)}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right font-mono text-sm text-accent">{n}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">À faire</h2>
          <div className="space-y-2">
            <Link
              href="/collection/?verif=needs_review"
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-accent/40"
            >
              <span className="text-sm">Fiches à vérifier physiquement</span>
              <span className="font-mono text-sm text-accent">{needsReview.length}</span>
            </Link>
            <Link
              href="/doublons/"
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-accent/40"
            >
              <span className="text-sm">Doublons en stock</span>
              <span className="font-mono text-sm text-accent">{duplicates.length}</span>
            </Link>
            <Link
              href="/valeur/"
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-accent/40"
            >
              <span className="text-sm">Jeux possédés sans cote</span>
              <span className="font-mono text-sm text-accent">
                {owned.filter((r) => !quotes[r.game.id]).length}
              </span>
            </Link>
            <Link
              href="/estimateur/"
              className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 transition hover:border-accent"
            >
              <span className="text-sm text-accent">Estimer une annonce Vinted</span>
              <span className="text-accent">→</span>
            </Link>
          </div>

          <h2 className="mb-3 mt-6 text-lg font-semibold">Dernières modifications</h2>
          <div className="space-y-1.5">
            {log.map((entry, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-surface px-3 py-2">
                <div className="line-clamp-2 text-xs">{entry.message}</div>
                <div className="mt-0.5 text-[11px] text-muted">
                  <span className="font-mono">{entry.command}</span> ·{" "}
                  {new Date(entry.at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ))}
            <Link href="/historique/" className="block pt-1 text-xs text-accent hover:underline">
              Tout l&apos;historique →
            </Link>
          </div>
        </section>
      </div>

      {/* les derniers arrivés */}
      {(() => {
        const recent = [...owned]
          .filter((r) => r.items.some((i) => i.acquiredAt))
          .sort((a, b) => {
            const da = a.items.map((i) => i.acquiredAt ?? "").sort().pop() ?? "";
            const db = b.items.map((i) => i.acquiredAt ?? "").sort().pop() ?? "";
            return db.localeCompare(da);
          })
          .slice(0, 8);
        if (!recent.length) return null;
        return (
          <section className="mt-8">
            <SectionHeader title="Derniers arrivés" href="/collection" cta="Toute la collection" />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {recent.map((r) => (
                <GameCard
                  key={r.game.id}
                  game={r.game}
                  platform={r.platform}
                  coverUrl={r.coverUrl}
                  items={r.items}
                  footer={r.items.find((i) => i.acquiredAt)?.acquiredAt ?? undefined}
                />
              ))}
            </div>
          </section>
        );
      })()}

      {gameById.size === 0 ? <p className="mt-8 text-sm text-muted">Collection vide.</p> : null}
    </GameDrawerProvider>
  );
}
