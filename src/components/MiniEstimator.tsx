"use client";

import { useState } from "react";
import type { GameQuotes } from "@/lib/schema";
import { evaluateDeal } from "@/lib/deal";
import { Badge, Segmented, VERDICT_TONES } from "@/components/ui/primitives";

function euro(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

/** Estimateur compact intégré à la fiche jeu : état + prix → verdict immédiat. */
export default function MiniEstimator({ quotes }: { quotes: GameQuotes }) {
  const [state, setState] = useState<"cib" | "loose">(quotes.cib ? "cib" : "loose");
  const [price, setPrice] = useState("");
  const quote = quotes[state];
  const priceNum = Number(price.replace(",", "."));
  const result = quote && price && !Number.isNaN(priceNum) ? evaluateDeal(priceNum, quote) : null;
  const options = (
    [
      ["cib", "Boîte"],
      ["loose", "Loose"],
    ] as const
  )
    .filter(([v]) => quotes[v])
    .map(([value, label]) => ({ value, label }));

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2/60 p-3">
      <div className="mb-2 text-xs font-medium text-text-2">Estimer une annonce</div>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented<"cib" | "loose"> label="État de l’annonce" value={state} onChange={setState} options={options} />
        <label className="relative">
          <span className="sr-only">Prix affiché en euros</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-9 w-24 rounded-lg border border-border bg-surface pl-3 pr-6 text-[13px] outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">€</span>
        </label>
        {result ? (
          <Badge tone={VERDICT_TONES[result.verdict]} size="lg" strong>
            {result.label} · {result.deltaPct > 0 ? "+" : ""}
            {result.deltaPct} %
          </Badge>
        ) : quote ? (
          <span className="text-xs text-muted">
            cote {euro(quote.low)} · {euro(quote.median)} · {euro(quote.high)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
