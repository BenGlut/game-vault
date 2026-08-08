import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGames,
  getInventory,
  getOrders,
  getPlatforms,
  euro,
  coverUrl,
  CONDITION_LABELS,
  COMPLETENESS_LABELS,
  POSSESSION,
} from "@/lib/data";
import { PageTitle, StatusBadge, ReviewBadge } from "@/components/ui";
import { CheckCircleIcon, XIcon, PackageIcon, StarIcon } from "@/components/icons";

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
  const ordered = items.some((i) => ["ordered", "shipped"].includes(i.status));
  const wishlisted = items.some((i) => i.status === "wishlist");
  const totalQty = items
    .filter((i) => POSSESSION.includes(i.status))
    .reduce((n, i) => n + i.quantity, 0);

  return (
    <div>
      <Link href="/collection/" className="text-sm text-muted hover:text-accent">
        ← Collection
      </Link>
      <div className="mt-2 flex items-start gap-5">
        {coverUrl(game.id) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl(game.id)!}
            alt={`Jaquette de ${game.canonicalTitle}`}
            className="w-28 shrink-0 rounded-lg border border-border shadow-lg md:w-36"
          />
        ) : null}
        <PageTitle
          title={game.canonicalTitle}
          sub={`${platform?.name ?? game.platformId} — ${game.region}${game.franchise ? ` — ${game.franchise}` : ""}`}
        />
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
          <Field label="Plateforme">{platform?.name ?? game.platformId}</Field>
          <Field label="Région">{game.region}</Field>
          <Field label="Langues">{game.languages.join(", ")}</Field>
          <Field label="Franchise">{game.franchise ?? "—"}</Field>
          <Field label="Éditeur">{game.publisher ?? "—"}</Field>
          <Field label="Développeur">{game.developer ?? "—"}</Field>
          <Field label="Année">{game.releaseYear ?? "—"}</Field>
          <Field label="Édition">{game.edition ?? "—"}</Field>
          <Field label="Support">{game.mediaType}</Field>
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
