import type { Quote } from "./schema";

/**
 * Moteur de verdict "bonne affaire" — partagé par la CLI (`pnpm vault deal`),
 * la page Estimateur et la fiche jeu.
 *
 * Seuils par rapport à la cote de la MÊME variante (CIB ou loose) :
 *   prix ≤ basse            → très bon plan
 *   prix ≤ 90 % médiane     → bon plan
 *   prix ≤ 110 % médiane    → correct
 *   prix ≤ haute            → un peu cher
 *   au-delà                 → mauvais deal
 */

export type Verdict = "tres_bon_plan" | "bon_plan" | "correct" | "un_peu_cher" | "mauvais_deal";

export interface DealResult {
  verdict: Verdict;
  label: string;
  /** écart en % par rapport à la médiane (négatif = moins cher) */
  deltaPct: number;
  quote: Quote;
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  tres_bon_plan: "Très bon plan",
  bon_plan: "Bon plan",
  correct: "Correct",
  un_peu_cher: "Un peu cher",
  mauvais_deal: "Mauvais deal",
};

export const VERDICT_COLORS: Record<Verdict, string> = {
  tres_bon_plan: "#4ade80",
  bon_plan: "#86efac",
  correct: "#f5b642",
  un_peu_cher: "#fb923c",
  mauvais_deal: "#f87171",
};

export function evaluateDeal(price: number, quote: Quote): DealResult {
  const deltaPct = Math.round(((price - quote.median) / quote.median) * 100);
  let verdict: Verdict;
  if (price <= quote.low) verdict = "tres_bon_plan";
  else if (price <= quote.median * 0.9) verdict = "bon_plan";
  else if (price <= quote.median * 1.1) verdict = "correct";
  else if (price <= quote.high) verdict = "un_peu_cher";
  else verdict = "mauvais_deal";
  return { verdict, label: VERDICT_LABELS[verdict], deltaPct, quote };
}
