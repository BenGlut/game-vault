import { getGameRows } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import CollectionExplorer from "@/components/CollectionExplorer";

export default function CollectionPage() {
  const rows = getGameRows();
  return (
    <div>
      <PageTitle title="Collection" sub="Tous les jeux référencés, filtrables" />
      <CollectionExplorer rows={rows} />
    </div>
  );
}
