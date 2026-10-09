"use client";

import { useMemo } from "react";
import type { GameQuotes } from "@/lib/schema";
import { toSearchDoc } from "@/lib/search";
import DealEstimator from "@/components/DealEstimator";
import { PageHeader } from "@/components/ui/primitives";
import { useVault } from "@/components/vault/VaultProvider";
import { coverUrl } from "@/components/vault/model";

/** Bon plan ou pas ? Jeu + état + prix affiché → verdict, à partir des cotes en direct. */
export default function EstimatorView() {
  const { data, stats } = useVault();
  const docs = useMemo(() => data.games.map(toSearchDoc), [data.games]);
  const quotes = useMemo(() => {
    const out: Record<string, GameQuotes> = {};
    for (const r of stats.rows) if (r.quotes) out[r.game.id] = r.quotes;
    return out;
  }, [stats.rows]);
  const covers = useMemo(() => Object.fromEntries(data.games.map((g) => [g.id, coverUrl(g.id)])), [data.games]);

  return (
    <div className="animate-page">
      <PageHeader title="Estimateur" subtitle="Bon plan ou pas ? Le jeu, l’état et le prix affiché donnent un verdict immédiat" />
      <DealEstimator docs={docs} quotes={quotes} covers={covers} />
    </div>
  );
}
