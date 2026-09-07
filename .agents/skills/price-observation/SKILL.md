# Skill : observation de cotes

Une cote = une observation datée et sourcée, jamais une valeur absolue.

## 1. Relever — jamais à la main

```js
// coller scripts/vinted/releve.js dans javascript_tool (onglet Vinted authentifié)
await releve([["spectre", "professeur layton appel du spectre ds", /spectre|specter/i]])
```

Le script écarte accessoires, cartouches nues et exemplaires scellés, interroge les
deux ordres de tri, et rend `n / min / q1 / mediane / q3 / max`. **Relire `controle`**
avant de citer : un exemplaire complet listé là signifie que le filtre sur-exclut.

Un comptage tapé à la volée est interdit — il a produit un chiffre faux envoyé à une
vendeuse le 2026-09-07 (`vinted-hunt/LEARNED.md`). Le classifieur est gardé par
`tests/releve.test.ts`.

## 2. Enregistrer

```bash
pnpm vault add-price --game game_3ds_pokemon-lune \
  --low 25 --median 32 --high 45 --source vinted-fr \
  --notes "n=29 complets, q1 29, q3 45, queue haute 60-70" \
  [--url "https://…"] [--date 2026-08-08] --yes
```

- `low`/`median`/`high` = `q1`/`mediane`/`q3`. **Pas `min` en `low`** : le minimum est
  une annonce isolée, pas le marché — c'est ce qui a fait annoncer « viser 15 € » sur
  un titre dont la médiane est 35 €.
- `source` : `ebay-sold` (ventes réalisées, préféré), `vinted-fr`, `leboncoin`,
  `pricecharting`, `manual`. **PriceCharting seul ne suffit jamais** pour annoncer un
  écart en pourcentage : ses prix PAL sont décorrélés du marché français.
- `notes` : porter `n` et la queue de distribution. Une cote sans son échantillon
  n'est pas relisable dans six mois.
- Met à jour `currentEstimate` de tous les items du jeu + ajoute l'observation à
  l'historique.
- Priorité : jeux à forte valeur (Pokémon, Zelda, éditions rares) d'abord.
