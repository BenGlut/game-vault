"use client";

import { useId, type ReactNode } from "react";
import { cx } from "./primitives";

export { Button } from "./primitives";

/** Champ de saisie standard (36 px, contour, anneau de focus ambre). */
export const inputClass =
  "h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] text-text shadow-[var(--shadow-sm)] outline-none transition placeholder:text-muted hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50";

export const textareaClass = inputClass.replace("h-9", "min-h-20 py-2");

/** Classe de champ avec largeur imposée (sans le w-full par défaut, qui l'emporterait). */
export function sizedInput(width: string): string {
  return cx(inputClass.replace("w-full ", ""), width);
}

export function Field({ label, children, className, hint }: { label: string; children: ReactNode; className?: string; hint?: ReactNode }) {
  return (
    <label className={cx("block min-w-0", className)}>
      <span className="mb-1.5 block text-xs font-medium text-text-2">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function Select({
  value,
  options,
  onChange,
  labels,
  allowEmpty,
  label,
  className = "",
}: {
  value: string | null;
  options: readonly string[];
  onChange: (v: string) => void;
  labels?: Record<string, string>;
  allowEmpty?: string;
  /** libellé accessible quand le sélecteur n'est pas dans un <Field> */
  label?: string;
  className?: string;
}) {
  return (
    <select aria-label={label} className={cx(className ? sizedInput(className) : inputClass, "gv-select cursor-pointer")} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty !== undefined ? <option value="">{allowEmpty}</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}

/** Case à cocher stylée, libellé cliquable. */
export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-[13px] text-text-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 cursor-pointer rounded accent-[var(--brand)]" />
      {children}
    </label>
  );
}
