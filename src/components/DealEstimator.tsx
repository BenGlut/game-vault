"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchDoc } from "@/lib/search";
import type { GameQuotes, Quote } from "@/lib/schema";
import { evaluateDeal } from "@/lib/deal";
import { searchDocs } from "@/lib/fuzzy";
import { ChevronRightIcon, TagIcon, XIcon } from "@/components/icons";
import { Card, EmptyState, Segmented, TONE_PANEL, TONE_TEXT, TierBadge, VERDICT_TONES, cx } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/fields";

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

/** Fourchette de cote basse → haute avec la médiane et le prix saisi. */
function QuoteRange({ quote, price }: { quote: Quote; price: number | null }) {
  const lo = Math.min(quote.low, price ?? quote.low) * 0.9;
  const hi = Math.max(quote.high, price ?? quote.high) * 1.08;
  const pos = (v: number) => `${((v - lo) / (hi - lo || 1)) * 100}%`;
  return (
    <div className="pt-6" aria-hidden>
      <div className="relative h-2 rounded-full bg-surface-3">
        <div className="absolute inset-y-0 rounded-full bg-ok/35" style={{ left: pos(quote.low), width: `calc(${pos(quote.high)} - ${pos(quote.low)})` }} />
        <div className="absolute -top-1 h-4 w-0.5 rounded bg-text-2" style={{ left: pos(quote.median) }} />
        {price !== null ? (
          <div className="absolute -top-6 -translate-x-1/2 text-center" style={{ left: pos(price) }}>
            <span className="rounded bg-text px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-bg">{euro(price)}</span>
            <span className="mx-auto mt-0.5 block h-3 w-0.5 bg-text" />
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted">
        <span>basse {euro(quote.low)}</span>
        <span>médiane {euro(quote.median)}</span>
        <span>haute {euro(quote.high)}</span>
      </div>
    </div>
  );
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
  const [cursor, setCursor] = useState(0);

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
  const fallbackQuote: Quote | undefined = selected ? quotes[selected.id]?.[state === "cib" ? "loose" : "cib"] : undefined;
  const priceNum = Number(price.replace(",", "."));
  const validPrice = price && !Number.isNaN(priceNum) ? priceNum : null;
  const result = quote && validPrice !== null ? evaluateDeal(validPrice, quote) : null;
  const tone = result ? VERDICT_TONES[result.verdict] ?? "neutral" : "neutral";

  function pick(doc: SearchDoc) {
    setSelected(doc);
    setCursor(0);
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card title="L’annonce" subtitle="Le jeu, son état et le prix demandé">
        <div className="space-y-4">
          {selected ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 p-3">
              {covers[selected.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={covers[selected.id]} alt={`Jaquette de ${selected.t}`} className="w-14 shrink-0 rounded-md ring-1 ring-[var(--cover-ring)]" />
              ) : (
                <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-md bg-surface-3 text-[10px] text-muted">sans jaquette</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <TierBadge tier={selected.q} size="sm" />
                  <span className="truncate text-sm font-semibold">{selected.t}</span>
                </div>
                <div className="mt-0.5 text-xs uppercase text-muted">
                  {selected.p}
                  {selected.r ? <span className="normal-case"> · {selected.r}</span> : null}
                </div>
                <Link href={`/jeu/?id=${encodeURIComponent(selected.id)}`} className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-accent hover:underline">
                  Voir la fiche <ChevronRightIcon size={12} />
                </Link>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                }}
                aria-label="Changer de jeu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-3 hover:text-text"
              >
                <XIcon size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <label className="mb-1.5 block text-xs font-medium text-text-2" htmlFor="estimateur-jeu">
                Quel jeu ?
              </label>
              <input
                id="estimateur-jeu"
                type="search"
                placeholder="Ex. : pokemon perle, zelda albw…"
                value={query}
                autoComplete="off"
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-controls="estimateur-suggestions"
                aria-activedescendant={suggestions.length ? `estimateur-opt-${cursor}` : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (!suggestions.length) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(suggestions.length - 1, c + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(0, c - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    pick(suggestions[cursor]!.item);
                  }
                }}
                className={cx(inputClass.replace("h-9", "h-11"), "text-[15px]")}
              />
              {suggestions.length ? (
                <ul id="estimateur-suggestions" role="listbox" className="animate-pop absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border-strong bg-bg-elev p-1 shadow-[var(--shadow-pop)]">
                  {suggestions.map((s, i) => (
                    <li
                      key={s.item.id}
                      id={`estimateur-opt-${i}`}
                      role="option"
                      aria-selected={i === cursor}
                      onMouseMove={() => setCursor(i)}
                      onClick={() => pick(s.item)}
                      className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[13px]", i === cursor && "bg-surface-2")}
                    >
                      {covers[s.item.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={covers[s.item.id]} alt="" loading="lazy" className="h-10 w-8 shrink-0 rounded object-cover ring-1 ring-[var(--cover-ring)]" />
                      ) : (
                        <div className="h-10 w-8 shrink-0 rounded bg-surface-3" />
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">{s.item.t}</span>
                      <span className="shrink-0 text-xs uppercase text-muted">{s.item.p}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          <div>
            <span className="mb-1.5 block text-xs font-medium text-text-2">État</span>
            <Segmented<"cib" | "loose">
              label="État de l’annonce"
              value={state}
              onChange={setState}
              options={[
                { value: "cib", label: "Avec boîte" },
                { value: "loose", label: "Cartouche seule" },
              ]}
            />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-2">Prix affiché, port compris si possible</span>
            <span className="relative block">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={cx(inputClass.replace("h-9", "h-11"), "pr-8 text-[15px] tabular-nums")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
            </span>
          </label>
        </div>
      </Card>

      <section aria-live="polite" aria-label="Verdict">
        {!selected ? (
          <EmptyState title="Choisissez un jeu pour commencer" icon={<TagIcon size={18} />}>
            Tapez quelques lettres du titre : les fautes et abréviations sont comprises.
          </EmptyState>
        ) : !quote ? (
          <Card>
            <p className="text-sm font-medium">Pas encore de cote {state === "cib" ? "avec boîte" : "en loose"} pour ce jeu.</p>
            <p className="mt-1 text-[13px] text-muted">
              {fallbackQuote
                ? `Cote ${state === "cib" ? "loose" : "avec boîte"} connue : ${euro(fallbackQuote.low)} · ${euro(fallbackQuote.median)} · ${euro(fallbackQuote.high)}.`
                : "Aucune cote relevée pour l’instant."}
            </p>
          </Card>
        ) : (
          <div className={cx("rounded-xl border p-5 shadow-[var(--shadow-card)] transition-colors", result ? TONE_PANEL[tone] : "border-border bg-surface")}>
            <div className="text-xs font-medium text-muted">Verdict</div>
            {result ? (
              <>
                <div className={cx("mt-1 text-[32px] font-semibold leading-tight tracking-[-0.02em]", TONE_TEXT[tone])}>{result.label}</div>
                <div className="mt-1 text-sm text-text-2">
                  {result.deltaPct > 0 ? "+" : ""}
                  {result.deltaPct} % par rapport à la médiane
                </div>
              </>
            ) : (
              <div className="mt-1 text-[15px] font-medium text-text-2">Saisissez le prix affiché pour obtenir le verdict.</div>
            )}
            <QuoteRange quote={quote} price={validPrice} />
            <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted">
              Cote {state === "cib" ? "avec boîte" : "cartouche seule"} · {quote.source}, relevé du {quote.observedAt}. Une cote est une observation datée, jamais
              une valeur absolue.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
