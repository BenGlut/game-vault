# Déploiement

## GitHub Pages (production)

- Workflow : `.github/workflows/deploy.yml` — à chaque push sur `main` :
  `pnpm install → pnpm test → pnpm build (GITHUB_PAGES=true) → deploy-pages`.
- `GITHUB_PAGES=true` active `basePath: /game-vault` dans `next.config.ts`.
- URL : https://benglut.github.io/game-vault/
- Source Pages : « GitHub Actions » (configuré via `gh api`).

## CI (`.github/workflows/ci.yml`)

Sur PR et push : lint, typecheck, tests Vitest, build. Playwright e2e sur le build.

## Local

```bash
pnpm build                  # export statique dans out/
node scripts/serve-out.mjs  # sert out/ sur http://localhost:4173
```

## Mise à jour des données du site

Le site n'affiche que `data/public/` (commité). Après mutation des données :

```bash
pnpm vault publish
git add data/public && git commit -m "data(publish): refresh" && git push
```

Le deploy se déclenche automatiquement.
