import { getSearchIndex, getQuotes } from "@/lib/data";
import { PageTitle } from "@/components/ui";
import DealEstimator from "@/components/DealEstimator";

export default function EstimatorPage() {
  const docs = getSearchIndex();
  const quotes = getQuotes();
  return (
    <div>
      <PageTitle
        title="Estimateur"
        sub="Bon plan ou pas ? Jeu + état + prix affiché → verdict (pensé pour Vinted/Leboncoin)"
      />
      <DealEstimator docs={docs} quotes={quotes} />
    </div>
  );
}
