import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Contrastes WCAG des deux thèmes, lus directement dans src/app/globals.css :
 * texte ≥ 4.5:1, éléments graphiques (séries, contours de pastilles) ≥ 3:1.
 */
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function block(selector: RegExp): Record<string, string> {
  const m = css.match(selector);
  if (!m) throw new Error(`bloc introuvable : ${selector}`);
  return Object.fromEntries([...m[1]!.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1]!, x[2]!.toLowerCase()]));
}

const THEMES = {
  dark: block(/:root,\s*\[data-theme="dark"\]\s*\{([^}]*)\}/),
  light: block(/\n\[data-theme="light"\]\s*\{([^}]*)\}/),
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** mélange d'une couleur sur un fond (pastilles teintées à 12 %) */
function mix(fg: string, bg: string, alpha: number): string {
  const c = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return `#${[1, 3, 5].map((i) => Math.round(c(fg, i) * alpha + c(bg, i) * (1 - alpha)).toString(16).padStart(2, "0")).join("")}`;
}

describe.each(Object.entries(THEMES))("thème %s", (_name, t) => {
  const surfaces = ["bg", "bg-elev", "surface", "surface-2"] as const;

  it("texte principal, secondaire et légendes lisibles sur toutes les surfaces", () => {
    for (const s of surfaces) {
      expect(contrast(t.text!, t[s]!)).toBeGreaterThanOrEqual(7);
      expect(contrast(t["text-2"]!, t[s]!)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted!, t[s]!)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("couleurs d'état lisibles en texte, y compris sur leur propre pastille teintée", () => {
    for (const key of ["accent", "ok", "ko", "info", "special"]) {
      for (const s of surfaces) expect(contrast(t[key]!, t[s]!), `${key} sur ${s}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t[key]!, mix(t[key]!, t.surface!, 0.12)), `${key} sur sa pastille`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("aplats : texte de marque sur l'ambre, texte sur les pastilles de tier pleines", () => {
    expect(contrast(t["brand-ink"]!, t.brand!)).toBeGreaterThanOrEqual(7);
    expect(contrast(t["brand-ink"]!, t["brand-strong"]!)).toBeGreaterThanOrEqual(7);
    // tiers S (marque), A (ok), B (info), C (muted), D (ko) : lettre en on-fill
    for (const key of ["ok", "info", "muted", "ko"]) {
      expect(contrast(t["on-fill"]!, t[key]!), `tier sur ${key}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("palette des graphiques : chaque série ≥ 3:1 sur la surface des cartes", () => {
    for (let i = 1; i <= 8; i++) {
      expect(contrast(t[`series-${i}`]!, t.surface!), `series-${i}`).toBeGreaterThanOrEqual(3);
    }
    expect(contrast(t["chart-accent"]!, t.surface!)).toBeGreaterThanOrEqual(3);
  });

  it("contour des champs et cartes perceptible", () => {
    expect(contrast(t["border-strong"]!, t.surface!)).toBeGreaterThanOrEqual(1.4);
  });
});
