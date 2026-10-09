# Architecture

```
benglut/game-vault (PUBLIC)                benglut/game-vault-data (PRIVÉ)
├── src/app        pages Next.js (minces)  ├── data/
├── src/components application cliente     │   ├── games.json          ← source de vérité
├── src/lib        schémas Zod, règles,    │   ├── inventory.json
│                  statistiques            │   ├── orders.json
├── src/server     cœur de l'API (D1)      │   ├── platforms.json
├── functions/     API Cloudflare          │   ├── sellers.json
├── migrations/    schéma D1               │   ├── listings.json
├── scripts/vault  CLI de l'agent          │   ├── price-observations.json
├── scripts/d1     sync JSON ⇄ D1          │   ├── evidence.json
├── public/covers/ jaquettes (jpg)         │   └── change-log.json
└── .github/       CI + jaquettes catalogue├── publish.config.json
                                           └── backups/  (gitignoré, local)
```

## Flux de données

1. L'agent mute le repo privé via `pnpm vault …` (validation Zod, diff, backup,
   changelog, écriture atomique), après `pnpm d1 pull` et avant `pnpm d1 push`.
2. L'application privée (Cloudflare Pages, connexion Google) charge toute la base D1
   en une requête (`GET /api/vault`) et la tient à jour après chaque écriture.
3. Chaque écriture en ligne passe par `functions/api/` : même validation Zod que la
   CLI, contrôle des références, entrée dans `change_log` dans le même batch D1.
4. `pnpm d1 pull` rapatrie les modifications faites en ligne dans le repo privé.

## Choix structurants

- **JSON = source de vérité pour l'agent**, D1 = copie en ligne synchronisée :
  diffable, versionné, lisible par l'agent, et une vraie base pour l'interface.
- **Application privée** : toutes les routes (pages, fichiers, API) derrière la
  session Google ; écritures protégées par un en-tête personnalisé (pas d'écriture
  intersite possible).
- **Ids déterministes** : `game_<plateforme>_<slug>` / `inv_…` — stables, lisibles ;
  le premier id libre est pris quand un jeu a plusieurs exemplaires.
- **Recherche côté client** (Fuse.js + mots entiers) : tolérance fautes, accents,
  abréviations et alias FR-EN sur la base en direct.
- **Statistiques calculées dans le navigateur** (`src/lib/stats.ts`, module pur
  testé) : un chiffre affiché est toujours celui de la base du moment.
