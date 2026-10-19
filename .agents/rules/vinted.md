# Vinted : synchroniser, chasser, négocier

**Règle.** Lire, chercher, liker et négocier seul (messages, offres, contre-offres) ; ne
jamais accepter l'offre d'un vendeur, jamais cliquer sur Acheter, jamais payer : benglut
valide et paie.

**Pourquoi.** Ordre du 2026-10-11 (« tu peux négocier dur et sans moi, ensuite je
validerai ») : il remplace les règles précédentes qui exigeaient son oui pour chaque offre.
Une offre acceptée engage son argent, d'où la limite au paiement.

**Comment.**
- Passer par l'API JSON interne depuis un onglet Chrome connecté, jamais par des captures
  d'écran (7× plus de jetons, contenu des lots invisible) :
  `.agents/skills/vinted-sync/SKILL.md`.
- Ouvrir sa propre fenêtre de travail ; ne jamais naviguer dans l'onglet de benglut.
- Négocier dès -20 % environ, plus dur sur les annonces anciennes ; jamais au-dessus de la
  cote médiane boîte ni de 40 € par article sans demander.
- Un montant donné par benglut s'applique à l'euro près, sans prix de repli inventé.
- Avant toute offre sur une figurine : toutes les photos en grand ; état invérifiable =
  demander des photos.
- La fenêtre d'offre d'un lot exige une fenêtre Chrome visible
  (`document.visibilityState` différent de `hidden`) : voir
  `.agents/skills/vinted-hunt/LEARNED.md`.
- Chaque annonce repérée va dans la collection `listings` (lien + prix affiché).
