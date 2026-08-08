import { getSearchIndex } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  const docs = getSearchIndex();
  return (
    <div>
      <PageTitle
        title="Recherche"
        sub="Tolérante aux fautes, accents, titres FR/EN, abréviations et plateformes"
      />
      <SearchClient docs={docs} />
    </div>
  );
}
