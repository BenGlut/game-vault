import { getGameRows, getQuotes, getOrdersByGame, BASE_PATH, CATALOG_COVERS_BASE, type GameRow } from "@/lib/data";
import { buildEntryLinks } from "@/lib/catalog-match";
import { PageTitle } from "@/components/ui";
import { GameDrawerProvider } from "@/components/GameDrawer";
import CatalogClient from "@/components/CatalogClient";

export default function CatalogPage() {
  const rows = getGameRows();
  // mapping entrée-catalogue → jeu de la base (possédé/wishlist), matching 3 niveaux au build
  const entryLinks = buildEntryLinks(rows);
  // fiches complètes des jeux de la base : le panneau du catalogue est alors
  // exactement celui de la collection (exemplaires, cotes, métadonnées).
  const gameRows: Record<string, GameRow> = {};
  for (const row of rows) gameRows[row.game.id] = row;
  return (
    <div>
      <PageTitle
        title="Catalogue"
        sub="Tous les jeux jamais sortis sur les consoles Nintendo, sorties en boîte et dématérialisées séparées — recherche et comparaison avec la collection"
      />
      <GameDrawerProvider quotes={getQuotes()} orders={getOrdersByGame()}>
        <CatalogClient basePath={BASE_PATH} coversBase={CATALOG_COVERS_BASE} links={entryLinks} rows={gameRows} />
      </GameDrawerProvider>
    </div>
  );
}
