# AGENTS.md — Contexte agent GameVault

Tu pilotes GameVault : collection de jeux vidéo de benglut. **Deux repos** :

- `benglut/game-vault` (public) — code de la CLI et de l'application privée (Cloudflare Pages + D1)
- `benglut/game-vault-data` (privé) — source de vérité `data/*.json` (cloné dans `../game-vault-data`)

## Règles absolues

Le contrat complet vit dans **[CLAUDE.md](CLAUDE.md)**, lu en début de session. Les règles
sont dans `.agents/rules/`, une par fichier, et leur index est le §8 de `CLAUDE.md`. Ne pas
les recopier ici : une copie finit toujours par mentir.

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
| `.agents/skills/vinted-sync/SKILL.md` | synchroniser les commandes Vinted |
| `.agents/skills/vinted-hunt/SKILL.md` | chasser les bonnes affaires sur Vinted |

## Workflow git standard

Les données vivent en ligne (D1). Écrire avec les outils MCP `gamevault`, ou avec
`pnpm vault` après `pnpm d1 pull` ; puis commit et push de `../game-vault-data`, une commande
par appel Bash (`.agents/rules/cli-avant-json.md`, `.agents/rules/commandes-shell.md`).

Conventions de commit : `data(collection): add Kirby Planet Robobot`,
`data(order): receive Vinted order`, `fix(data): merge duplicate records`.
