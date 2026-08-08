# Skill : publication & déploiement

Ordre déterministe (voir aussi CLAUDE.md §5) :

```bash
pnpm vault validate && pnpm test && pnpm lint && pnpm typecheck
pnpm vault publish          # export filtré → data/public/
pnpm build                  # le site doit builder
node scripts/check-drift.mjs
# commit repo privé d'abord, puis repo public — UNIQUEMENT sur ordre explicite
git -C ../game-vault-data add -A && git -C ../game-vault-data commit -m "data(...): …" && git -C ../game-vault-data push
git add -A && git commit -m "…" && git push    # déclenche le deploy Pages
```

- Push sur `main` du repo public = déploiement auto (https://benglut.github.io/game-vault/).
- Jamais de commit/tag/push sans ordre explicite de l'humain.
- Pas d'attribution IA dans les commits.
- WORKLOG.md : à jour AVANT le commit ; release = synthèse dans CHANGELOG.md + releases/vX.Y.Z.md.
