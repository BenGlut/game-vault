# Journal des leçons — ronde Vinted

Brouillon. Une ligne datée par leçon, factuelle, la plus courte possible.
Quand une leçon revient trois fois, la promouvoir dans `SKILL.md` et la retirer d'ici.
Plafond : 30 lignes. Au-delà, promouvoir ou supprimer la plus faible.

*Compacté le 2026-08-11 (ronde 43) : 208 → 27 lignes. Promus dans `SKILL.md` — le like
par le DOM et le mensonge du toggle d'API, la réponse par `/replies`, le modal d'offre
qui exige l'onglet actif, le suffixe « protection incluse » du title, les suites et
produits dérivés à exclure. Supprimés — les doublons de langue, et les protocoles de
clic et d'envoi de message devenus faux.*

- 2026-08-10 — PriceCharting est anglophone : chercher par l'alias anglais, pas par le
  titre français. Les slugs gardent les apostrophes (`luigi%27s-mansion-3`). Un mauvais
  slug renvoie une page « liste » en HTTP 200 sans tableau : vérifier `id="used_price"`.
- 2026-08-10 — Prix rendu Vinted = affiché × 1,05 + 0,70 (protection) + port (3,05 €
  mini). Sur un jeu à ~20 € cela ajoute ~25 % : comparer le prix AFFICHÉ à la cote
  fabrique de fausses affaires, comme comparer une cartouche nue à une cote CIB.
- 2026-08-10 — Sur DS/3DS beaucoup de cartouches nues sont affichées au prix du complet.
  Le marché français ignore largement la distinction loose/CIB : c'est là que se cachent
  les faux écarts.
- 2026-08-10 — Le moins cher d'une recherche l'est presque toujours pour une raison cachée
  dans la fiche : boîte étrangère, cartouche seule, autre console. Ouvrir la fiche AVANT
  d'annoncer un prix plancher, jamais sur la seule liste de résultats.
- 2026-08-10 — Les vendeurs ignorent souvent que la remise sur lot vient de leur propre
  réglage de dressing ; l'expliquer calmement débloque la discussion.
- 2026-08-10 — `add-order` bascule un item wishlist en `ordered` mais ne lui pose PAS de
  `purchasePrice`. Le prix reste sur la ligne de commande.
- 2026-08-10 — LEARNED.md réécrit en bloc = perte : 7 leçons effacées ce jour par une
  réécriture concurrente. Compléter par AJOUT ; ne réécrire que pour compacter, seul.
- 2026-08-10 — Mon user_id Vinted = 40577943. `/api/v2/users/conversations` renvoie
  220807870, qui n'est PAS le compte : piège pour identifier l'expéditeur d'un message.
- 2026-08-10 — Les entités d'offre portent `status_title` et `price`/`original_price` :
  suivre l'état des offres par l'API, sans capture.
- 2026-08-11 — Lire une description sans rendre la fiche : le HTML brut de `/items/<id>`
  contient le bloc JSON-LD `"description":"…"`. L'API favoris n'en renvoie AUCUNE — un
  audit bâti dessus est vide par construction, pas « propre ». Valider toute méthode
  d'extraction sur un témoin connu avant de conclure.
- 2026-08-11 — Un fetch en boucle sur les fiches déclenche un HTTP 429 qui renvoie une
  page de 2,5 ko sans erreur JS : l'extraction rend « description vide » et fabrique un
  faux négatif. Vérifier `r.status===200` avant de conclure.
- 2026-08-11 — `document.hidden` et `outerWidth` sont propres à l'ONGLET, pas à la
  fenêtre : un onglet d'arrière-plan rend `hidden`/`0` alors que la fenêtre est visible.
  Ne pas en conclure que la fenêtre est réduite — vérifier sur l'onglet au premier plan.
- 2026-08-11 — Le `status_title` de `/api/v2/transactions/<id>` vaut toujours « Paiement
  validé » : c'est `/api/v2/my_orders` qui porte le vrai statut d'expédition, et il est
  souvent vide. Ne pas conclure à un écart de statut sur ces seules données.
- 2026-08-11 — Deux exemplaires du MÊME jeu achetés chez deux vendeurs se ressemblent en
  liste et font croire à une dérive. Appareiller sur vendeur + montant, et renseigner
  `add-order --reference <transaction_id>` : c'est ce qui lève l'ambiguïté pour de bon.
- 2026-08-11 — Un vendeur dont `bundle_discount.enabled` est false (`/api/v2/users/<id>`)
  ne donnera AUCUNE remise sur lot : le groupage n'économise que le port. Vérifier ce
  champ avant de proposer un lot, sinon on achète du remplissage pour rien.
- 2026-08-11 — Un lot se monte directement par URL, sans cliquer article par article :
  `/member/<id>/bundles/new?item_ids[]=A&item_ids[]=B…`.
- 2026-08-11 — Absence de bouton « Acheter » = envoi personnalisé : le vendeur doit
  confirmer la taille du colis. Ce n'est ni un bug ni une annonce vendue.
- 2026-08-11 — CONFIRMÉ deux fois : un like seul déclenche une baisse spontanée, mais
  MESURÉ sur 284 likes → 11 remises et 2 propositions de lot, dont AUCUNE sous la cote.
  Les vendeurs baissent de 5 à 20 % depuis un prix déjà au-dessus du marché : le like
  ouvre la discussion, il ne fabrique pas l'affaire. Contre-offrir systématiquement.
- 2026-08-11 — Les vendeurs de reproductions obfusquent le mot : « Cardm0d » avec un zéro.
  Chercher aussi cardmod / cart mod / repr0. Le mot n'apparaît que dans la description.
- 2026-08-11 — Le zoom sur l'étiquette de cartouche tranche l'origine quand titre et
  description sont muets : CGB-AZ7J-JPN a démasqué un Oracle of Seasons japonais.
- 2026-08-11 — « Console Game Boy rétroéclairée » sous 40 € = émulateur chinois. Repères
  du vrai marché : Pocket rétroéclairée 85 €, GBA écran IPS 158 €.
- 2026-08-11 — ÉCART STRUCTUREL sur les titres rares : N64 (Banjo-Kazooie 23,80 € contre
  12,07 € de cote) et Chrono Trigger DS (130 à 180 € contre 90,82 €) se vendent 1,5 à 2×
  la cote internationale en France. Sur ceux-là le bon repère est le prix médian Vinted ;
  sinon on rejette tout le marché et on ne conclut jamais.
- 2026-08-11 — Deux cartouches Zelda pour 8 €, ou un titre recherché à moitié prix avec
  une description d'une ligne : c'est le profil du lot repro. Prix anormalement bas +
  description vide = refus, sauf preuve d'authenticité au sens du standard.
