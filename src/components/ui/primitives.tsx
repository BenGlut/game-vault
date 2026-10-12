"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { STATUS_LABELS } from "@/lib/labels";
import Sparkline from "@/components/charts/Sparkline";
import { AlertIcon, ChevronRightIcon, InboxIcon, SearchIcon, XIcon } from "@/components/icons";

/*
 * Primitives du design system GameVault. Toute page compose ces briques ; aucune
 * couleur en dur (jetons de src/app/globals.css, valables dans les deux thèmes).
 *
 * Échelle : texte 11 / 12 / 13 / 14 / 15 / 20 / 24-28 / 40 px ; rayons 6 (pastille),
 * 8 (contrôle), 12 (carte), 16 (panneau) ; hauteurs de contrôle 28 / 36 / 40 px.
 */

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ boutons */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-ink shadow-[var(--shadow-sm)] hover:bg-brand-strong active:translate-y-px",
  secondary: "border border-border-strong bg-surface text-text shadow-[var(--shadow-sm)] hover:bg-surface-2 active:translate-y-px",
  subtle: "bg-surface-2 text-text hover:bg-surface-3",
  ghost: "text-text-2 hover:bg-surface-2 hover:text-text",
  danger: "border border-ko/35 bg-ko/10 text-ko hover:bg-ko/15 active:translate-y-px",
  "danger-ghost": "text-ko hover:bg-ko/10",
};
const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 rounded-md px-2.5 text-xs",
  md: "h-9 gap-2 rounded-lg px-3.5 text-[13px]",
  lg: "h-10 gap-2 rounded-lg px-4 text-sm",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", extra = "") {
  return cx(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,color,transform,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-45",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    extra,
  );
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled,
  type = "button",
  icon,
  className = "",
  title,
  ...aria
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={buttonClass(variant, size, className)} {...aria}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "secondary",
  size = "md",
  icon,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}

/** Bouton d'icône seule : le libellé accessible est obligatoire. */
export function IconButton({
  label,
  onClick,
  children,
  className = "",
  disabled,
  size = "md",
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-text disabled:opacity-45",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-surface-2 px-1 font-sans text-[10px] font-medium text-muted">
      {children}
    </kbd>
  );
}

/* ---------------------------------------------------------------- pastilles */

type Tone = "neutral" | "accent" | "ok" | "ko" | "info" | "special";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-text-2 ring-border",
  accent: "bg-accent/10 text-accent ring-accent/25",
  ok: "bg-ok/10 text-ok ring-ok/25",
  ko: "bg-ko/10 text-ko ring-ko/25",
  info: "bg-info/10 text-info ring-info/25",
  special: "bg-special/10 text-special ring-special/25",
};

const BADGE_SIZES = {
  sm: "h-5 px-1.5 text-[11px]",
  md: "h-6 px-2 text-xs",
  lg: "h-7 px-2.5 text-[13px]",
};

export function Badge({
  tone = "neutral",
  children,
  title,
  className = "",
  dot = false,
  size = "sm",
  strong = false,
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
  className?: string;
  dot?: boolean;
  size?: keyof typeof BADGE_SIZES;
  strong?: boolean;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md leading-none ring-1 ring-inset",
        BADGE_SIZES[size],
        strong ? "font-semibold" : "font-medium",
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

export const STATUS_TONES: Record<string, Tone> = {
  owned: "ok",
  delivered: "ok",
  duplicate: "accent",
  ordered: "info",
  fulfilled: "info",
  wishlist: "special",
  sold: "neutral",
  cancelled: "ko",
  refunded: "ko",
};

export function StatusBadge({ status, count }: { status: string; count?: number }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "neutral"} dot>
      {STATUS_LABELS[status] ?? status}
      {count && count > 1 ? <span className="tabular-nums opacity-80">×{count}</span> : null}
    </Badge>
  );
}

export const TIER_LABELS: Record<string, string> = {
  S: "incontournable",
  A: "excellent",
  B: "bon",
  C: "moyen",
  D: "faible",
};

const TIER_STYLES: Record<string, string> = {
  S: "bg-brand text-brand-ink",
  A: "bg-ok text-on-fill",
  B: "bg-info text-on-fill",
  C: "bg-muted text-on-fill",
  D: "bg-ko text-on-fill",
};

/** Niveau de qualité S à D (consensus critique). */
export function TierBadge({ tier, className = "", size = "md" }: { tier: string | null | undefined; className?: string; size?: "sm" | "md" }) {
  if (!tier) return null;
  return (
    <span
      title={`Qualité ${tier} · ${TIER_LABELS[tier] ?? ""}`}
      aria-label={`Qualité ${tier}, ${TIER_LABELS[tier] ?? ""}`}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded font-bold leading-none",
        size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-[11px]",
        TIER_STYLES[tier],
        className,
      )}
    >
      {tier}
    </span>
  );
}

const PRIORITY_TONES: Record<string, Tone> = { haute: "ko", moyenne: "accent", basse: "neutral" };

export function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  if (!priority) return null;
  return <Badge tone={PRIORITY_TONES[priority] ?? "neutral"}>Priorité {priority}</Badge>;
}

/** Verdict de l'estimateur (lib/deal.ts) traduit en ton du design system. */
export const VERDICT_TONES: Record<string, Tone> = {
  tres_bon_plan: "ok",
  bon_plan: "ok",
  correct: "accent",
  un_peu_cher: "accent",
  mauvais_deal: "ko",
};

export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-text-2",
  accent: "text-accent",
  ok: "text-ok",
  ko: "text-ko",
  info: "text-info",
  special: "text-special",
};

export const TONE_PANEL: Record<Tone, string> = {
  neutral: "border-border bg-surface-2",
  accent: "border-accent/30 bg-accent/[0.07]",
  ok: "border-ok/30 bg-ok/[0.07]",
  ko: "border-ko/30 bg-ko/[0.07]",
  info: "border-info/30 bg-info/[0.07]",
  special: "border-special/30 bg-special/[0.07]",
};

/** Boîte des jeux Switch physiques (curation du catalogue) : fr, eu (multilingue) ou etr (import). */
export const BOX_BADGES: Record<string, { label: string; title: string; tone: Tone }> = {
  fr: { label: "FR", title: "Boîte française", tone: "ok" },
  eu: { label: "EU", title: "Boîte européenne multilingue : jeu en français, jaquette à vérifier (dos)", tone: "info" },
  etr: { label: "ÉTR", title: "Jaquette étrangère seulement (import)", tone: "ko" },
};

export function BoxBadge({ code }: { code?: string }) {
  const badge = code ? BOX_BADGES[code] : undefined;
  if (!badge) return null;
  return (
    <Badge tone={badge.tone} title={badge.title} strong>
      <span className="sr-only">Boîte </span>
      {badge.label}
    </Badge>
  );
}

/* ------------------------------------------------------------- mise en page */

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 lg:mb-8">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-xs font-medium text-muted">{eyebrow}</div> : null}
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] sm:text-[26px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[13px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Titre de section dans une page (au-dessus d'une grille ou d'une liste). */
export function SectionHeader({ title, meta, action, as: As = "h2" }: { title: ReactNode; meta?: ReactNode; action?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <As className="text-[15px] font-semibold tracking-[-0.01em]">{title}</As>
        {meta ? <span className="truncate text-[13px] text-muted">{meta}</span> : null}
      </div>
      {action}
    </div>
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
    <section className={cx("min-w-0 rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]", padded && "p-4 sm:p-5", className)}>
      {title || action ? (
        <div className={cx("mb-4 flex items-start justify-between gap-3", !padded && "px-4 pt-4 sm:px-5 sm:pt-5")}>
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2> : null}
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
    <Link href={href} className="group inline-flex items-center gap-0.5 rounded-md text-xs font-medium text-muted transition hover:text-text">
      {children}
      <ChevronRightIcon size={14} className="transition group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Bloc en retrait dans une carte (chiffre, groupe de champs). */
export function Inset({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-lg border border-border bg-surface-2/60 p-3", className)}>{children}</div>;
}

/** Tuile chiffre clé : libellé, valeur, détail, tendance facultative. */
export function StatTile({
  label,
  value,
  detail,
  trend,
  href,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  trend?: number[];
  href?: string;
  tone?: "default" | "accent";
  icon?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-muted">
          {icon ? <span className={tone === "accent" ? "text-accent" : ""}>{icon}</span> : null}
          {label}
        </span>
        {href ? <ChevronRightIcon size={14} className="shrink-0 text-muted opacity-0 transition group-hover:opacity-100" /> : null}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className={cx("text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums", tone === "accent" && "text-accent")}>{value}</span>
        {trend ? (
          <span className="hidden shrink-0 sm:block">
            <Sparkline values={trend} width={64} height={22} />
          </span>
        ) : null}
      </div>
      {detail ? <div className="mt-1.5 truncate text-xs text-muted">{detail}</div> : null}
    </>
  );
  const cls = cx(
    "group block min-w-0 rounded-xl border p-4 shadow-[var(--shadow-card)] transition",
    tone === "accent" ? "border-accent/30 bg-accent/[0.06]" : "border-border bg-surface",
    href && "hover:border-border-strong hover:bg-surface-2/50",
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

/* ---------------------------------------------------------------- filtres */

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
      className={cx(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition",
        active ? "border-text bg-text text-bg" : "border-border bg-surface text-text-2 hover:border-border-strong hover:text-text",
      )}
    >
      {children}
      {count !== undefined ? <span className={cx("tabular-nums", active ? "opacity-70" : "text-muted")}>{count}</span> : null}
    </button>
  );
}

/** Rangée de puces : défile au doigt sur téléphone, passe à la ligne dès la tablette (jamais coupée). */
export function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = "md",
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-lg border border-border bg-surface-2/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.title}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cx(
            "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition",
            size === "sm" ? "h-6 px-2 text-[11px]" : "h-8 px-3 text-xs",
            value === o.value ? "bg-surface text-text shadow-[var(--shadow-sm)] ring-1 ring-border" : "text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Champ de recherche avec loupe et bouton d'effacement. */
export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className = "",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cx("relative min-w-0", className)}>
      <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        autoFocus={autoFocus}
        className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-8 text-[13px] text-text shadow-[var(--shadow-sm)] outline-none transition placeholder:text-muted hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-text"
        >
          <XIcon size={14} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Barre de filtres compacte, collée sous l'en-tête au défilement.
 * `top` : rangée principale (recherche, sélecteurs) ; `children` : puces.
 */
export function FilterBar({ children, top }: { children?: ReactNode; top: ReactNode }) {
  return (
    <div className="sticky top-14 z-20 -mx-4 mb-5 space-y-2.5 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75 sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center gap-2">{top}</div>
      {children}
    </div>
  );
}

/** Pastille « filtre actif » retirable. */
export function ActiveFilter({ children, onClear }: { children: ReactNode; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent/10 px-3 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25 transition hover:bg-accent/15"
    >
      {children}
      <XIcon size={12} />
      <span className="sr-only">Retirer le filtre</span>
    </button>
  );
}

/* -------------------------------------------------------------- tableaux */

export const table = {
  wrap: "overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]",
  table: "w-full text-[13px]",
  head: "border-b border-border bg-surface-2/60 text-left text-xs text-muted",
  th: "px-3 py-2.5 font-medium first:pl-4 last:pr-4",
  body: "divide-y divide-border",
  row: "transition hover:bg-surface-2/60",
  td: "px-3 py-2.5 first:pl-4 last:pr-4",
};

/* -------------------------------------------------------- états d'écran */

export function EmptyState({
  title,
  children,
  icon,
  action,
}: {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong px-6 py-12 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">{icon ?? <InboxIcon size={18} />}</span>
      <p className="text-sm font-medium">{title}</p>
      {children ? <div className="mt-1 max-w-sm text-[13px] text-muted">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, children, onRetry }: { title: string; children?: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-ko/30 bg-ko/[0.05] px-6 py-10 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ko/10 text-ko">
        <AlertIcon size={18} />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {children ? <div className="mt-1 max-w-md text-[13px] text-muted">{children}</div> : null}
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("skeleton rounded-lg", className)} aria-hidden />;
}

/** Grille de jaquettes en chargement. */
export function CoverGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <Skeleton className="mt-2.5 h-3.5 w-4/5" />
          <Skeleton className="mt-1.5 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------- fenêtres et panneaux */

/** Piège le focus clavier dans un conteneur ouvert et le rend à l'élément d'origine à la fermeture. */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () =>
      el ? [...el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null) : [];
    if (el && !el.contains(document.activeElement)) (focusables()[0] ?? el).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !el) return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [active]);
  return ref;
}

/** Fenêtre modale centrée (feuille du bas sur téléphone). */
export function Dialog({
  label,
  title,
  onClose,
  children,
  width = "max-w-xl",
}: {
  label: string;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  const ref = useFocusTrap<HTMLDivElement>(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="animate-fade absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        className={cx(
          "animate-pop relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-border-strong bg-bg-elev shadow-[var(--shadow-pop)] outline-none sm:rounded-2xl",
          width,
        )}
      >
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-elev/95 px-5 py-3.5 backdrop-blur">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <IconButton label="Fermer" onClick={onClose} size="sm">
              <XIcon size={16} />
            </IconButton>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
