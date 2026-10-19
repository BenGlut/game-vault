# Secrets et jetons

**Règle.** Aucun secret dans les repos. Ne jamais afficher la valeur d'un jeton, ni dans une
réponse ni dans une sortie de commande. Ne jamais créer, modifier ni saisir un jeton à la
place de benglut.

**Pourquoi.** Le repo de code est public. Le 2026-10-19, un jeton Cloudflare collé avec sa
commande de test s'est affiché dans un terminal et a dû être régénéré.

**Comment.**
- GitHub : `gh auth` en local, GitHub Secrets en CI.
- Site : secrets Cloudflare `ALLOWED_EMAIL`, `SESSION_SECRET`, `MCP_TOKEN`
  (`wrangler pages secret put`).
- CLI wrangler : `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` dans `game-vault/.env`
  (ignoré par git, sur le Mac uniquement). Jeton « gamevault-cli », sans expiration, droits
  D1 + Cloudflare Pages en écriture ; il remplace `wrangler login` pour `pnpm d1 pull|push`
  et `pnpm deploy:cf`. Signalé sur la page « </> Dev ».
- Vérifier la présence d'un jeton sans l'afficher : `cut -d= -f1 .env`, ou sa longueur.
