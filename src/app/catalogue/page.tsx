import { getGameRows, BASE_PATH, POSSESSION } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import CatalogClient, { type CatalogGameLink } from "@/components/CatalogClient";
import { normalizeTitle } from "@/lib/normalize";

export default function CatalogPage() {
  // plateforme:titre-normalisé (canonique + alias) → fiche jeu + statut réel
  const links: Record<string, CatalogGameLink> = {};
  for (const row of getGameRows()) {
    const owned = row.items.some((i) => POSSESSION.includes(i.status));
    const wishlist = row.items.some((i) => i.status === "wishlist");
    const keys = [
      `${row.game.platformId}:${row.game.normalizedTitle}`,
      ...row.game.aliases.map((a) => `${row.game.platformId}:${normalizeTitle(a)}`),
    ];
    for (const key of keys)
      links[key] = { id: row.game.id, owned, wishlist, quality: row.game.qualityTier };
  }
  return (
    <div>
      <PageTitle
        title="Catalogue"
        sub="Tous les jeux jamais sortis sur 5 consoles Nintendo — recherche et comparaison avec la collection"
      />
      <CatalogClient basePath={BASE_PATH} links={links} />
    </div>
  );
}
