# Déploiement

## Cloudflare Pages (application privée)

- Projet `gamevault`, URL : https://gamevault-ehn.pages.dev — connexion Google
  réservée à une adresse (secret `ALLOWED_EMAIL`, cookie signé avec `SESSION_SECRET`).
- Base D1 `gamevault` (schéma `migrations/`), API dans `functions/`.
- Déployer : `pnpm deploy:cf` (build + envoi ; les jaquettes du catalogue restent
  sur GitHub Pages, plafond de 20 000 fichiers par déploiement).
- Données : `pnpm d1 pull` avant toute mutation CLI, `pnpm d1 push` après.

## GitHub Pages (jaquettes du catalogue)

- Workflow : `.github/workflows/deploy.yml` — publie seulement `public/catalog-covers/`
  et une page d'accueil neutre. La collection n'y est plus publiée.

## CI (`.github/workflows/ci.yml`)

Sur PR et push : lint, typecheck, tests Vitest, build, Playwright (API simulée par
`e2e/fixtures/vault.ts`).

## Local

```bash
pnpm build                          # export statique dans out/
pnpm exec wrangler pages dev out    # application + API + D1 locale sur :8788
```
