"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GameDetail from "@/components/game/GameDetail";

/** Fiche jeu en pleine page (/jeu/?id=…), pour un lien direct ou un marque-page. */
export default function GameView() {
  const id = useSearchParams().get("id");
  return (
    <div className="animate-page mx-auto max-w-2xl">
      <Link href="/collection" className="mb-4 inline-block text-sm text-muted transition hover:text-text">
        ← Collection
      </Link>
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
        {id ? <GameDetail gameId={id} /> : <p className="p-6 text-sm text-muted">Aucun jeu demandé.</p>}
      </div>
    </div>
  );
}
