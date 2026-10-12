"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "@/components/icons";
import { cx, useFocusTrap } from "@/components/ui/primitives";

/**
 * Cadre des panneaux latéraux (drawer) : glisse depuis la droite, plein écran sur
 * téléphone ; Échap ou clic hors du panneau pour fermer ; focus gardé dedans puis
 * rendu à l'élément d'origine ; défilement de la page bloqué pendant l'ouverture.
 */
export default function SidePanel({
  label,
  visible,
  onClose,
  actions,
  children,
}: {
  label: string;
  visible: boolean;
  onClose: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const ref = useFocusTrap<HTMLElement>(true);
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
    // en cours de fermeture : le voile laisse passer les clics (sinon le premier clic suivant est perdu)
    <div className={cx("fixed inset-0 z-50", !visible && "pointer-events-none")} role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={cx("animate-fade absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <aside
        ref={ref}
        tabIndex={-1}
        className={cx(
          "animate-drawer absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col border-l border-border-strong bg-bg-elev shadow-[var(--shadow-pop)] outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          visible ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 pt-[env(safe-area-inset-top)]">
          {actions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-elev/80 text-text-2 shadow-[var(--shadow-sm)] backdrop-blur transition hover:bg-surface-2 hover:text-text"
          >
            <XIcon size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </aside>
    </div>
  );
}

/** Bouton d'action secondaire posé en haut d'un panneau (à côté de « Fermer »). */
export const panelActionClass =
  "inline-flex h-8 items-center rounded-full border border-border bg-bg-elev/80 px-3 text-xs font-medium text-text-2 shadow-[var(--shadow-sm)] backdrop-blur transition hover:bg-surface-2 hover:text-text";
