/**
 * Libellés d'affichage — module PUR (aucun accès disque) pour rester
 * importable depuis les composants client.
 */

export const STATUS_LABELS: Record<string, string> = {
  owned: "Possédé",
  ordered: "Commandé",
  fulfilled: "Expédié",
  delivered: "Reçu",
  wishlist: "Wishlist",
  duplicate: "Doublon",
  sold: "Vendu",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

export const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  very_good: "Très bon",
  good: "Bon",
  acceptable: "Acceptable",
  poor: "Abîmé",
  unknown: "Non renseigné",
};

export const COMPLETENESS_LABELS: Record<string, string> = {
  CIB: "Complet (CIB)",
  loose: "Loose",
  no_manual: "Sans notice",
  box_only: "Boîte seule",
  sealed: "Sous blister",
  code_in_box: "Code in box",
  unknown: "Non renseigné",
};

/** Statuts d'inventaire correspondant à une possession réelle. */
export const POSSESSION = ["owned", "delivered", "duplicate"];

export function euro(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}
