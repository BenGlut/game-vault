"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import GameDetail from "./GameDetail";
import SidePanel from "./SidePanel";

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

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {gameId ? (
        <SidePanel
          label="Fiche du jeu"
          visible={visible}
          onClose={close}
          actions={
            <Link
              href={`/jeu/?id=${encodeURIComponent(gameId)}`}
              onClick={close}
              className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white"
            >
              Pleine page
            </Link>
          }
        >
          <GameDetail key={gameId} gameId={gameId} onNavigate={close} />
        </SidePanel>
      ) : null}
    </Ctx.Provider>
  );
}
