# Skill : validation des données

```bash
pnpm vault validate   # Zod sur les 9 fichiers + intégrité référentielle + doublons
pnpm test             # 29 tests (schémas, CLI, anti-fuite publish)
```

`validate` vérifie : plateformes existantes, jeux référencés par inventaire/commandes/prix,
doublons de titre normalisé (plateforme+édition+région), cohérence statut/date des commandes,
items annulés liés à leur commande.

- `ok:false` → corriger via CLI, jamais en éditant le JSON.
- Un backup horodaté existe dans `../game-vault-data/backups/` avant chaque mutation ;
  restaurer = copier le dossier de backup sur `data/` (cas extrême uniquement).
- Ne JAMAIS publier ni pousser si `validate` échoue (règle n°15).
