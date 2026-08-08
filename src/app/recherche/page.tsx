import { getSearchIndex, coverUrl } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  const docs = getSearchIndex();
  const covers = Object.fromEntries(
    docs.map((d) => [d.id, coverUrl(d.id)]).filter(([, url]) => url !== null),
  ) as Record<string, string>;
  return (
    <div>
      <PageTitle
        title="Recherche"
        sub="Tolérante aux fautes, accents, titres FR/EN, abréviations et plateformes"
      />
      <SearchClient docs={docs} covers={covers} />
    </div>
  );
}
