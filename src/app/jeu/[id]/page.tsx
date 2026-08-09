import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGames,
  getInventory,
  getOrders,
  getPlatforms,
  euro,
  coverUrl,
  getQuotes,
  CONDITION_LABELS,
  COMPLETENESS_LABELS,
  POSSESSION,
} from "@/lib/data";
import { StatusBadge, ReviewBadge, QualityBadge, PriorityBadge } from "@/components/ui";
import { CheckCircleIcon, XIcon, PackageIcon, StarIcon } from "@/components/icons";
import MiniEstimator from "@/components/MiniEstimator";

export function generateStaticParams() {
  return getGames().map((g) => ({ id: g.id }));
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGames().find((g) => g.id === id);
  if (!game) notFound();
  const platform = getPlatforms().find((p) => p.id === game.platformId);
  const items = getInventory().filter((i) => i.gameId === game.id);
  const orders = getOrders().filter((o) => o.gameIds.includes(game.id));
  const owned = items.some((i) => POSSESSION.includes(i.status));
  const ordered = items.some((i) => ["ordered", "fulfilled"].includes(i.status));
  const wishlisted = items.some((i) => i.status === "wishlist");
  const totalQty = items
    .filter((i) => POSSESSION.includes(i.status))
    .reduce((n, i) => n + i.quantity, 0);

  const cover = coverUrl(game.id);

  return (
    <div>
      {/* bandeau immersif : jaquette floutée en fond + grande jaquette nette */}
      <div className="relative -mx-4 mb-8 overflow-hidden md:-mx-8">
        {cover ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              aria-hidden
              className="h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
          </div>
        ) : null}

        <div className="relative px-4 pb-6 pt-4 md:px-8">
          <Link href="/collection/" className="text-sm text-muted transition hover:text-accent">
            ← Collection
          </Link>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={`Jaquette de ${game.canonicalTitle}`}
                className="w-36 shrink-0 rounded-xl border border-border-strong shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] sm:w-44"
              />
            ) : (
              <div className="flex aspect-[3/4] w-36 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 px-3 text-center text-xs text-muted sm:w-44">
                pas de jaquette
              </div>
            )}
            <div className="min-w-0 pb-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {game.qualityTier ? <QualityBadge tier={game.qualityTier} /> : null}
                {items.map((i) => (
                  <StatusBadge key={i.id} status={i.status} />
                ))}
                {game.buyPriority ? <PriorityBadge priority={game.buyPriority} /> : null}
              </div>
              <h1 className="title-gradient text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                {game.canonicalTitle}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs uppercase">
                  {platform?.shortName ?? game.platformId}
                </span>
                <span>{platform?.name ?? game.platformId}</span>
                <span aria-hidden>·</span>
                <span>{game.region}</span>
                {game.franchise ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{game.franchise}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-lg font-semibold">Possession</h2>
          <Field label="Possédé">
            {owned ? (
              <span className="inline-flex items-center gap-1.5 text-[#4ade80]">
                <CheckCircleIcon size={14} /> oui (×{totalQty})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#f87171]">
                <XIcon size={14} /> non
              </span>
            )}
          </Field>
          <Field label="Commandé">
            {ordered ? (
              <span className="inline-flex items-center gap-1.5 text-[#60a5fa]">
                <PackageIcon size={14} /> oui
              </span>
            ) : (
              "non"
            )}
          </Field>
          <Field label="Wishlist">
            {wishlisted ? (
              <span className="inline-flex items-center gap-1.5 text-[#c084fc]">
                <StarIcon size={14} /> oui
              </span>
            ) : (
              "non"
            )}
          </Field>
          {items.map((i) => (
            <div key={i.id} className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={i.status} />
                <ReviewBadge verificationStatus={i.verificationStatus} />
              </div>
              <div className="mt-2">
                <Field label="Quantité">
                  {i.quantity}
                  {i.quantityNeedsReview ? (
                    <span className="ml-2 text-xs text-accent">à confirmer</span>
                  ) : null}
                </Field>
                <Field label="État">{CONDITION_LABELS[i.condition ?? "unknown"]}</Field>
                <Field label="Complétude">{COMPLETENESS_LABELS[i.completeness ?? "unknown"]}</Field>
                <Field label="Prix payé">
                  {i.purchasePrice ? euro(i.purchasePrice.amount) : "—"}
                </Field>
                <Field label="Cote actuelle">
                  {i.currentEstimate ? (
                    <>
                      {euro(i.currentEstimate.low)} /{" "}
                      <span className="text-accent">{euro(i.currentEstimate.median)}</span> /{" "}
                      {euro(i.currentEstimate.high)}
                      <span className="ml-1 text-xs text-muted">
                        ({i.currentEstimate.source}, {i.currentEstimate.observedAt})
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Date d'acquisition">{i.acquiredAt ?? "—"}</Field>
                <Field label="Dernière mise à jour">
                  {new Date(i.updatedAt).toLocaleDateString("fr-FR")}
                </Field>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <p className="text-sm text-muted">Aucun exemplaire en inventaire.</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-lg font-semibold">Fiche du jeu</h2>
          <Field label="Identifiant">
            <code className="font-mono text-xs">{game.id}</code>
          </Field>
          <Field label="Qualité">
            {game.qualityTier ? <QualityBadge tier={game.qualityTier} /> : "—"}
          </Field>
          <Field label="Priorité d'achat">
            {game.buyPriority ? <PriorityBadge priority={game.buyPriority} /> : "—"}
          </Field>
          <Field label="Plateforme">{platform?.name ?? game.platformId}</Field>
          <Field label="Région">{game.region}</Field>
          <Field label="Langues">{game.languages.join(", ")}</Field>
          <Field label="Franchise">{game.franchise ?? "—"}</Field>
          <Field label="Éditeur">{game.publisher ?? "—"}</Field>
          <Field label="Développeur">{game.developer ?? "—"}</Field>
          <Field label="Année">{game.releaseYear ?? "—"}</Field>
          <Field label="Édition">{game.edition ?? "—"}</Field>
          <Field label="Support">{game.mediaType}</Field>
          {game.externalIds.ean ? (
            <Field label="EAN">
              <code className="font-mono text-xs">{game.externalIds.ean}</code>
            </Field>
          ) : null}
          {(() => {
            const q = getQuotes()[game.id];
            if (!q?.cib && !q?.loose)
              return (
                <p className="mt-5 text-xs text-muted">
                  Pas encore de cote pour ce jeu —{" "}
                  <code className="font-mono">pnpm vault add-price</code> pour en ajouter une.
                </p>
              );
            return (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold uppercase text-muted">
                  Cotes (basse / médiane / haute)
                </h3>
                {q.cib ? (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <span>Avec boîte (CIB)</span>
                    <span className="font-mono">
                      {euro(q.cib.low)} / <span className="text-accent">{euro(q.cib.median)}</span> /{" "}
                      {euro(q.cib.high)}
                      <span className="ml-2 text-xs text-muted">
                        ({q.cib.source}, {q.cib.observedAt})
                      </span>
                    </span>
                  </div>
                ) : null}
                {q.loose ? (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <span>Cartouche seule</span>
                    <span className="font-mono">
                      {euro(q.loose.low)} / <span className="text-accent">{euro(q.loose.median)}</span>{" "}
                      / {euro(q.loose.high)}
                      <span className="ml-2 text-xs text-muted">
                        ({q.loose.source}, {q.loose.observedAt})
                      </span>
                    </span>
                  </div>
                ) : null}
                <MiniEstimator quotes={q} />
                <p className="mt-2 text-xs text-muted">
                  Source : {(q.cib ?? q.loose)?.source} ({(q.cib ?? q.loose)?.observedAt}) — version
                  complète sur la page{" "}
                  <Link href="/estimateur/" className="text-accent underline">
                    Estimateur
                  </Link>
                  .
                </p>
              </div>
            );
          })()}
          {game.aliases.length ? (
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-muted">Alias</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {game.aliases.map((a) => (
                  <span key={a} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {orders.length ? (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold uppercase text-muted">Commandes liées</h3>
              {orders.map((o) => (
                <div key={o.id} className="mb-2 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                  <StatusBadge status={o.status} />
                  <span className="text-xs capitalize text-muted">
                    {o.marketplace} — {o.orderedAt}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
