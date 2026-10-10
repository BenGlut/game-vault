/**
 * Logos SVG des marchands et des briques techniques.
 * - logos officiels de la bibliothèque libre simple-icons (CC0) quand elle les a ;
 * - sinon marque simplifiée aux couleurs de l'enseigne (Amazon, Micromania,
 *   Leboncoin, Cdiscount, Nintendo, Playwright), dessinée ici.
 */
import {
  siClaude,
  siCloudflare,
  siEbay,
  siFnac,
  siGithub,
  siGoogle,
  siNextdotjs,
  siPnpm,
  siRakuten,
  siReact,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVinted,
  siVitest,
  siZod,
} from "simple-icons";

interface SimpleIcon {
  title: string;
  hex: string;
  path: string;
}

/** Couleurs trop sombres pour le fond de l'application : rendues en blanc. */
function visibleHex(hex: string): string {
  const n = parseInt(hex, 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum < 60 ? "currentColor" : `#${hex}`;
}

function Simple({ icon, size }: { icon: SimpleIcon; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={icon.title} fill={visibleHex(icon.hex)}>
      <path d={icon.path} />
    </svg>
  );
}

/** Pastille de marque (fond couleur de l'enseigne, monogramme ou pictogramme blanc). */
function Badge({ size, bg, label, children }: { size: number; bg: string; label: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label}>
      <rect width="24" height="24" rx="6" fill={bg} />
      {children}
    </svg>
  );
}

const CUSTOM: Record<string, (size: number) => React.JSX.Element> = {
  amazon: (s) => (
    <Badge size={s} bg="#232f3e" label="Amazon">
      <text x="12" y="13.5" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif" fill="#fff">
        a
      </text>
      <path d="M6 15.6c3.8 2.3 8.3 2.3 12 0" fill="none" stroke="#ff9900" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m16.2 14.6 2 .9-.5 2" fill="none" stroke="#ff9900" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Badge>
  ),
  micromania: (s) => (
    <Badge size={s} bg="#e4032e" label="Micromania">
      <path d="M5.5 17V7.5l3.6 5.2 2.9-5.2 2.9 5.2 3.6-5.2V17" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </Badge>
  ),
  leboncoin: (s) => (
    <Badge size={s} bg="#ec5a13" label="Leboncoin">
      <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" fill="#fff">
        lbc
      </text>
    </Badge>
  ),
  cdiscount: (s) => (
    <Badge size={s} bg="#00a0e6" label="Cdiscount">
      <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Arial, sans-serif" fill="#fff">
        C
      </text>
    </Badge>
  ),
  nintendo: (s) => (
    <Badge size={s} bg="#e60012" label="Nintendo">
      <rect x="3.5" y="8" width="17" height="8" rx="4" fill="none" stroke="#fff" strokeWidth="1.3" />
      <text x="12" y="13.6" textAnchor="middle" fontSize="4.6" fontWeight="700" fontFamily="Arial, sans-serif" fill="#fff">
        Nintendo
      </text>
    </Badge>
  ),
  playwright: (s) => (
    <Badge size={s} bg="#2ead33" label="Playwright">
      <path d="M7 15.5c1.5-4 3.5-6 5-6s3.5 2 5 6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9.5" cy="10" r="1.2" fill="#fff" />
      <circle cx="14.5" cy="10" r="1.2" fill="#fff" />
    </Badge>
  ),
  in_person: (s) => (
    <Badge size={s} bg="#2f364a" label="En main propre">
      <path d="M6 13.5 9.5 10l3 2 2.5-2.5L18 12.5M9.5 10l-1-1M15 9.5l1-1" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Badge>
  ),
  retro_shop: (s) => (
    <Badge size={s} bg="#2f364a" label="Boutique rétro">
      <path d="M6 10.5h12l-1-3H7zM7 10.5V17h10v-6.5M10.5 17v-3.5h3V17" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </Badge>
  ),
  other: (s) => (
    <Badge size={s} bg="#2f364a" label="Autre">
      <circle cx="8" cy="12" r="1.3" fill="#fff" />
      <circle cx="12" cy="12" r="1.3" fill="#fff" />
      <circle cx="16" cy="12" r="1.3" fill="#fff" />
    </Badge>
  ),
};

const SIMPLE: Record<string, SimpleIcon> = {
  vinted: siVinted,
  ebay: siEbay,
  rakuten: siRakuten,
  fnac: siFnac,
  cloudflare: siCloudflare,
  nextjs: siNextdotjs,
  react: siReact,
  typescript: siTypescript,
  tailwind: siTailwindcss,
  zod: siZod,
  vitest: siVitest,
  pnpm: siPnpm,
  github: siGithub,
  google: siGoogle,
  sqlite: siSqlite,
  claude: siClaude,
};

/** Logo d'une marque connue ; rien si la marque est inconnue. */
export default function BrandLogo({ brand, size = 16 }: { brand: string; size?: number }) {
  const icon = SIMPLE[brand];
  if (icon) return <Simple icon={icon} size={size} />;
  const custom = CUSTOM[brand];
  return custom ? custom(size) : null;
}

const MARKETPLACE_NAMES: Record<string, string> = {
  vinted: "Vinted",
  leboncoin: "Leboncoin",
  ebay: "eBay",
  amazon: "Amazon",
  cdiscount: "Cdiscount",
  rakuten: "Rakuten",
  retro_shop: "Boutique rétro",
  in_person: "En main propre",
  other: "Autre",
  micromania: "Micromania",
};

/** Logo + nom d'une place de marché. */
export function MarketplaceTag({ marketplace, size = 14, className = "" }: { marketplace: string; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <BrandLogo brand={marketplace} size={size} />
      <span>{MARKETPLACE_NAMES[marketplace] ?? marketplace}</span>
    </span>
  );
}
