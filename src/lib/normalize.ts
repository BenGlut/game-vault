/**
 * Normalisation des titres — règle d'intégrité n°1.
 * Sert à la détection de doublons et à la recherche tolérante.
 */
export function normalizeTitle(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Slug stable pour les identifiants (game_xxx, inv_xxx). */
export function slugify(input: string): string {
  return normalizeTitle(input).replace(/\s+/g, "-");
}

/** Id déterministe d'un jeu : game_<plateforme>_<slug>. */
export function gameId(platformId: string, canonicalTitle: string): string {
  return `game_${platformId}_${slugify(canonicalTitle)}`;
}

/** Id déterministe d'un item d'inventaire dérivé du jeu. */
export function inventoryId(gid: string): string {
  return gid.replace(/^game_/, "inv_");
}
