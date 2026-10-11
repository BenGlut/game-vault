# Serveur MCP GameVault

Donne à un agent (Claude Code) l'accès direct à la base en ligne, sans
`pnpm d1 pull` / `pnpm d1 push` : le serveur parle à l'API de l'appli Cloudflare.

## Fonctionnement

- `scripts/mcp/server.ts` — serveur MCP en stdio, lancé localement par le client.
- Il appelle `https://gamevault-ehn.pages.dev/api/…` avec
  `Authorization: Bearer <jeton>`. Le middleware (`functions/_middleware.ts`)
  accepte ce jeton **uniquement sur `/api/`**, s'il fait au moins 32 caractères
  et correspond au secret Pages `MCP_TOKEN` (comparaison en temps constant).
- Chaque écriture passe par la même validation Zod et le même contrôle des
  références que l'appli, et s'inscrit au journal avec l'auteur `mcp`.

## Outils

| Outil | Rôle |
|---|---|
| `search_games` | recherche approximative (titre, alias, fautes), exemplaires et cotes |
| `inspect` | équivalent de `pnpm vault inspect games\|inventory\|orders` |
| `get_record` | un enregistrement complet |
| `add_order` | équivalent de `pnpm vault add-order` (`POST /api/add-order`, un seul batch) |
| `transition_order` | expédiée / reçue / annulée / remboursée, par id ou référence |
| `update_record` | lecture, fusion des champs donnés, réécriture |
| `create_record` | création d'un enregistrement complet |
| `change_log` | dernières modifications |

`add_order` et la CLI partagent `src/lib/orders.ts` : mêmes identifiants, même
bascule wishlist → commandé.

## Installation sur une machine

1. Jeton : `openssl rand -hex 32` dans `~/.config/gamevault/mcp-token` (chmod 600).
   Le serveur lit aussi `GAMEVAULT_TOKEN` s'il est défini.
2. Secret côté Pages : `wrangler pages secret put MCP_TOKEN --project-name gamevault`
   (entrée standard = le fichier du jeton), puis `pnpm deploy:cf`.
3. Déclarer le serveur au client MCP : commande `node_modules/.bin/tsx`, argument
   `scripts/mcp/server.ts` (chemins absolus, dans un `.mcp.json` hors dépôt).

Révoquer : supprimer le secret (`wrangler pages secret delete MCP_TOKEN`) — sans
secret, l'accès par jeton est fermé.

Le journal JSON du dépôt privé ne voit pas ces écritures tant qu'un `pnpm d1 pull`
ne les a pas rapatriées : le faire avant toute commande `pnpm vault`.
