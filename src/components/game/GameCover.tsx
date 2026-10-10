"use client";

import { coverUrl } from "@/components/vault/model";
import CoverImage from "./CoverImage";
import { useCoverSource } from "./coverSources";

/**
 * Jaquette d'un jeu de la collection : original haute résolution quand le
 * catalogue le connaît, copie locale sinon, toujours entière (jamais recadrée).
 */
export default function GameCover({
  gameId,
  title,
  ratio = 0.75,
  width = 200,
  className = "",
  rounded = "rounded-xl",
}: {
  gameId: string;
  title: string;
  /** proportions du cadre (largeur / hauteur) */
  ratio?: number;
  /** largeur affichée en px CSS */
  width?: number;
  className?: string;
  rounded?: string;
}) {
  const source = useCoverSource(gameId);
  return (
    <CoverImage
      key={source?.u ?? "local"}
      src={source?.u}
      fallback={coverUrl(gameId)}
      alt={`Jaquette de ${title}`}
      ratio={ratio}
      width={width}
      rounded={rounded}
      className={className}
    />
  );
}
