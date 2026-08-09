# Modèle de données

Schémas exécutables : [`src/lib/schema.ts`](../src/lib/schema.ts) (Zod, source unique).

## Fichiers (repo privé, `data/`)

| Fichier | Contenu |
|---|---|
| `games.json` | catalogue des jeux (métadonnées, alias, franchise, région, support) |
| `inventory.json` | exemplaires (statut, quantité, état, complétude, prix, cote, vérification) |
| `orders.json` | commandes (marketplace, items, frais, dates, cycle de vie) |
| `platforms.json` | plateformes toutes marques (Nintendo, Sony, Microsoft, Sega, Atari, SNK, PC) |
| `sellers.json` | vendeurs |
| `listings.json` | annonces suivies |
| `price-observations.json` | observations de cotes datées et sourcées |
| `evidence.json` | preuves (photos, reçus, messages) |
| `change-log.json` | journal de toutes les mutations |

## Modèle ERP : 1 article = 1 entrée de stock

`inventory.json` est un **stock d'articles physiques**, pas un compteur : deux
exemplaires du même jeu = **deux entrées distinctes**, chacune avec ses propres
données d'achat (prix payé, commande d'origine, état, complétude, preuves).
`quantity` vaut donc toujours 1 (0 pour la wishlist : aucun objet possédé) et le
schéma refuse toute valeur supérieure.

- `games.json` = la **référence produit** (le titre, une fois)
- `inventory.json` = les **articles** (chaque exemplaire, avec son historique)
- Un exemplaire supplémentaire s'ajoute avec `add-inventory` (id suffixé `-2`, `-3`…)

## Statuts

Inventaire : `owned` · `ordered` · `fulfilled` · `delivered` · `wishlist` ·
`duplicate` · `sold` · `cancelled` · `refunded`

Commandes : `ordered` → `fulfilled` (expédié) → `delivered` (reçu), ou
`cancelled` / `refunded`. Dates dédiées : `orderedAt`, `fulfilledAt`,
`deliveredAt`, `cancelledAt`, `refundedAt`, plus **`estimatedDeliveryAt`**
(date de livraison annoncée par le vendeur, jamais dans les notes).

Possession réelle = `owned`, `delivered`, `duplicate` (constante `POSSESSION_STATUSES`).

## Règles d'intégrité (appliquées par la CLI)

1. Titres toujours normalisés (`normalizedTitle`, accents/ponctuation supprimés).
2. Alias FR/EN dans `aliases` (la recherche les utilise).
3. DS et 3DS = plateformes distinctes ; un portage est un jeu distinct.
4. Régions distinctes : PAL-FR, PAL-EU, NTSC-U, NTSC-J…
5. Commande annulée : conservée en historique, items `cancelled`, jamais possédés
   (la CLI **refuse** `set-status owned` sur un item de commande annulée).
6. Réception : `receive-order` conserve le lien `orderId` (traçabilité).
7. Doublon : item `duplicate` explicite ou `quantity > 1` ; suspicion = `quantityNeedsReview`.
8. `code_in_box` distinct d'une vraie cartouche (complétude + mediaType).
9. Reconnaissance photo incertaine → `needs_review`, jamais `verified` automatique.
10. Jamais de jeu inventé : `findGame` échoue si introuvable, pas de création implicite.
11. Toute mutation valide via Zod avant écriture.
12. Toute mutation ajoute une entrée `change-log.json`.
13. Écriture atomique (tmp + rename), tous fichiers cohérents ou rien.
14. Diff affiché avant écriture (dry-run par défaut, `--yes` pour confirmer).
15. `publish` refuse si la validation échoue.

## Prix et cotes

Distincts : prix affiché (listing) / prix payé (`purchasePrice`) / frais de port /
protection acheteur / remise lot (champs de commande) / cote basse-médiane-haute
avec **source** et **date** (`currentEstimate`, `price-observations.json`).
Une cote n'est jamais présentée comme absolue.
