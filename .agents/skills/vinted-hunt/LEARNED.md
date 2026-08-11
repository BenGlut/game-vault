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
- 2026-08-11 — Les motifs de filtre ancres en debut de titre ratent la moitie des cas :
  « ds notice advance wars » echappe a `^notice`, « gamecube jp » a `japon`. Ancrer sur
  le MOT (`\bnotice\b`, `\bjp\b`, `\bmanuel\b`), jamais sur le debut de chaine.
- 2026-08-11 — Une affaire reelle peut etre un DOUBLON : Kid Icarus a -25 % en boite,
  mais deja commande au meme prix ailleurs. Verifier l'inventaire (`pnpm vault search`)
  AVANT de traiter une remise comme une opportunite — sinon on rachete ce qu'on attend.
- 2026-08-11 — Une remise sur lot ACTIVE ne suffit pas : chez ledenicheur09 (5 % a 3,
  15 % a 5) le dressing ne contenait qu'un seul jeu voulu. Refaire le calcul a chaque
  fois — remise gagnee sur la cible contre cout du remplissage — au lieu de conclure du
  seul fait que la remise existe. Ici : 2,25 EUR gagnes pour 12 EUR depenses.
- 2026-08-11 — Sur les titres GameCube, le bas du classement de prix est presque
  toujours espagnol ou japonais (« juego », « sin manual », « version japonesa ») ou une
  notice seule. Lire la description des trois moins chers AVANT d'annoncer un plancher.
- 2026-08-11 — Le statut fiable d'une commande est `transaction.status` (450 = terminee)
  et les `status_message` du fil (« Livree », « Termine ! »), pas `status_title` qui est
  vide. C'est la seule facon d'attraper une livraison pour lancer `receive-order`.
- 2026-08-11 — Une « carte VIP Nintendo » se vend sous le titre EXACT du jeu, sans aucun
  indice hors description — elle est apparue en tete du classement prix sur Wind Waker
  a -33 %. Ajouter carte/vip/card au filtre, et se rappeler que sur un titre recherche
  le premier du classement doit toujours passer par la description avant d'etre annonce.
- 2026-08-11 — Balayer `transaction.status` sur toutes les commandes en un passage donne
  la carte complete : 450 = terminee/livree, 230 = en cours, 520 = remboursee. C'est le
  seul moyen fiable de reperer une livraison a passer en `receive-order`.
- 2026-08-11 — Les mots de bruit existent aussi en ANGLAIS sur des annonces francaises :
  « manual », « instruction », « box only ». Un filtre qui ne connait que « notice » et
  « manuel » les laisse passer. Doubler chaque terme de sa forme anglaise.
- 2026-08-11 — Une photo de benglut vaut audit de region : le badge USK sur une jaquette
  signe un tirage paneuropeen, pas une edition FR. Kirby Planet Robobot corrige de
  PAL-FR en PAL-EU. Verifier les badges de classification sur toute reception.
- 2026-08-11 — Rattacher une commande historique a des exemplaires DEJA en stock se fait
  a la main dans `orders.json` (items pointant sur les `inventoryId` existants) puis en
  posant `orderId`, `purchasePrice` et `acquiredAt` sur ces lignes. `add-order` ne sait
  pas le faire : il cree systematiquement de nouvelles lignes et fabrique des doublons.
- 2026-08-11 — `purchasePrice` en base est un OBJET `{amount, currency, includesShipping}`,
  pas un nombre. Une ecriture directe en JSON doit respecter ce format, sinon la
  validation Zod casse. Toujours relire un enregistrement existant avant d'ecrire a la main.
- 2026-08-11 — Le bruit etranger passe par des mots que le filtre francais ignore :
  « Spiel », « completo », « per nintendo », « nuovo », « ocasion ». Les ajouter au
  filtre de langue au meme titre que deutsch / italiano / espanol.
