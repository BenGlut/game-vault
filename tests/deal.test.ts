import { describe, it, expect } from "vitest";
import { evaluateDeal } from "../src/lib/deal";
import type { Quote } from "../src/lib/schema";

// Cote type : jeu DS à 20/30/45 € (basse/médiane/haute)
const quote: Quote = {
  low: 20,
  median: 30,
  high: 45,
  currency: "EUR",
  source: "test",
  observedAt: "2026-08-08",
};

describe("evaluateDeal", () => {
  it("prix ≤ cote basse → très bon plan", () => {
    expect(evaluateDeal(15, quote).verdict).toBe("tres_bon_plan");
    expect(evaluateDeal(20, quote).verdict).toBe("tres_bon_plan");
  });
  it("prix ≤ 90 % de la médiane → bon plan", () => {
    expect(evaluateDeal(25, quote).verdict).toBe("bon_plan");
    expect(evaluateDeal(27, quote).verdict).toBe("bon_plan");
  });
  it("prix autour de la médiane (±10 %) → correct", () => {
    expect(evaluateDeal(28, quote).verdict).toBe("correct");
    expect(evaluateDeal(30, quote).verdict).toBe("correct");
    expect(evaluateDeal(33, quote).verdict).toBe("correct");
  });
  it("prix entre médiane+10 % et haute → un peu cher", () => {
    expect(evaluateDeal(40, quote).verdict).toBe("un_peu_cher");
    expect(evaluateDeal(45, quote).verdict).toBe("un_peu_cher");
  });
  it("prix > cote haute → mauvais deal", () => {
    expect(evaluateDeal(46, quote).verdict).toBe("mauvais_deal");
    expect(evaluateDeal(80, quote).verdict).toBe("mauvais_deal");
  });
  it("calcule l'écart en % par rapport à la médiane", () => {
    expect(evaluateDeal(15, quote).deltaPct).toBe(-50);
    expect(evaluateDeal(33, quote).deltaPct).toBe(10);
  });
});
