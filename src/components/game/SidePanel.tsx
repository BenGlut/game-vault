"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Cadre des panneaux latéraux : glisse depuis la droite, Échap ou clic hors du
 * panneau pour fermer, défilement de la page bloqué pendant l'ouverture.
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={`animate-fade absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`animate-drawer absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border-strong bg-bg-elev shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          {actions}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full bg-black/40 p-2 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </aside>
    </div>
  );
}
