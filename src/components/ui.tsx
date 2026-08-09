import Link from "next/link";
import type { GameRow } from "@/lib/data";
import { STATUS_LABELS } from "@/lib/data";
import { CheckCircleIcon, AlertIcon } from "@/components/icons";

const STATUS_COLORS: Record<string, string> = {
  owned: "bg-[#4ade8020] text-[#4ade80]",
  delivered: "bg-[#4ade8020] text-[#4ade80]",
  ordered: "bg-[#60a5fa20] text-[#60a5fa]",
  fulfilled: "bg-[#60a5fa20] text-[#93c5fd]",
  wishlist: "bg-[#c084fc20] text-[#c084fc]",
  duplicate: "bg-[#f5b64220] text-[#f5b642]",
  sold: "bg-[#8a93a820] text-[#8a93a8]",
  cancelled: "bg-[#f8717120] text-[#f87171]",
  refunded: "bg-[#f8717120] text-[#fca5a5]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-surface-2 text-muted"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function ReviewBadge({ verificationStatus }: { verificationStatus: string }) {
  if (verificationStatus === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#4ade8015] px-2 py-0.5 text-xs text-[#4ade80]">
        <CheckCircleIcon size={12} /> vérifié
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f5b64215] px-2 py-0.5 text-xs text-[#f5b642]">
      <AlertIcon size={12} /> à vérifier
    </span>
  );
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#f5b64225] text-[#f5b642] border border-[#f5b64260]",
  A: "bg-[#4ade8020] text-[#4ade80]",
  B: "bg-[#60a5fa20] text-[#60a5fa]",
  C: "bg-[#8a93a820] text-[#8a93a8]",
  D: "bg-[#f8717120] text-[#f87171]",
};

/** Badge de niveau de qualité (S incontournable … D faible). */
export function QualityBadge({ tier }: { tier: string | null }) {
  if (!tier) return null;
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded font-mono text-xs font-bold ${TIER_COLORS[tier] ?? ""}`}
      title={`Qualité ${tier}`}
    >
      {tier}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  haute: "bg-[#f8717120] text-[#f87171]",
  moyenne: "bg-[#f5b64220] text-[#f5b642]",
  basse: "bg-[#8a93a820] text-[#8a93a8]",
};

/** Badge de priorité d'achat (wishlist / recommandations). */
export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority] ?? ""}`}>
      priorité {priority}
    </span>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}

export function GameLink({ row }: { row: GameRow }) {
  return (
    <Link
      href={`/jeu/${row.game.id}/`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent/40 hover:bg-surface-2"
    >
      <div className="flex min-w-0 items-center gap-3">
        {row.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.coverUrl}
            alt=""
            loading="lazy"
            className="h-14 w-12 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded bg-surface-2 text-xs text-muted">
            ?
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{row.game.canonicalTitle}</span>
            <QualityBadge tier={row.game.qualityTier} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
              {row.platform?.shortName ?? row.game.platformId}
            </span>
            {row.game.franchise ? <span>{row.game.franchise}</span> : null}
            <span>{row.game.region}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {row.items.map((i) => (
          <span key={i.id} className="flex items-center gap-1">
            <StatusBadge status={i.status} />
            {i.quantity > 1 ? <span className="text-xs text-accent">×{i.quantity}</span> : null}
          </span>
        ))}
      </div>
    </Link>
  );
}
