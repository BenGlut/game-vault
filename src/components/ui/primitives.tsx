"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { STATUS_LABELS } from "@/lib/labels";
import Sparkline from "@/components/charts/Sparkline";

export const STATUS_STYLES: Record<string, string> = {
  owned: "bg-ok/12 text-ok ring-ok/25",
  delivered: "bg-ok/12 text-ok ring-ok/25",
  duplicate: "bg-accent/12 text-accent ring-accent/25",
  ordered: "bg-info/12 text-info ring-info/25",
  fulfilled: "bg-info/12 text-[#93c5fd] ring-info/25",
  wishlist: "bg-special/12 text-special ring-special/25",
  sold: "bg-muted/12 text-muted ring-muted/25",
  cancelled: "bg-ko/12 text-ko ring-ko/25",
  refunded: "bg-ko/12 text-[#fca5a5] ring-ko/25",
};

export function StatusBadge({ status, count }: { status: string; count?: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        STATUS_STYLES[status] ?? "bg-surface-2 text-muted ring-border"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
      {count && count > 1 ? ` ×${count}` : ""}
    </span>
  );
}

const TIER_STYLES: Record<string, string> = {
  S: "bg-accent text-bg",
  A: "bg-ok text-bg",
  B: "bg-info text-bg",
  C: "bg-muted text-bg",
  D: "bg-ko text-bg",
};

export function TierBadge({ tier, className = "" }: { tier: string | null | undefined; className?: string }) {
  if (!tier) return null;
  return (
    <span
      title={`Qualité ${tier}`}
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${TIER_STYLES[tier] ?? ""} ${className}`}
    >
      {tier}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  haute: "bg-ko/12 text-ko ring-ko/25",
  moyenne: "bg-accent/12 text-accent ring-accent/25",
  basse: "bg-muted/12 text-muted ring-muted/25",
};

export function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  if (!priority) return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${PRIORITY_STYLES[priority] ?? ""}`}>
      {priority}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface ${padded ? "p-5" : ""} ${className}`}>
      {title || action ? (
        <div className={`mb-4 flex items-start justify-between gap-3 ${padded ? "" : "px-5 pt-5"}`}>
          <div className="min-w-0">
            {title ? <h2 className="text-[15px] font-semibold">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-xs font-medium text-accent transition hover:text-accent-2">
      {children} →
    </Link>
  );
}

/** Tuile chiffre clé : libellé, valeur, détail, tendance facultative. */
export function StatTile({
  label,
  value,
  detail,
  trend,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  trend?: number[];
  href?: string;
  tone?: "default" | "accent";
}) {
  const body = (
    <>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className={`text-2xl font-semibold tracking-tight ${tone === "accent" ? "text-accent" : ""}`}>{value}</span>
        {trend ? (
          <span className="mb-1 hidden shrink-0 sm:block">
            <Sparkline values={trend} width={64} height={24} />
          </span>
        ) : null}
      </div>
      {detail ? <div className="mt-1 text-xs text-muted">{detail}</div> : null}
    </>
  );
  const cls = `block rounded-2xl border p-4 transition ${
    tone === "accent" ? "border-accent/30 bg-accent-soft" : "border-border bg-surface"
  } ${href ? "hover:-translate-y-0.5 hover:border-accent/40" : ""}`;
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-accent bg-accent text-bg"
          : "border-border bg-surface text-muted hover:border-border-strong hover:text-text"
      }`}
    >
      {children}
      {count !== undefined ? <span className={active ? "opacity-70" : "text-muted/70"}>{count}</span> : null}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            value === o.value ? "bg-surface-2 text-text shadow-sm" : "text-muted hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-1 text-sm text-muted">{children}</div> : null}
    </div>
  );
}
