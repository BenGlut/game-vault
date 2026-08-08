# Skill : mutation d'inventaire

Ajouter/modifier jeux et exemplaires. JAMAIS d'édition manuelle des JSON.

```bash
# 1. dry-run (défaut) → lire le diff ; 2. relancer avec --yes
pnpm vault add-game --title "Mario Kart DS" --platform ds --franchise "Mario Kart" [--aliases "a|b"] [--region PAL-FR]
pnpm vault add-inventory --game game_ds_mario-kart-ds --status owned [--quantity 1] [--condition very_good] [--completeness CIB] [--price 12] [--verified]
pnpm vault set-status --inventory inv_… --status owned|wishlist|sold|duplicate [--quantity N] [--verified true] [--quantity-reviewed true]
```

- Doublon détecté → la commande refuse ; ne forcer (`--force`) que pour une édition réellement distincte.
- Vu physiquement → `--verified` ; sinon l'item reste `needs_review`.
- Quantité > 1 uniquement avec preuve (`--quantity-reviewed true` lève le flag).
- Après mutation : `pnpm vault validate && pnpm vault publish`.
