# Workflows agent

## Après CHAQUE session de mutation

```bash
git -C ../game-vault-data pull && git pull        # 1. sync
# 2. mutations via pnpm vault (dry-run → --yes)
pnpm vault validate                                # 3. intégrité
pnpm test                                          # 4. tests
pnpm vault publish                                 # 5. export public
pnpm build                                         # 6. vérifier que le site build
# 7. commit repo privé PUIS repo public, push
```

## Recevoir un colis

```bash
pnpm vault search "titre"                          # retrouver la commande/l'item
pnpm vault receive-order --order order_xxx --yes   # items → received + verified
```

## Nouvel achat Vinted/Leboncoin

```bash
pnpm vault add-order --marketplace vinted \
  --items "game_3ds_pokemon-lune:22,game_ds_pokemon-ranger:15" \
  --total 40 --shipping 3.5 --protection 1.9 --discount 2 \
  --seller "pseudo" --reference "VNT-123" --yes
# à l'expédition : pnpm vault ship-order --order … --yes
# à la réception : pnpm vault receive-order --order … --yes
# si annulée :     pnpm vault cancel-order --order … --yes  (JAMAIS supprimer)
```

## Vérification physique (needs_review → verified)

```bash
pnpm vault set-status --inventory inv_3ds_pokemon-lune \
  --condition very_good --completeness CIB --verified true --yes
# doublon confirmé avec preuve :
pnpm vault set-status --inventory inv_… --quantity 2 --quantity-reviewed true --yes
```

## Sortie JSON

Chaque commande renvoie `{ ok, command, dryRun, diff, result, warnings, error }`.
`ok:false` → lire `error`, ne pas réessayer aveuglément, ne jamais contourner en
éditant le JSON à la main.
