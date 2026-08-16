import { getGameRows, getPlatforms, getQuotes, getOrdersByGame, inCollection } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import CollectionExplorer from "@/components/CollectionExplorer";
import { GameDrawerProvider } from "@/components/GameDrawer";

export default function CollectionPage() {
  // la Collection = exemplaire réel : possédé, reçu, ou en cours d'acheminement.
  // Une ligne seulement remboursée ou annulée reste dans l'historique des commandes
  // mais ne fait pas entrer le jeu ici ; la wishlist vit sur ses propres pages.
  const rows = getGameRows().filter(inCollection);
  return (
    <div>
      <PageTitle
        title="Collection"
        sub="Les jeux que tu possèdes ou as commandés — la wishlist a sa propre page"
      />
      <GameDrawerProvider quotes={getQuotes()} orders={getOrdersByGame()}>
        <CollectionExplorer rows={rows} allPlatforms={getPlatforms()} />
      </GameDrawerProvider>
    </div>
  );
}
