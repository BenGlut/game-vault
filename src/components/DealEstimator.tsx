"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDoc } from "@/lib/data";
import type { GameQuotes, Quote } from "@/lib/schema";
import { evaluateDeal, VERDICT_COLORS } from "@/lib/deal";
import { searchDocs } from "@/lib/fuzzy";

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function euro(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

/**
 * Estimateur de bonne affaire : jeu + état (boîte/loose) + prix affiché → verdict.
 * Pensé pour être utilisé sur téléphone en parcourant Vinted/Leboncoin.
 */
export default function DealEstimator({
  docs,
  quotes,
  covers = {},
}: {
  docs: SearchDoc[];
  quotes: Record<string, GameQuotes>;
  covers?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchDoc | null>(null);
  const [state, setState] = useState<"cib" | "loose">("cib");
  const [price, setPrice] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "n", weight: 2 },
          { name: "a", weight: 1.5 },
          { name: "t", weight: 1 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
      }),
    [docs],
  );

  const suggestions = useMemo(() => {
    const q = norm(query);
    if (!q || selected) return [];
    return searchDocs(docs, fuse, q, 6);
  }, [fuse, docs, query, selected]);

  const quote: Quote | undefined = selected ? quotes[selected.id]?.[state] : undefined;
  const fallbackQuote: Quote | undefined = selected
    ? quotes[selected.id]?.[state === "cib" ? "loose" : "cib"]
    : undefined;
  const priceNum = Number(price.replace(",", "."));
  const result = quote && price && !Number.isNaN(priceNum) ? evaluateDeal(priceNum, quote) : null;

  const input =
    "rounded-lg border border-border bg-surface px-3 py-2 text-text focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative">
        <input
          type="search"
          placeholder="Quel jeu ? Ex.: pokemon perle, zelda albw…"
          value={selected ? selected.t : query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          className={`${input} w-full text-lg`}
        />
        {suggestions.length ? (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface-2 shadow-xl">
            {suggestions.map((s) => (
              <button
                key={s.item.id}
                type="button"
                onClick={() => setSelected(s.item)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface"
              >
                {covers[s.item.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={covers[s.item.id]}
                    alt=""
                    loading="lazy"
                    className="h-12 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-surface text-xs text-muted">
                    ?
                  </div>
                )}
                <span className="min-w-0 truncate">{s.item.t}</span>
                <span className="ml-auto shrink-0 font-mono text-xs uppercase text-muted">
                  {s.item.p}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-accent/40 bg-surface p-4">
          {covers[selected.id] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={covers[selected.id]}
              alt={`Jaquette de ${selected.t}`}
              className="w-20 shrink-0 rounded-lg border border-border shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs text-muted">
              pas de jaquette
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-lg font-semibold">{selected.t}</span>
              {selected.q ? (
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent-soft font-mono text-xs font-bold text-accent">
                  {selected.q}
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono uppercase">
                {selected.p}
              </span>
              {selected.r ? <span>{selected.r}</span> : null}
              {selected.f ? <span>{selected.f}</span> : null}
            </div>
            {selected.a.length ? (
              <div className="mt-1 truncate text-xs text-muted">alias : {selected.a.join(", ")}</div>
            ) : null}
            <div className="mt-2 flex gap-4 text-xs">
              <Link href={`/jeu/${selected.id}/`} className="text-accent underline">
                voir la fiche
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                }}
                className="text-muted underline hover:text-text"
              >
                changer de jeu
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        {(
          [
            ["cib", "Avec boîte (CIB)"],
            ["loose", "Cartouche seule"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setState(value)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
              state === value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-surface text-muted hover:text-text"
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
        placeholder="Prix affiché en € (port inclus idéalement)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className={`${input} mt-4 w-full text-lg`}
      />

      <div className="mt-6">
        {!selected ? (
          <p className="text-center text-sm text-muted">Choisis un jeu pour commencer.</p>
        ) : !quote ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
            Pas encore de cote {state === "cib" ? "avec boîte" : "loose"} pour ce jeu.
            {fallbackQuote ? (
              <span className="mt-1 block">
                (Cote {state === "cib" ? "loose" : "CIB"} connue : {euro(fallbackQuote.low)} /{" "}
                {euro(fallbackQuote.median)} / {euro(fallbackQuote.high)})
              </span>
            ) : (
              <span className="mt-1 block">
                L&apos;agent peut l&apos;ajouter : <code className="font-mono text-xs">pnpm vault add-price</code>
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between rounded-t-lg border border-border bg-surface px-4 py-2 text-sm">
              <span className="text-muted">
                Cote {state === "cib" ? "avec boîte" : "cartouche seule"}
              </span>
              <span className="font-mono">
                {euro(quote.low)} · <span className="text-accent">{euro(quote.median)}</span> ·{" "}
                {euro(quote.high)}
              </span>
            </div>
            {result ? (
              <div
                className="rounded-b-lg border border-t-0 border-border px-4 py-6 text-center"
                style={{ backgroundColor: `${VERDICT_COLORS[result.verdict]}18` }}
              >
                <div className="text-3xl font-bold" style={{ color: VERDICT_COLORS[result.verdict] }}>
                  {result.label}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {result.deltaPct > 0 ? "+" : ""}
                  {result.deltaPct} % par rapport à la médiane
                </div>
              </div>
            ) : (
              <div className="rounded-b-lg border border-t-0 border-border bg-surface px-4 py-6 text-center text-sm text-muted">
                Saisis le prix affiché pour obtenir le verdict.
              </div>
            )}
            <p className="mt-3 text-center text-xs text-muted">
              Source : {quote.source} ({quote.observedAt}) — une cote est une observation datée,
              jamais une valeur absolue.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
