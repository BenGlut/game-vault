# 🕹 GameVault

Gestionnaire personnel de collection de jeux vidéo multi-marques et multi-plateformes,
piloté par un agent IA. Interface web **strictement en lecture seule** ; toutes les
mutations passent par la CLI `pnpm vault`.

- **Repo public** (celui-ci) : code, interface, docs, export public filtré.
- **Repo privé** [`benglut/game-vault-data`](https://github.com/benglut/game-vault-data) : source de vérité (inventaire, commandes, prix, vendeurs, notes).

## Démarrage

```bash
pnpm install
pnpm dev          # interface sur http://localhost:3000
pnpm vault search "pokemon lune"
```

La CLI attend le repo privé dans `../game-vault-data` (ou `VAULT_DATA_DIR`).

## Commandes CLI

| Commande | Rôle |
|---|---|
| `pnpm vault search "titre"` | recherche tolérante (fautes, accents, FR/EN, alias) |
| `pnpm vault add-game --title … --platform …` | ajouter un jeu (anti-doublon) |
| `pnpm vault add-inventory --game … --status owned` | ajouter un exemplaire |
| `pnpm vault set-status --inventory … --status …` | changer un statut |
| `pnpm vault add-order --marketplace vinted --items "id:prix,…"` | créer une commande |
| `pnpm vault ship-order / receive-order / cancel-order / refund-order --order …` | cycle de commande |
| `pnpm vault add-price --game … --low --median --high --source …` | observation de cote |
| `pnpm vault validate` | validation Zod + intégrité référentielle |
| `pnpm vault publish` | export public filtré vers `data/public/` |

Toutes les mutations : **dry-run par défaut**, `--yes` pour écrire, diff affiché,
backup automatique, entrée changelog, écriture atomique, sortie JSON.

## Scripts

```bash
pnpm test        # 29 tests Vitest (schémas, CLI, anti-fuite du publish)
pnpm e2e         # 5 tests Playwright (build statique)
pnpm build       # export statique Next.js (out/)
pnpm exec tsx scripts/covers/fetch-covers.ts    # jaquettes de la collection
pnpm exec tsx scripts/catalog/fetch-catalog.ts  # catalogue complet DS/3DS + toutes les jaquettes
```

## Règles d'intégrité

Voir [docs/data-model.md](docs/data-model.md). Les essentielles :
`ordered` ≠ `owned` ; une commande annulée reste en historique et ne rend jamais
un jeu « possédé » ; tout passe par validation Zod ; jamais de jeu inventé.

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/agent-workflows.md](docs/agent-workflows.md)
- [docs/security.md](docs/security.md)
- [docs/importing-photos.md](docs/importing-photos.md)
- [docs/deployment.md](docs/deployment.md)
- [AGENTS.md](AGENTS.md) — contexte agent + skills dans `.agents/skills/`
