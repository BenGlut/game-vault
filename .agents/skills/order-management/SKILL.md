# Skill : gestion des commandes

Cycle : ordered → shipped → received | cancelled | refunded. `ordered` ≠ `owned`, toujours.

```bash
pnpm vault add-order --marketplace vinted|leboncoin|ebay|… \
  --items "game_id:prix,game_id" --total 40 --shipping 3.5 \
  --protection 1.9 --discount 2 --seller "pseudo" --reference "REF" --yes
pnpm vault ship-order    --order order_xxx --yes
pnpm vault receive-order --order order_xxx --yes   # items → received + verified + acquiredAt
pnpm vault cancel-order  --order order_xxx --yes   # items → cancelled, JAMAIS supprimés
pnpm vault refund-order  --order order_xxx --yes
```

- Une annulation reste dans l'historique ; la CLI refuse ensuite `set-status owned` sur ces items.
- Un jeu en wishlist commandé bascule automatiquement wishlist → ordered (même item).
- Prix : `--total` = payé tout compris ; détail port/protection/remise dans leurs options.
