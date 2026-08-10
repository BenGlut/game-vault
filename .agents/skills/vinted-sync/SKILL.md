# Skill : synchronisation Vinted

Vinted n'a pas de MCP. On passe par **l'API JSON interne**, depuis un onglet Chrome
déjà authentifié (`mcp__claude-in-chrome__javascript_tool`). Un appel coûte ~200
tokens contre ~1 500 pour une capture d'écran : **toujours préférer l'API**.

## Préparer la session

```
tabs_context_mcp { createIfEmpty: true }        # récupérer un tabId
navigate → https://www.vinted.fr/my_orders      # authentifie le contexte (cookies)
```

## Endpoints utiles (fetch relatif, en-tête `Accept: application/json`)

| Besoin | Endpoint |
|---|---|
| Liste des achats | `/api/v2/my_orders?type=purchase&page=1&per_page=30` |
| **Détail réel d'une commande** (articles + prix unitaires + vendeur) | `/api/v2/transactions/<transaction_id>` |
| Une annonce | `/api/v2/items/<item_id>` |
| Recherche | `/api/v2/catalog/items?search_text=...&per_page=20&order=newest_first` |
| Favoris | `/api/v2/users/<user_id>/items/favourites` |

La liste `my_orders` ne donne QUE le titre agrégé (« Lot 5 articles ») : il faut
**toujours ouvrir chaque transaction** pour connaître le contenu réel — c'est ainsi
qu'on a détecté un Mario 3D All Stars commandé en double chez deux vendeurs.

## Routine de synchronisation (à lancer régulièrement)

1. Lister les achats, puis récupérer le détail de chacun.
2. Comparer avec `orders.json` : total, vendeur, date, articles, **statut**.
3. Statuts Vinted → statuts GameVault :
   - « Paiement validé » / « Bordereau envoyé au vendeur » → `ordered`
   - « Commande expédiée et en cours d'acheminement » → `fulfilled` (+ `--eta`)
   - « Commande finalisée » / colis reçu → `deliver-order`
   - « Remboursement validé » → `refund-order`
4. **Le total Vinted inclut le port et la protection** : c'est ce total qui va dans
   `--total`, et la somme des prix d'articles doit l'égaler (règle d'intégrité).
   Répartir l'écart au prorata des prix affichés.
5. Appliquer avec `pnpm vault add-order` / `update-order` / `fulfill-order` /
   `deliver-order` / `refund-order`, puis `validate` + `publish`.

## Chasse aux bonnes affaires

- Cibles = wishlist priorité haute (`pnpm vault` → page Recommandations).
- **Priorité aux versions PAL-FR complètes en boîte** (la collection est PAL-FR).
- Vérifier chaque candidat avec `pnpm vault deal --game … --price … --state cib`.
- Le prix à comparer est le **total payé** (article + protection + port).

## Limites strictes

- ✅ Lire, chercher, comparer, **mettre en favori** (réversible, sans engagement).
- ✅ Rédiger les messages de négociation, que benglut envoie lui-même.
- ❌ **Jamais** « Acheter » ni « Faire une offre » : une offre acceptée débite
  immédiatement la carte enregistrée. L'engagement financier reste humain.
- ❌ Ne jamais saisir d'identifiants ni de données de paiement.
