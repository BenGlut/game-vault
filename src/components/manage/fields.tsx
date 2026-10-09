"use client";

import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none transition focus:border-accent";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Select({
  value,
  options,
  onChange,
  labels,
  allowEmpty,
}: {
  value: string | null;
  options: readonly string[];
  onChange: (v: string) => void;
  labels?: Record<string, string>;
  allowEmpty?: string;
}) {
  return (
    <select className={inputClass} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty !== undefined ? <option value="">{allowEmpty}</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-accent text-bg hover:bg-accent-2",
    secondary: "border border-border bg-surface-2 text-text hover:border-border-strong",
    danger: "border border-[#f8717150] bg-[#f8717115] text-ko hover:bg-[#f8717125]",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}
