"use client";

import { CONSOLE_ICONS } from "@/components/ConsoleIcons";
import { formatOf } from "@/lib/platform-format";
import CoverImage from "./CoverImage";

/** Largeur affichée de la jaquette selon le format de la console (px CSS). */
const WIDTH = { landscape: 440, square: 280, portrait: 230 } as const;

/**
 * En-tête de fiche pensé par console : la jaquette garde les proportions de son
 * support (N64 en paysage, GBA carrée, boîtier Switch en hauteur), sur un fond
 * teinté de la couleur de la gamme, avec le type de boîte en légende.
 */
export default function CoverHero({
  platformId,
  platformName,
  src,
  fallback,
  title,
  square = false,
}: {
  platformId: string;
  platformName: string;
  src?: string | null;
  fallback?: string | null;
  title: string;
  /** image carrée (icône eShop) faute de jaquette de boîte */
  square?: boolean;
}) {
  const fmt = formatOf(platformId);
  const ratio = square ? 1 : fmt.ratio;
  const layout = square ? "square" : fmt.layout;
  const width = WIDTH[layout];
  const Icon = CONSOLE_ICONS[platformId] ?? CONSOLE_ICONS[platformId.replace(/-digital$/, "")];

  return (
    <div className="relative overflow-hidden px-5 pb-5 pt-14">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${fmt.tint}55 0%, ${fmt.tint}14 45%, transparent 75%)`,
        }}
      />
      <div className="relative mx-auto" style={{ width: `min(100%, ${width}px)` }}>
        <CoverImage
          src={src}
          fallback={fallback}
          alt={`Jaquette de ${title}`}
          ratio={ratio}
          width={width}
          eager
          rounded="rounded-2xl"
          className="shadow-[0_25px_60px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
        />
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          {Icon ? <Icon size={16} /> : null}
          <span>
            {square ? `${platformName} · image eShop (pas de photo de boîte)` : `${fmt.caseLabel === "Boîte" ? platformName : fmt.caseLabel}`}
          </span>
        </div>
      </div>
    </div>
  );
}
