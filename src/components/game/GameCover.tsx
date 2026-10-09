"use client";

import { useState } from "react";
import { coverUrl } from "@/components/vault/model";

/** Jaquette du jeu ; repli élégant (initiales sur dégradé) si l'image manque. */
export default function GameCover({
  gameId,
  title,
  className = "",
  rounded = "rounded-xl",
}: {
  gameId: string;
  title: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const initials = title
      .replace(/[^\p{L}\p{N} ]/gu, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    return (
      <div
        className={`flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-surface-2 to-bg-elev ${rounded} ${className}`}
        aria-label={`Pas de jaquette pour ${title}`}
      >
        <span className="text-2xl font-semibold text-muted/60">{initials || "?"}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverUrl(gameId)}
      alt={`Jaquette de ${title}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`aspect-[3/4] w-full bg-surface-2 object-cover ${rounded} ${className}`}
    />
  );
}
