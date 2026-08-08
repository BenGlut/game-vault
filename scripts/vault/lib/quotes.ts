import type { Vault } from "./store";
import type { GameQuotes } from "../../../src/lib/schema";

/**
 * Dernière observation par variante (cib/loose) pour un jeu.
 * Une observation "any" alimente une variante seulement si aucune observation
 * spécifique n'existe.
 */
export function latestQuotes(v: Vault, gameId: string): GameQuotes {
  const quotes: GameQuotes = {};
  for (const variant of ["cib", "loose"] as const) {
    const candidates = v.priceObservations
      .filter((p) => p.gameId === gameId && (p.variant === variant || p.variant === "any"))
      .sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1));
    const specific = candidates.find((p) => p.variant === variant);
    const obs = specific ?? candidates[0];
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
  return quotes;
}
