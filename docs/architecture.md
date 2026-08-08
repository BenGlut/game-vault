# Architecture

```
benglut/game-vault (PUBLIC)                benglut/game-vault-data (PRIVÉ)
├── src/app        interface Next.js       ├── data/
├── src/lib        schémas Zod partagés    │   ├── games.json          ← source de vérité
├── scripts/vault  CLI (seul point         │   ├── inventory.json
│                  de mutation)            │   ├── orders.json
├── scripts/seed   bootstrap               │   ├── platforms.json
├── scripts/covers jaquettes               │   ├── sellers.json
├── data/public/   EXPORT FILTRÉ commité   │   ├── listings.json
├── public/covers/ jaquettes (jpg)         │   ├── price-observations.json
└── .github/       CI + deploy Pages       │   ├── evidence.json
                                           │   └── change-log.json
                                           ├── publish.config.json  ← quoi publier
                                           ├── backups/  (gitignoré, local)
                                           └── evidence-files/  (photos)
```

## Flux de données

1. L'agent mute le repo privé **uniquement** via `pnpm vault …` (validation Zod,
   diff, backup, changelog, écriture atomique).
2. `pnpm vault publish` filtre selon `publish.config.json` et écrit `data/public/`
   dans le repo public (jamais de prix d'achat/vendeur/notes si désactivés).
3. `pnpm build` génère le site 100 % statique depuis `data/public/` (aucun accès
   au repo privé au build).
4. Push sur `main` → GitHub Actions déploie sur GitHub Pages.

## Choix structurants

- **JSON = source de vérité V1** : diffable, versionné, lisible par l'agent. Pas de
  base distante tant que non nécessaire.
- **Interface sans écriture** : zéro bouton d'édition, zéro formulaire, zéro API.
  La surface d'attaque du site public est nulle (fichiers statiques).
- **Ids déterministes** : `game_<plateforme>_<slug>` / `inv_…` — stables, lisibles,
  anti-collision par construction.
- **Index de recherche généré au build** (`search-index.json`) + Fuse.js côté client :
  tolérance fautes/accents/alias FR-EN sans backend.
