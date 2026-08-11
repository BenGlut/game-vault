# Journal des leçons — ronde Vinted

Brouillon. Une ligne datée par leçon, factuelle, la plus courte possible.
Quand une leçon revient trois fois, la promouvoir dans `SKILL.md` et la retirer d'ici.
Plafond : 30 lignes. Au-delà, promouvoir ou supprimer la plus faible.

*Compacté le 2026-08-11 (ronde 50) : 120 → 30 lignes. Les quatre leçons « faille de
filtre » fusionnées en une, les trois « mots étrangers » en une, et l'import japonais
promu dans `SKILL.md`.*

- 2026-08-10 — PriceCharting est anglophone : chercher par l'alias anglais. Les slugs
  gardent les apostrophes (`luigi%27s-mansion-3`). Un mauvais slug renvoie une page
  « liste » en HTTP 200 sans tableau : vérifier `id="used_price"`.
- 2026-08-10 — Prix rendu Vinted = affiché × 1,05 + 0,70 + port (3,05 € mini). Sur un
  jeu à ~20 € cela ajoute ~25 % : comparer le prix AFFICHÉ à la cote fabrique de
  fausses affaires, comme comparer une cartouche nue à une cote CIB.
- 2026-08-10 — Sur DS/3DS beaucoup de cartouches nues sont affichées au prix du complet :
  c'est là que se cachent les faux écarts.
- 2026-08-10 — Le moins cher d'une recherche l'est presque toujours pour une raison
  cachée dans la fiche. Ouvrir la fiche AVANT d'annoncer un prix plancher.
- 2026-08-10 — Les vendeurs ignorent souvent que la remise sur lot vient de leur propre
  réglage de dressing ; l'expliquer calmement débloque la discussion.
- 2026-08-10 — `add-order` ne pose PAS de `purchasePrice` sur l'item wishlist bascule.
- 2026-08-10 — LEARNED.md réécrit en bloc = perte. Compléter par AJOUT ; ne réécrire que
  pour compacter, et seul.
- 2026-08-10 — Mon user_id Vinted = 40577943. `/api/v2/users/conversations` renvoie
  220807870, qui n'est PAS le compte.
- 2026-08-11 — Lire une description sans rendre la fiche : le HTML brut de `/items/<id>`
  porte le bloc JSON-LD `"description":"…"`. L'API favoris n'en renvoie AUCUNE. Valider
  toute méthode d'extraction sur un témoin connu avant de conclure.
- 2026-08-11 — Un fetch en boucle sur les fiches déclenche un HTTP 429 qui renvoie une
  page de 2,5 ko sans erreur JS. Vérifier `r.status===200` avant de conclure.
- 2026-08-11 — `document.hidden` et `outerWidth` sont propres à l'ONGLET, pas à la
  fenêtre : un onglet d'arrière-plan rend `hidden`/`0` fenêtre visible.
- 2026-08-11 — Le statut fiable d'une commande est `transaction.status` : 450 terminée,
  230 en cours, 520 remboursée. `status_title` est vide. C'est le seul moyen de repérer
  une livraison à passer en `receive-order`.
- 2026-08-11 — Appareiller commande et base sur vendeur + montant, et renseigner
  `add-order --reference <transaction_id>` : deux exemplaires du même jeu achetés chez
  deux vendeurs se ressemblent en liste et font croire à une dérive de statut.
- 2026-08-11 — Rattacher une commande historique à des exemplaires DÉJÀ en stock se fait
  à la main dans `orders.json` (items pointant sur les `inventoryId` existants) puis en
  posant `orderId`, `purchasePrice` et `acquiredAt`. `add-order` crée toujours de
  nouvelles lignes et fabrique des doublons. `purchasePrice` est un OBJET
  `{amount, currency, includesShipping}`, pas un nombre.
- 2026-08-11 — FAILLES DE FILTRE, toutes de la même famille : ancrer sur le MOT et jamais
  sur le début de chaîne (`\bnotice\b` sinon « ds notice … » passe), doubler chaque terme
  de sa forme anglaise (manual, instruction, box only), inclure les mots étrangers
  (Spiel, completo, per, gioco, juego, nuovo, ocasion, cartuccia) et les dérivés
  (keychain, OST, CD, artbook, carte VIP). Et couper le titre à `/,\s*état:/` avant tout
  filtrage, sinon le suffixe « … € protection incluse » fait rejeter du valide.
- 2026-08-11 — Une recherche par titre attire les SUITES : « NEO The World Ends With You »,
  Aria of Sorrow à côté de Dawn of Sorrow, Luigi's Mansion 2 à côté de 3. Les exclure par
  nom, sinon on cote le mauvais jeu.
- 2026-08-11 — Un vendeur dont `bundle_discount.enabled` est false ne donnera AUCUNE
  remise, même si des paliers sont configurés. Et une remise ACTIVE ne suffit pas :
  refaire le calcul « remise gagnée sur la cible > coût du remplissage » à chaque fois.
- 2026-08-11 — Une affaire réelle peut être un DOUBLON. Vérifier l'inventaire
  (`pnpm vault search`) avant de traiter une remise comme une opportunité.
- 2026-08-11 — MESURÉ sur 284 likes : 11 remises spontanées et 2 propositions de lot,
  AUCUNE sous la cote. Les vendeurs baissent de 5 à 20 % depuis un prix déjà au-dessus du
  marché. Le like ouvre la discussion, il ne fabrique pas l'affaire.
- 2026-08-11 — Les vendeurs de reproductions obfusquent le mot : « Cardm0d » avec un zéro.
  Le mot n'apparaît que dans la description.
- 2026-08-11 — Prix anormalement bas + description d'une ligne = profil du lot repro
  (deux cartouches Zelda pour 8 €). Refus sauf preuve au sens du standard.
- 2026-08-11 — Le zoom sur l'étiquette tranche l'origine quand titre et description sont
  muets : CGB-AZ7J-JPN a démasqué un Oracle of Seasons japonais.
- 2026-08-11 — « Console Game Boy rétroéclairée » sous 40 € = émulateur chinois. Vrai
  marché : Pocket rétroéclairée 85 €, GBA écran IPS 158 €.
- 2026-08-11 — ÉCART STRUCTUREL sur les titres rares : N64 et Chrono Trigger DS se vendent
  1,5 à 2× la cote internationale en France. Sur ceux-là le repère est le prix médian
  Vinted, sinon on rejette tout le marché et on ne conclut jamais.
- 2026-08-11 — Une photo de benglut vaut audit : le badge USK sur une jaquette signe un
  tirage paneuropéen, pas une édition FR (Kirby Planet Robobot corrigé en PAL-EU).
- 2026-08-11 — Micromania occasion est un bon PLAFOND : prix directement comparable au
  rendu Vinted (ni protection ni port en retrait magasin), article garanti en boîte.
  Extraction `.product-grid .product-tile`, écarter les liens `criteo.com` (publicités
  glissées dans la grille) ; le nom du jeu se lit dans le slug, le titre est vide au DOM.
