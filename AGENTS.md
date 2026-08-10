# AGENTS.md — Contexte agent GameVault

Tu pilotes GameVault : collection de jeux vidéo de benglut. **Deux repos** :

- `benglut/game-vault` (public) — code + interface lecture seule + export filtré `data/public/`
- `benglut/game-vault-data` (privé) — source de vérité `data/*.json` (cloné dans `../game-vault-data`)

## Règles absolues

Le contrat complet vit dans **[CLAUDE.md](CLAUDE.md)** (lu en début de session — une
seule source de vérité, ne pas dupliquer ici). Rappel des non-négociables :

1. **JAMAIS d'édition manuelle des JSON** — toujours `pnpm vault <commande>`.
2. **JAMAIS npm/npx** — uniquement pnpm.
3. `ordered` ≠ `owned`. Une commande annulée ne rend jamais un jeu possédé.
4. Ne jamais inventer un jeu absent ; doute → `needs_review`.
5. Dry-run d'abord, lire le diff, puis `--yes`.
6. **Jamais de commit/tag/push sans ordre explicite.** Pas d'attribution IA.
7. Jamais de token/secret dans les repos. WORKLOG.md à jour après chaque changement.

## Skills (charger UNIQUEMENT si nécessaire)

| Skill | Quand |
|---|---|
| `.agents/skills/inventory-search/SKILL.md` | chercher un jeu, vérifier une possession |
| `.agents/skills/inventory-mutation/SKILL.md` | ajouter/modifier jeux et exemplaires |
| `.agents/skills/order-management/SKILL.md` | commandes Vinted/Leboncoin/eBay |
| `.agents/skills/listing-analysis/SKILL.md` | analyser une annonce avant achat |
| `.agents/skills/price-observation/SKILL.md` | saisir des cotes |
| `.agents/skills/photo-import/SKILL.md` | importer des photos d'étagère |
| `.agents/skills/data-validation/SKILL.md` | validation et intégrité |
| `.agents/skills/release-deploy/SKILL.md` | publier et déployer |
| `.agents/skills/vinted-sync/SKILL.md` | synchroniser les commandes Vinted, chasser les bonnes affaires |

## Workflow git standard

```bash
git -C ../game-vault-data pull && git pull
# … mutations via pnpm vault … puis :
pnpm vault validate && pnpm test && pnpm vault publish && pnpm build
git -C ../game-vault-data add -A && git -C ../game-vault-data commit -m "data(collection): …" && git -C ../game-vault-data push
git add data/public && git commit -m "data(publish): refresh public export" && git push
```

Conventions de commit : `data(collection): add Kirby Planet Robobot`,
`data(order): receive Vinted order`, `fix(data): merge duplicate records`.
