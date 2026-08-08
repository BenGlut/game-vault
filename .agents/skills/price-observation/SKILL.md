# Skill : observation de cotes

Une cote = une observation datée et sourcée, jamais une valeur absolue.

```bash
pnpm vault add-price --game game_3ds_pokemon-lune \
  --low 25 --median 32 --high 45 --source ebay-sold \
  [--url "https://…"] [--date 2026-08-08] --yes
```

- `source` : `ebay-sold` (ventes réalisées, préféré), `vinted`, `leboncoin`, `pricecharting`, `manual`…
- Met à jour `currentEstimate` de tous les items du jeu + ajoute l'observation à l'historique.
- Fournir au moins low/median/high crédibles ; ne pas inventer une fourchette sans données.
- Base : privilégier les jeux à forte valeur (Pokémon, Zelda, éditions rares) d'abord.
