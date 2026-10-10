/**
 * Format physique des boîtes par console : proportion de la jaquette, couleur de
 * la marque et disposition du panneau. Une boîte N64 est en paysage, une boîte GBA
 * carrée, un boîtier Switch tout en hauteur : chaque fiche suit son support.
 */

export type CoverLayout = "portrait" | "square" | "landscape";

export interface PlatformFormat {
  /** largeur / hauteur de la jaquette */
  ratio: number;
  layout: CoverLayout;
  /** couleur de la gamme, pour le fond de la fiche */
  tint: string;
  /** nom du boîtier affiché sous la jaquette */
  caseLabel: string;
}

const F = (ratio: number, tint: string, caseLabel: string): PlatformFormat => ({
  ratio,
  layout: ratio > 1.25 ? "landscape" : ratio > 0.85 ? "square" : "portrait",
  tint,
  caseLabel,
});

export const PLATFORM_FORMATS: Record<string, PlatformFormat> = {
  // proportions mesurées sur les jaquettes réelles (libretro, packshots eShop), oct. 2026
  switch: F(0.62, "#e60012", "Boîtier Nintendo Switch"),
  "switch-digital": F(1, "#e60012", "Version dématérialisée"),
  switch2: F(0.62, "#e60012", "Boîtier Nintendo Switch 2"),
  "switch2-digital": F(1, "#e60012", "Version dématérialisée"),
  "3ds": F(1.14, "#d12228", "Jaquette Nintendo 3DS"),
  ds: F(1.11, "#9aa3b2", "Jaquette Nintendo DS"),
  gba: F(1, "#5b3fa8", "Boîte carton Game Boy Advance"),
  gbc: F(1, "#7c3aed", "Boîte carton Game Boy Color"),
  gb: F(0.97, "#6b8e23", "Boîte carton Game Boy"),
  n64: F(1.43, "#1f6f43", "Boîte carton Nintendo 64"),
  gamecube: F(0.71, "#5a4fcf", "Boîtier GameCube"),
  wii: F(0.71, "#d9dde4", "Boîtier Wii"),
  wiiu: F(0.71, "#2b9bd6", "Boîtier Wii U"),
  snes: F(1.38, "#7f7f9b", "Boîte carton Super Nintendo"),
  nes: F(0.72, "#c0392b", "Boîte carton NES"),
  ps1: F(0.88, "#4a5568", "Boîtier PlayStation"),
  ps2: F(0.71, "#2b4c9b", "Boîtier PlayStation 2"),
  ps3: F(0.86, "#1f2937", "Boîtier PlayStation 3"),
  ps4: F(0.81, "#1e40af", "Boîtier PlayStation 4"),
  ps5: F(0.81, "#e5e7eb", "Boîtier PlayStation 5"),
  psp: F(0.57, "#111827", "Boîtier PSP"),
  x360: F(0.71, "#15803d", "Boîtier Xbox 360"),
  xone: F(0.81, "#15803d", "Boîtier Xbox One"),
};

export const DEFAULT_FORMAT: PlatformFormat = F(0.75, "#f5b642", "Boîte");

export function formatOf(platformId: string | undefined | null): PlatformFormat {
  return (platformId && PLATFORM_FORMATS[platformId]) || DEFAULT_FORMAT;
}

/**
 * Image d'origine redimensionnée à la volée (wsrv.nl, cache CDN) : la largeur
 * demandée suit la taille affichée × densité d'écran, plus de jaquette floue.
 */
export function resized(url: string, width: number): string {
  const bare = url.replace(/^https?:\/\//, "");
  return `https://wsrv.nl/?url=${encodeURIComponent(bare)}&w=${width}&we&output=webp&q=82`;
}
