"use client";

import { useState } from "react";
import type { GameQuotes } from "@/lib/schema";
import { evaluateDeal, VERDICT_COLORS } from "@/lib/deal";

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

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Estimer une annonce
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(
            [
              ["cib", "Boîte"],
              ["loose", "Loose"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setState(value)}
              disabled={!quotes[value]}
              className={`px-3 py-1.5 text-xs transition disabled:opacity-40 ${
                state === value ? "bg-accent-soft text-accent" : "bg-surface text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          placeholder="Prix €"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        {result ? (
          <span
            className="rounded-full px-3 py-1 text-sm font-bold"
            style={{ color: VERDICT_COLORS[result.verdict], backgroundColor: `${VERDICT_COLORS[result.verdict]}20` }}
          >
            {result.label} ({result.deltaPct > 0 ? "+" : ""}
            {result.deltaPct} %)
          </span>
        ) : quote ? (
          <span className="text-xs text-muted">
            cote : {euro(quote.low)} / {euro(quote.median)} / {euro(quote.high)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
