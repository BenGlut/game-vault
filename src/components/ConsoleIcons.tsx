/**
 * Illustrations SVG des consoles (traits, adaptées au thème) — sélecteur de plateforme.
 */

interface ConsoleIconProps {
  className?: string;
  size?: number;
}

function svgProps(p: ConsoleIconProps) {
  return {
    width: (p.size ?? 48) * 1.4,
    height: p.size ?? 48,
    viewBox: "0 0 68 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: p.className,
    "aria-hidden": true,
  };
}

/** Nintendo DS — clamshell ouverte, deux écrans égaux. */
export function DsIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="16" y="3" width="36" height="20" rx="3" />
      <rect x="22" y="7" width="24" height="12" rx="1.5" />
      <rect x="14" y="25" width="40" height="20" rx="3" />
      <rect x="26" y="29" width="16" height="12" rx="1.5" />
      <path d="M18.5 32.5h3.5m-1.75-1.75v3.5" />
      <circle cx="48" cy="31.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="51" cy="34.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="45" cy="34.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="48" cy="37.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Nintendo 3DS — clamshell, écran du haut large (3D), circle pad. */
export function TdsIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="12" y="3" width="44" height="20" rx="3" />
      <rect x="17" y="6.5" width="34" height="13" rx="1.5" />
      <rect x="14" y="25" width="40" height="20" rx="3" />
      <rect x="27" y="29" width="14" height="12" rx="1.5" />
      <circle cx="20.5" cy="32" r="2.6" />
      <path d="M18 38.5h4m-2-2v4" strokeWidth="1.8" />
      <circle cx="48" cy="31.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="51" cy="34.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="45" cy="34.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="48" cy="37.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Game Boy Advance — format paysage, écran central, D-pad et boutons A/B. */
export function GbaIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9 12a5 5 0 0 1 5-5h40a5 5 0 0 1 5 5v22a7 7 0 0 1-7 7h-5.5c-2 0-3.6-1.2-5.3-2.4-1.3-.9-2.7-1.6-4.2-1.6h-6c-1.5 0-2.9.7-4.2 1.6-1.7 1.2-3.3 2.4-5.3 2.4H16a7 7 0 0 1-7-7Z" />
      <rect x="24" y="12" width="20" height="15" rx="1.5" />
      <path d="M15.5 17.5v7m-3.5-3.5h7" />
      <circle cx="52.5" cy="17" r="2.2" />
      <circle cx="46.5" cy="21.5" r="2.2" />
    </svg>
  );
}

/** Nintendo 64 — manette trident iconique. */
export function N64Icon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M22 8h24c3 0 5 2 5 5l-1 6c-.4 2-2 3.5-4 3.5h-4.5c-1.5 0-2.8.8-3.6 2L34.5 29l-2.9-4.5c-.8-1.2-2.1-2-3.6-2H23.5c-2 0-3.6-1.5-4-3.5l-1-6c0-3 2-5 3.5-5Z" />
      <path d="M25 24.5 21 40c-.5 2-2.3 3.5-4.4 3.5-2.8 0-4.9-2.6-4.3-5.3L15 26" />
      <path d="M43 24.5 47 40c.5 2 2.3 3.5 4.4 3.5 2.8 0 4.9-2.6 4.3-5.3L53 26" />
      <path d="M31 33.5 29.5 40c-.5 2.2 1.2 4.3 3.5 4.3h2c2.3 0 4-2.1 3.5-4.3L37 33.5" />
      <path d="M25.5 13.5v5m-2.5-2.5h5" strokeWidth="1.8" />
      <circle cx="43" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="40" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="46" cy="17" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="34" cy="35.5" r="2.4" />
    </svg>
  );
}

/** GameCube — le cube à poignée. */
export function GameCubeIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M18 16 34 8l16 8v18l-16 8-16-8Z" />
      <path d="M18 16l16 8 16-8M34 24v18" />
      <path d="M26 12.5v7m16-7v7" strokeWidth="1.6" />
      <circle cx="34" cy="17.5" r="2.6" strokeWidth="1.8" />
    </svg>
  );
}

/** Game Boy — la brique verticale, écran décalé et boutons en diagonale. */
export function GbIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M22 4h24a3 3 0 0 1 3 3v30a7 7 0 0 1-7 7H22a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
      <rect x="23" y="8" width="22" height="16" rx="1.5" />
      <path d="M26.5 30v6m-3-3h6" strokeWidth="1.8" />
      <circle cx="42.5" cy="30.5" r="2" />
      <circle cx="37" cy="34" r="2" />
      <path d="M30 41.5h3m2 0h3" strokeWidth="1.6" />
    </svg>
  );
}

/** Game Boy Color — silhouette arrondie, écran centré. */
export function GbcIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M22 4h24a3 3 0 0 1 3 3v31a6 6 0 0 1-6 6H25a6 6 0 0 1-6-6V7a3 3 0 0 1 3-3Z" />
      <rect x="24" y="8" width="20" height="15" rx="2" />
      <rect x="27.5" y="10.5" width="13" height="10" rx="1" strokeWidth="1.6" />
      <path d="M26.5 29v6m-3-3h6" strokeWidth="1.8" />
      <circle cx="42.5" cy="29.5" r="2" />
      <circle cx="37" cy="33" r="2" />
      <path d="M30.5 40.5 33 39m2.5-.5 2.5 1.5" strokeWidth="1.6" />
    </svg>
  );
}

/** Nintendo Switch — écran central et deux Joy-Con détachables. */
export function SwitchIcon(props: ConsoleIconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="20" y="10" width="28" height="28" rx="2" />
      <rect x="23.5" y="14" width="21" height="20" rx="1" strokeWidth="1.6" />
      <path d="M18 10h-3a6 6 0 0 0-6 6v16a6 6 0 0 0 6 6h3Z" />
      <path d="M50 10h3a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-3Z" />
      <circle cx="14" cy="18" r="2.2" />
      <circle cx="54" cy="30" r="2.2" />
      <path d="M12.5 28.5h3m-1.5-1.5v3" strokeWidth="1.6" />
      <circle cx="54" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="51.5" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="56.5" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="54" cy="21.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const CONSOLE_ICONS: Record<string, (p: ConsoleIconProps) => React.JSX.Element> = {
  gb: GbIcon,
  gbc: GbcIcon,
  ds: DsIcon,
  "3ds": TdsIcon,
  gba: GbaIcon,
  n64: N64Icon,
  gamecube: GameCubeIcon,
  switch: SwitchIcon,
};
