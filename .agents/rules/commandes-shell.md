# Commandes shell sans demande d'autorisation

**Règle.** Une commande par appel Bash ; jamais de `cd … && x && y`. Pas de `node -e '…'` ni de
`python3 - <<EOF` pour lire la base : utiliser `pnpm vault inspect` ou les outils MCP `gamevault`.

**Pourquoi.** Les règles d'autorisation portent sur la chaîne de commande ENTIÈRE (constat du
2026-09-09) : `Bash(pnpm vault *)` ne reconnaît pas `cd /chemin && pnpm vault …`, et chaque
`node -e` est une chaîne unique, donc une demande d'autorisation pour benglut.

**Comment.**
- Chemins absolus ou `--dir` / `git -C` plutôt qu'un `cd`.
- `pnpm vault inspect games|inventory|orders [--match regex] [--status s] [--platform p]`.
  Une requête récurrente que la CLI ne sait pas exprimer s'ajoute à `inspect`, pas en script
  inline.
- Volontairement non autorisés, et c'est voulu : `node -e`, `python3`, `pnpm exec *` nu, `rm`.
  Ce sont des exécutions arbitraires ; la demande d'autorisation y est le but.
