"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import GameDetail from "./GameDetail";

interface DrawerCtx {
  open: (gameId: string) => void;
  close: () => void;
}

const Ctx = createContext<DrawerCtx>({ open: () => undefined, close: () => undefined });

export function useGameDrawer(): DrawerCtx {
  return useContext(Ctx);
}

/**
 * Panneau latéral : la fiche glisse depuis la droite sans quitter la page, pour
 * consulter ou corriger un jeu et revenir à la liste filtrée d'un geste (Échap).
 */
export function GameDrawerProvider({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // l'entrée est une animation CSS (indépendante des frames) ; la sortie, une transition
  const open = useCallback((id: string) => {
    setGameId(id);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => setGameId(null), 280);
  }, []);

  useEffect(() => {
    if (!gameId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [gameId, close]);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {gameId ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Fiche du jeu">
          <div
            className={`animate-fade absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={close}
          />
          <aside
            className={`animate-drawer absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border-strong bg-bg-elev shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="absolute right-3 top-3 z-10 flex gap-1.5">
              <Link
                href={`/jeu/?id=${encodeURIComponent(gameId)}`}
                onClick={close}
                className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
              >
                Pleine page
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="rounded-full bg-black/40 p-2 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <GameDetail key={gameId} gameId={gameId} onNavigate={close} />
            </div>
          </aside>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
