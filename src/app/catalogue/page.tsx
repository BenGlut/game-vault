import { getGameRows, BASE_PATH } from "@/lib/data";
import { buildEntryLinks } from "@/lib/catalog-match";
import { PageTitle } from "@/components/ui";
import CatalogClient from "@/components/CatalogClient";

export default function CatalogPage() {
  // mapping entrée-catalogue → jeu de la base (possédé/wishlist), matching 3 niveaux au build
  const entryLinks = buildEntryLinks(getGameRows());
  return (
    <div>
      <PageTitle
        title="Catalogue"
        sub="Tous les jeux jamais sortis sur 8 consoles Nintendo — recherche et comparaison avec la collection"
      />
      <CatalogClient basePath={BASE_PATH} links={entryLinks} />
    </div>
  );
}