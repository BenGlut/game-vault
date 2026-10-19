# Écrire dans la base : MCP ou CLI d'abord

**Règle.** Pour modifier les données, passer par les outils MCP `gamevault` (base en ligne)
ou par `pnpm vault <commande>`. N'éditer `data/*.json` à la main que si ni l'un ni l'autre ne
sait exprimer le changement, puis lancer `pnpm vault validate` aussitôt.

**Pourquoi.** La CLI et l'API garantissent la validation Zod, l'intégrité des références, le
journal des modifications et les sauvegardes. L'édition directe est permise depuis le
2026-08-11, mais elle saute ces garde-fous.

**Comment.**
- Outils MCP : écrivent directement dans D1 (acteur `mcp` dans le journal), sans pull ni push.
- CLI : `pnpm d1 pull` AVANT toute mutation `pnpm vault` (rapatrie les modifications faites en
  ligne) ; `pnpm d1 push` APRÈS le commit (il refuse si D1 contient des modifications non
  rapatriées).
- Dry-run d'abord, lire le diff, puis `--yes`.
- Commandes : les `unitPrice` incluent port et protection, sinon le contrôle d'intégrité du
  `d1 pull` échoue.
