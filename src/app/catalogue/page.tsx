import { getGames, BASE_PATH } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import CatalogClient from "@/components/CatalogClient";
import { normalizeTitle } from "@/lib/normalize";

export default function CatalogPage() {
  // clés de possession : plateforme:titre-normalisé (titre canonique + alias)
  const ownedKeys = [
    ...new Set(
      getGames().flatMap((g) => [
        `${g.platformId}:${g.normalizedTitle}`,
        ...g.aliases.map((a) => `${g.platformId}:${normalizeTitle(a)}`),
      ]),
    ),
  ];
  return (
    <div>
      <PageTitle
        title="Catalogue"
        sub="Tous les jeux DS, 3DS et Game Boy Advance jamais sortis — recherche et comparaison avec la collection"
      />
      <CatalogClient basePath={BASE_PATH} ownedKeys={ownedKeys} />
    </div>
  );
}
