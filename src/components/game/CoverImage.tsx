"use client";

import { useState } from "react";
import { resized } from "@/lib/platform-format";

/**
 * Jaquette nette et entière, chargée progressivement :
 * 1. la copie locale (légère, servie avec le site) s'affiche tout de suite ;
 * 2. l'original, redimensionné à la taille affichée (×2 sur écran Retina),
 *    la remplace en fondu dès qu'il est arrivé.
 * Toujours posée en entier dans un cadre aux proportions de la console, sur un
 * fond flou de la même image (ni recadrage ni bandes vides). Repli : initiales.
 */
export default function CoverImage({
  src,
  fallback,
  alt,
  ratio,
  width,
  rounded = "rounded-xl",
  className = "",
  eager = false,
}: {
  /** image d'origine (haute résolution) — redimensionnée à la volée */
  src?: string | null;
  /** copie locale servie avec le site */
  fallback?: string | null;
  alt: string;
  /** largeur / hauteur du cadre */
  ratio: number;
  /** largeur affichée en px CSS (sert à choisir la résolution) */
  width: number;
  rounded?: string;
  className?: string;
  eager?: boolean;
}) {
  const [remoteState, setRemoteState] = useState<"loading" | "ok" | "failed">(src ? "loading" : "failed");
  const [localFailed, setLocalFailed] = useState(!fallback);
  const w = Math.ceil(width / 40) * 40; // paliers : meilleur cache CDN

  const showRemote = !!src && remoteState !== "failed";
  const showLocal = !localFailed && remoteState !== "ok";
  const blur = !localFailed ? fallback! : src && remoteState !== "failed" ? resized(src, 48) : null;

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${rounded} ${className}`} style={{ aspectRatio: String(ratio) }}>
      {blur ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={blur} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-xl" />
      ) : null}
      {showLocal ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallback!}
          alt={showRemote ? "" : alt}
          aria-hidden={showRemote}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setLocalFailed(true)}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : null}
      {showRemote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={(el) => {
            // déjà en cache : l'image est complète avant que onLoad soit branché
            if (el?.complete && el.naturalWidth > 0 && remoteState === "loading") setRemoteState("ok");
          }}
          src={resized(src!, w)}
          srcSet={`${resized(src!, w)} 1x, ${resized(src!, w * 2)} 2x`}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setRemoteState("ok")}
          onError={() => setRemoteState("failed")}
          className={`relative h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition-opacity duration-500 ${
            remoteState === "ok" ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      {!showRemote && localFailed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-2 to-bg-elev p-2 text-center">
          <span className="line-clamp-3 text-xs font-medium text-muted/70">{alt.replace(/^Jaquette de /, "")}</span>
        </div>
      ) : null}
    </div>
  );
}
