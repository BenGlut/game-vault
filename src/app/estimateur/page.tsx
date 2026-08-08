import { getSearchIndex, getQuotes, coverUrl } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import DealEstimator from "@/components/DealEstimator";

export default function EstimatorPage() {
  const docs = getSearchIndex();
  const quotes = getQuotes();
  const covers = Object.fromEntries(
    docs.map((d) => [d.id, coverUrl(d.id)]).filter(([, url]) => url !== null),
  ) as Record<string, string>;
  return (
    <div>
      <PageTitle
        title="Estimateur"
        sub="Bon plan ou pas ? Jeu + état + prix affiché → verdict (pensé pour Vinted/Leboncoin)"
      />
      <DealEstimator docs={docs} quotes={quotes} covers={covers} />
    </div>
  );
}
