/** Navigation de l'application, groupée par usage. */
export interface NavItem {
  href: string;
  label: string;
  group: "Vue d’ensemble" | "Collection" | "Achats";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Tableau de bord", group: "Vue d’ensemble" },
  { href: "/statistiques", label: "Statistiques", group: "Vue d’ensemble" },
  { href: "/historique", label: "Historique", group: "Vue d’ensemble" },
  { href: "/collection", label: "Ma collection", group: "Collection" },
  { href: "/wishlist", label: "Wishlist", group: "Collection" },
  { href: "/catalogue", label: "Catalogue", group: "Collection" },
  { href: "/commandes", label: "Commandes", group: "Achats" },
  { href: "/estimateur", label: "Estimateur", group: "Achats" },
];

/** Barre du bas sur téléphone : 4 raccourcis + « Plus ». */
export const MOBILE_TABS = ["/", "/collection", "/wishlist", "/commandes"];

export function isActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? p === "/" : p === href || p.startsWith(`${href}/`);
}
