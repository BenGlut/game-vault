"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GameDetail from "@/components/game/GameDetail";
import { ArrowLeftIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/primitives";

/** Fiche jeu en pleine page (/jeu/?id=…), pour un lien direct ou un marque-page. */
export default function GameView() {
  const id = useSearchParams().get("id");
  return (
    <div className="animate-page mx-auto max-w-2xl">
      <Link href="/collection" className="mb-4 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-muted transition hover:text-text">
        <ArrowLeftIcon size={15} /> Collection
      </Link>
      {id ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev shadow-[var(--shadow-card)]">
          <GameDetail gameId={id} />
        </div>
      ) : (
        <EmptyState title="Aucun jeu demandé">Ouvrez un jeu depuis la collection ou la recherche.</EmptyState>
      )}
    </div>
  );
}
