# Commandé n'est pas possédé

**Règle.** `ordered` ≠ `owned`. Une commande annulée ne rend jamais un jeu possédé. Une
commande ne passe en « expédiée » que si le colis est réellement parti, en « reçue » que s'il
est livré.

**Pourquoi.** La CLI applique la règle ; elle ne se contourne pas. Le 2026-10-18, une commande
Vinted dont seul le bordereau était envoyé a été passée par erreur en « expédiée », puis
corrigée.

**Comment.** Statuts Vinted : « Bordereau envoyé » = pas encore expédié ; « Commande
expédiée » = `fulfill` ; « Commande livrée » = `deliver`.
