# Skill : analyse d'annonce (Vinted/Leboncoin/eBay)

Avant un achat : évaluer une annonce contre la collection et les cotes.

1. Pour chaque jeu de l'annonce : `pnpm vault search "titre"` → déjà possédé ? doublon ?
2. Comparer prix affiché vs `currentEstimate` (fiche) et `price-observations.json`.
3. Vérifier ce que montre la photo : vraie cartouche/CIB ou boîte seule/code in box (règle n°8).
4. Rapport : jeu | possédé ? | prix annonce | cote médiane | verdict (bon deal / doublon / passer).

- Prix affiché ≠ prix payé : ne saisir le prix qu'à la commande (`add-order`).
- Aucun achat n'est décidé par l'agent : rapport → décision humaine → `add-order`.
