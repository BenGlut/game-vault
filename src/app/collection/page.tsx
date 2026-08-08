import { getGameRows, getPlatforms } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import CollectionExplorer from "@/components/CollectionExplorer";

export default function CollectionPage() {
  // la Collection = possession réelle (possédé/commandé/reçu/vendu…) ;
  // les jeux uniquement en wishlist vivent sur les pages Wishlist et Recommandations
  const rows = getGameRows().filter((r) =>
    r.items.some((i) => i.status !== "wishlist"),
  );
  return (
    <div>
      <PageTitle
        title="Collection"
        sub="Les jeux que tu possèdes ou as commandés — la wishlist a sa propre page"
      />
      <CollectionExplorer rows={rows} allPlatforms={getPlatforms()} />
    </div>
  );
}
