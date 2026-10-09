import type { GameQuotes, PriceObservation } from "./schema";

/**
 * Dernière cote par variante (cib / loose) pour chaque jeu — même règle que
 * `latestQuotes` de la CLI : une observation « any » ne sert que si aucune
 * observation spécifique à la variante n'existe.
 */
export function quotesByGame(observations: PriceObservation[]): Map<string, GameQuotes> {
  const byGame = new Map<string, PriceObservation[]>();
  for (const o of observations) byGame.set(o.gameId, [...(byGame.get(o.gameId) ?? []), o]);

  const out = new Map<string, GameQuotes>();
  for (const [gameId, list] of byGame) {
    const sorted = [...list].sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1));
    const quotes: GameQuotes = {};
    for (const variant of ["cib", "loose"] as const) {
      const candidates = sorted.filter((p) => p.variant === variant || p.variant === "any");
      const obs = candidates.find((p) => p.variant === variant) ?? candidates[0];
      if (!obs) continue;
      const median = obs.median ?? (obs.low !== null && obs.high !== null ? (obs.low + obs.high) / 2 : null);
      if (median === null) continue;
      quotes[variant] = {
        low: obs.low ?? median,
        median,
        high: obs.high ?? median,
        currency: obs.currency,
        source: obs.source,
        observedAt: obs.observedAt,
      };
    }
    if (quotes.cib || quotes.loose) out.set(gameId, quotes);
  }
  return out;
}

/** Cote de référence d'un exemplaire : boîte si connue (la collection est en boîte), sinon loose. */
export function referenceValue(quotes: GameQuotes | undefined, completeness?: string): number | null {
  if (!quotes) return null;
  if (completeness === "loose") return quotes.loose?.median ?? quotes.cib?.median ?? null;
  return quotes.cib?.median ?? quotes.loose?.median ?? null;
}
