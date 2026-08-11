# Journal des leçons — ronde Vinted

Brouillon. Une ligne datée par leçon, factuelle, la plus courte possible.
Quand une leçon revient trois fois, la promouvoir dans `SKILL.md` et la retirer d'ici.
Plafond : 30 lignes. Au-delà, promouvoir ou supprimer la plus faible.

*Compacté le 2026-08-10 : filtres de recherche, prix rendu, plateformes homonymes et
pièges d'API promus dans `SKILL.md`. 26 lignes retirées.*

- 2026-08-10 — PriceCharting est anglophone : chercher par l'alias anglais, pas par
  le titre français. Les slugs gardent les apostrophes (`zelda-link's-awakening`).
- 2026-08-10 — Un mauvais slug PriceCharting renvoie une page « liste » en HTTP 200
  sans tableau de prix : vérifier la présence de `<td id="used_price">`, pas le code.
- 2026-08-10 — « Boîte et notice seules, cartouche non incluse » n'apparaît que dans
  la description : sur un jeu cher, un titre propre avec un prix bas impose de lire la
  description avant tout. Idem pour la langue (« DIE ZEIT IST REIF » = allemand).
- 2026-08-10 — Quand le code produit est illisible, le texte du dos tranche la langue :
  « ARMADURA ROBOBOT ¡ACTIVADA! / ATIVAR! » = PAL espagnol/portugais, pas de français.
- 2026-08-10 — Envoi d'un message : cliquer le champ puis Return ne suffit pas toujours.
  Fiable : `ta.focus()` puis dispatch d'un KeyboardEvent Enter sur le textarea, et
  vérifier que le champ est vidé. Le bouton flèche → du composeur marche aussi.
- 2026-08-10 — Sur DS/3DS, beaucoup de cartouches nues sont affichées au prix du
  complet (Phantom Hourglass : 21 € pour une cote loose de 12,42 €). Le marché français
  ignore largement la distinction loose/CIB : c'est là que se cachent les faux écarts.
- 2026-08-10 — Les vendeurs ignorent souvent que la remise sur lot vient de leur propre
  réglage de dressing ; l'expliquer calmement débloque la discussion.
- 2026-08-10 — CORRECTION d'une leçon fausse : `pnpm vault deal` existe bien
  (`scripts/vault/index.ts`). Vérifier dans le code avant de déclarer une commande absente.
- 2026-08-10 — Deux agents sur le même compte : un fil peut avoir bougé sans que ce soit
  nous, et les écritures dans `data/` peuvent entrer en conflit. Avant d'écrire à un
  vendeur, relire les 3 derniers messages et vérifier que le dernier n'est pas déjà de
  notre côté. Un seul agent à la fois sur la base.
- 2026-08-10 — `add-order` bascule un item wishlist en `ordered` mais ne lui pose PAS
  de `purchasePrice` (seuls les items créés en reçoivent un). Le prix reste sur la
  ligne de commande. À corriger dans la CLI si le prix d'achat par exemplaire compte.
- 2026-08-10 — Le moins cher d'une recherche l'est presque toujours pour une raison
  cachée dans la fiche : boîte étrangère, cartouche seule, autre console. Ouvrir la
  fiche AVANT d'annoncer un prix plancher, jamais sur la seule liste de résultats.
- 2026-08-10 — Dressing complet d'un vendeur : `/api/v2/wardrobe/<user_id>/items`
  (`/api/v2/users/<id>/items` renvoie 404). Le lire AVANT d'évaluer ses annonces une
  par une : chez lore5846 les 5 jeux étaient déjà owned, 1 appel au lieu de 5.
- 2026-08-10 — Messagerie : `/api/v2/inbox` pour la liste,
  `/api/v2/conversations/<id>` pour le détail. `/api/v2/conversations` en liste = 404.
- 2026-08-10 — Les entités d'offre portent `status_title` (« En attente » / « Annulée »)
  et `price`/`original_price` : suivre l'état des offres par l'API, sans capture.
- 2026-08-10 — Envoi d'un message : Entrée n'envoie RIEN. Après le setter React, cliquer
  la flèche → en bas à droite du composeur, puis vérifier que le champ est vidé.
- 2026-08-10 — `pnpm vault` est en DRY-RUN par défaut et affiche le diff ; `--yes`
  écrit. ATTENTION : la liste de commandes rendue par `--help` n'est PAS exhaustive —
  `deal` existe et fonctionne alors qu'il n'y figure pas. Tester avant de conclure
  qu'une commande manque.
- 2026-08-10 — Mon user_id Vinted = 40577943. `/api/v2/users/conversations` renvoie
  220807870, qui n'est PAS le compte : piège pour identifier l'expéditeur d'un message.
- 2026-08-10 — Langue : quand le code produit est illisible, le dos tranche.
  « ARMADURA ROBOBOT ¡ACTIVADA! / ATIVAR! » = PAL espagnol/portugais, pas de français.
- 2026-08-10 — LEARNED.md réécrit en bloc = perte. 7 leçons effacées ce jour par une
  réécriture concurrente. Compléter par AJOUT, jamais réécrire le fichier entier.
- 2026-08-10 — Prix rendu Vinted = affiché × 1,05 + 0,70 (protection) + port
  (3,05 € mini), vérifié sur annonce réelle 16,00 € → 17,50 € hors port. Sur un jeu à
  ~22 € de cote, cela ajoute ~25 % : comparer le prix AFFICHÉ à la cote fabrique de
  fausses bonnes affaires, exactement comme comparer une cartouche nue à la cote CIB.
- 2026-08-10 — CONFIRMÉ : un like seul déclenche une baisse spontanée. rouky1208 est
  passé de 25 € à 22 € dans les heures suivant le like, sans aucun message. Liker large
  et attendre est une tactique à part entière, pas un pis-aller.
- 2026-08-10 — Sur 9 contenants vides croisés, 4 l'annonçaient dans le titre, 3 non
  (Kid Icarus, Majora's Mask, Chrono Trigger : titre propre, piège en description ou
  dans l'URL). Le titre est un premier filtre, jamais une garantie.
- 2026-08-11 — Certaines annonces n'ont NI « Acheter » NI « Faire une offre », seulement
  « Message » (vendeur étranger ou annonce fraîche non validée). Ne pas conclure qu'elle
  est vendue : écrire au vendeur pour demander disponibilité et expédition.
- 2026-08-11 — « cartmod » = cartouche reproduction reflashée, vendue comme un jeu.
  Le mot n'apparaît que dans la description et le prix est très en dessous de la cote :
  un écart énorme sur un jeu rare doit faire ouvrir la description avant tout like.
- 2026-08-11 — Écart structurel par plateforme : sur N64 le marché français est ~2x la
  cote PAL PriceCharting (Banjo-Kazooie 23,80 € contre 12,07 €). Sur Switch et DS l'écart
  est faible. Ne pas conclure « aucune affaire » sur N64 sans relativiser : le bon repère
  y est le prix médian Vinted, pas la cote internationale.
- 2026-08-11 — Les vendeurs de reproductions obfusquent le mot : « Cardm0d » avec un
  zéro. Chercher aussi cardmod/cart mod/repr0. Et ne jamais se fier au sceau Nintendo
  ni au code produit sur la photo : les repro réutilisent des étiquettes officielles.
- 2026-08-11 — Le zoom sur l'étiquette de cartouche est le seul moyen fiable de trancher
  l'origine quand titre et description sont muets : CGB-AZ7J-JPN a démasqué un Oracle of
  Seasons japonais vendu 17,50 € parmi des annonces européennes.
- 2026-08-11 — « Console Game Boy rétroéclairée » sous 40 € = émulateur chinois, jamais
  du Nintendo. Repères du vrai marché : Pocket rétroéclairée 85 €, GBA écran IPS 158 €.
- 2026-08-11 — Un lot se monte directement par URL, sans cliquer article par article :
  /member/<id>/bundles/new?item_ids[]=A&item_ids[]=B… La remise du vendeur s'applique
  automatiquement et s'affiche en haut. Bien plus rapide que la sélection à la main.
- 2026-08-11 — Absence de bouton « Acheter » = envoi personnalisé : le vendeur doit
  confirmer la taille du colis avant que l'achat soit possible. Ce n'est ni un bug ni
  une annonce vendue. Passer par « Créer un lot » déclenche la demande.
- 2026-08-11 — RÈGLE INVALIDÉE : le code produit ne prouve PAS l'authenticité. Le lot
  AliExpress « Metroid Fusion / Zero Mission » porte AGB-AMTP-EUR et AGB-BMXP-EUR, les
  codes exacts relevés sur deux annonces Vinted que j'avais validées. Sceau Nintendo et
  marquage CE sont également reproduits. Seuls indices fiables : composition du lot du
  vendeur, prix très sous le marché, et présence de boîte + notice d'origine.
- 2026-08-11 — GB/GBC/GBA hors périmètre : le coût d'authentification par annonce dépasse
  le gain. Les plateformes à disque ou à cartouche récente (GameCube, DS, 3DS, N64,
  Switch) sont bien moins contrefaites — c'est là qu'il faut chercher.
- 2026-08-11 — Lire la description d'une annonce SANS la fiche rendue : le HTML brut de
  `/items/<slug>` contient le bloc JSON-LD `"description":"…"` (et `<meta name="description">`
  en repli). L'API favoris ne renvoie AUCUNE description : un audit basé dessus est vide
  par construction, pas « propre ». Toujours valider la méthode sur un témoin connu.
- 2026-08-11 — Un fetch en boucle sur les fiches déclenche un HTTP 429 qui renvoie une page
  de 2,5 ko sans erreur JS : l'extraction rend alors « description vide » et fabrique un
  faux négatif. Vérifier `r.status===200` avant de conclure, et espacer de 4 s.
- 2026-08-11 — DIAGNOSTIC À FAIRE EN PREMIER quand un clic « ne prend pas » ou que le CDP
  annonce un renderer gelé : `({vis:document.visibilityState,ow:outerWidth})`. Si
  `hidden`/`ow:0`, la fenêtre Chrome est réduite : tous les rects passent à 0×0 (les clics
  n'atteignent rien, sans erreur), les timers sont throttlés à ~1/minute et les fetches
  traînent. Aucune insistance ne marche — il faut passer par l'API, ou demander à benglut
  de restaurer la fenêtre.
- 2026-08-11 — Liker/déliker SANS clic : `POST /api/v2/user_favourites/toggle`,
  corps `{type:'item',user_id:40577943,item_ids:[id]}`, en-tête `X-CSRF-Token` extrait du
  HTML de n'importe quelle page (`/CSRF_TOKEN\\?":\\?"([0-9a-f-]{36})/`). Sans ce header :
  403 `access_denied`. Bien plus fiable et moins cher que le clic sur le cœur.
- 2026-08-11 — La liste `/api/v2/users/<id>/items/favourites` est servie depuis un CACHE :
  après un toggle réussi (200 « Ok »), elle affiche encore l'article pendant un moment.
  Ne JAMAIS conclure « le retrait a échoué » sur cette liste — vérifier `is_favourite`
  dans le HTML de la fiche. Sans ça, on re-toggle et on remet le like qu'on venait d'ôter.
- 2026-08-11 — STANDARD D'AUTHENTIFICATION : ne retenir qu'une annonce montrant la carte
  électronique, ou certifiable autrement (boîte + notice d'origine, scellé, vendeur
  spécialisé). Étiquette, sceau Nintendo et code produit sont tous imprimables ; la carte
  ne l'est pas. À défaut, demander une photo de la carte au vendeur — un vendeur honnête
  ouvre la coque, un revendeur de repro élude.
- 2026-08-11 — PIEGE MAJEUR : `POST /api/v2/user_favourites/toggle` renvoie 200
  `{"code":0,"message":"Ok"}` pour un AJOUT sans rien creer — il ne sait que RETIRER.
  Verifie sur 4 variantes d'endpoint, 3 formes de corps et l'en-tete X-Anon-Id :
  `is_favourite` reste false sur la fiche. Un compteur de likes bati sur le code 200
  est donc faux : j'ai annonce 156 likes, il y en avait 0. Toujours reverifier
  `is_favourite` via `/api/v2/catalog/items` APRES la pose. Liker en volume exige
  l'interface, donc une fenetre Chrome visible.
- 2026-08-11 — `/api/v2/catalog/items` porte `is_favourite` et `favourite_count` a jour :
  c'est la source vive pour savoir ce qui est deja like, et elle evite de re-toggler un
  favori existant (ce qui l'effacerait).
- 2026-08-11 — Repondre a un vendeur par API : `POST /api/v2/conversations/<id>/replies`,
  corps `{reply:{body:txt}}`, avec X-CSRF-Token. Fonctionne fenetre masquee, remplace
  tout le protocole setter React + clic sur la fleche.
- 2026-08-11 — Le `status_title` de `/api/v2/transactions/<id>` vaut toujours « Paiement
  valide » : c'est `/api/v2/my_orders` qui porte le vrai statut d'expedition. Ne pas
  conclure sur la fiche transaction.
- 2026-08-11 — Deux exemplaires du MEME jeu achetes chez deux vendeurs se ressemblent en
  liste et font croire a une derive de statut. Appareiller sur vendeur + montant, jamais
  sur le titre seul. Les commandes en base n'ont pas de `reference` Vinted : la remplir
  supprimerait cette ambiguite.
- 2026-08-11 — LES LIKES PASSENT PAR LE DOM, PAS PAR L'API. Sur une page catalogue,
  `document.querySelectorAll('button[aria-label*="favoris"]')` rend ~148 coeurs ;
  `b.click()` les bascule vraiment (aria-label passe a « Supprimer des favoris »).
  L'API `user_favourites/toggle` sait seulement RETIRER. 284 likes poses ainsi.
  Ne mettre AUCUNE temporisation dans la boucle : en onglet d'arriere-plan les timers
  sont throttles a ~1/minute et le CDP coupe a 45 s ; sans pause, 60 clics passent d'un
  coup. Un onglet d'arriere-plan calcule bien la mise en page, donc les clics portent.
- 2026-08-11 — PIEGE DE FILTRAGE : l'attribut `title` d'une carte catalogue vaut
  « <titre>, État: <etat>, <prix> €, <prix> € protection incluse ». Filtrer le mot
  « protection » (pour ecarter les boitiers de protection) rejette donc des annonces
  valides — 19 Kid Icarus perdus avant correctif. Toujours couper le titre a
  `/,\s*etat:/` AVANT d'appliquer les filtres de bruit.
- 2026-08-11 — `POST /api/v2/conversations` (creer un fil) renvoie 403 : seule la reponse
  a un fil existant passe (`/conversations/<id>/replies`). Pour ecrire a un vendeur
  inconnu, il faut le bouton « Message » de la fiche, donc l'onglet au premier plan.
- 2026-08-11 — `document.hidden` et `outerWidth` sont propres a l'ONGLET, pas a la
  fenetre : un onglet d'arriere-plan rend `hidden`/`0` alors que la fenetre est visible.
  Ne pas en conclure que la fenetre est reduite — verifier sur l'onglet au premier plan.
- 2026-08-11 — Un vendeur dont `bundle_discount.enabled` est false (voir
  `/api/v2/users/<id>`) ne donnera AUCUNE remise sur lot : le lot n'economise que le
  port. Verifier ce champ avant de proposer un groupage, sinon on achete du remplissage
  pour rien.
- 2026-08-11 — Le modal « Faire une offre » ne se monte que dans l'onglet ACTIF. En
  arriere-plan le clic passe sans erreur et aucun champ n'apparait. Une fois ouvert :
  `#offer` via le setter natif React, puis le bouton « Proposer <montant> ». Les likes,
  eux, marchent en arriere-plan — la difference tient au rendu du modal, pas au clic.
- 2026-08-11 — MESURE : 284 likes ont produit 11 remises spontanees et 2 propositions de
  lot en une matinee, mais AUCUNE n'etait sous la cote — les vendeurs baissent de 5 a
  20 % depuis un prix deja au-dessus du marche. Le like fait venir la discussion, il ne
  fabrique pas l'affaire : il faut contre-offrir systematiquement.
- 2026-08-11 — Offre par API : `POST /api/v2/transactions/<tx>/offer_requests`, corps
  `{price:"22.0",currency:"EUR"}`. Le `tx` s'obtient par `conversation.transaction.id`,
  donc uniquement sur un fil DEJA ouvert — pour une annonce fraiche il faut le modal.
  Vinted refuse « Prix de l'offre trop bas » : sur un article a 32 EUR avec une offre
  vendeur en cours a 27, les montants 22 / 23 / 24 / 25 sont tous rejetes. Casser les
  prix par API est donc impossible ; la contre-offre doit rester proche de l'offre.
- 2026-08-11 — `add-order --reference <transaction_id>` : renseigner la reference Vinted
  supprime l'ambiguite d'appariement commande/base relevee ronde 38. A faire pour toute
  nouvelle commande.
- 2026-08-11 — Le coeur d'une FICHE article ne repond pas au clic en onglet
  d'arriere-plan, alors que ceux de la grille catalogue fonctionnent. Pour liker un
  article precis sans passer au premier plan, ouvrir la recherche qui le contient et
  cliquer son coeur dans la grille.
- 2026-08-11 — CORRECTION de la lecon posee plus tot le meme jour : « Prix de l'offre
  trop bas » n'est PAS un plancher de prix. Mesure sur un article a 30 EUR : 22, 24, 25,
  26, 28 et meme 29 EUR (97 % du prix demande) renvoient tous le meme message. Le canal
  d'offre par API est donc bloque ou sous quota apres plusieurs envois, et le message
  d'erreur induit en erreur. Ne pas s'en servir pour calibrer une offre ; repasser par
  le modal de la fiche, qui lui fonctionne (onglet au premier plan obligatoire).
- 2026-08-11 — Les sollicitations spontanees arrivent en masse sur les titres likes la
  veille, mais elles portent presque toujours sur des annonces DEJA au-dessus de la cote
  et baissent de 10 a 20 % : elles restent au-dessus. Les traiter en lot, verifier la
  langue dans le titre (« juego », « cartuccia », « fur », « fantasma ») avant tout
  calcul d'ecart — c'est le filtre le plus rentable sur ce flux.
