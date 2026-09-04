# Journal des leçons — ronde Vinted

Brouillon. Une ligne datée par leçon, factuelle, la plus courte possible.
Quand une leçon revient trois fois, la promouvoir dans `SKILL.md` et la retirer d'ici.
Plafond : 30 lignes. Au-delà, promouvoir ou supprimer la plus faible.

*Compacté le 2026-08-11 (ronde 50) : 120 → 79 lignes, soit 26 leçons. Les quatre leçons « faille de
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
- 2026-08-11 — Le jour ou un titre est acquis, purger ses favoris dans la foulee : 28
  coeurs Kid Icarus retires apres l'achat. Sinon les vendeurs continuent d'envoyer des
  remises sur un jeu deja possede, et la liste cesse de vouloir dire quelque chose.
- 2026-08-11 — « caja » seul (sans « sin ») designe une BOITE espagnole vendue vide.
  Filtrer `\bcaja\b` au meme titre que `boite seule`.
- 2026-08-11 — Les mentions allemandes survivent a la normalisation sans trema :
  « fur nintendo » (fur), « und », « mit », « ohne ». Les ajouter au filtre de langue,
  `deutsch` seul ne suffit pas.
- 2026-08-11 — Une reedition economique (« Le Choix des Joueurs », « Player's Choice »,
  « Nintendo Selects ») ne vaut PAS plus que l'edition normale : la cote CIB s'applique
  telle quelle. Un vendeur qui la met en avant justifie souvent un prix superieur.
- 2026-08-11 — Sur DS aussi, le bas du classement prix est integralement disqualifie :
  sur Spirit Tracks, Ghost Trick et Castlevania, les six moins chers de chaque titre sont
  des imports, des cartouches seules ou des boites vides. Le premier exemplaire boite FR
  arrive systematiquement AU-DESSUS de la cote. Lire les six premieres descriptions est
  donc le minimum avant d'annoncer quoi que ce soit sur un titre DS.
- 2026-08-11 — L'origine etrangere s'annonce aussi en ANGLAIS : « the game is Japan »,
  « Asia version », « box and manual only ». Un filtre qui ne cherche que « jap »,
  « japon » ou « boite seule » les laisse passer.
- 2026-08-11 — ERREUR DE METHODE corrigee : `pnpm vault deal` compare a la cote CIB PAR
  DEFAUT. Sur une cartouche seule il faut `--state loose`, sinon le verdict est flatteur
  et faux (Kirby annonce a -13 %, en realite +56 %). Passer `--state` a chaque appel.
- 2026-08-11 — Les cotes en base sont des BANDES sur 24 mois : la mediane peut etre tres
  au-dessus du prix du jour quand le titre baisse. Sur Kirby Super Star Ultra, mediane
  loose 56,27 contre 29,31 au comptant, soit le bas exact de la bande. Comparer une
  annonce au prix COMPTANT (bas de bande, ou relever la cote du jour), jamais a la
  mediane seule.
- 2026-08-11 — Diagnostiquer une cote elevee en comparant PAL et US sur PriceCharting :
  si l'ecart porte sur le CIB et pas sur le loose, c'est la boite qui est rare (petit
  tirage PAL), pas le jeu. Utile pour expliquer un prix et pour savoir ou chercher.
- 2026-08-11 — Verifier la cote AU COMPTANT avant de valider une piste proposee par
  benglut : sur trois annonces qu'il jugeait interessantes, les ecarts reels etaient
  +140 %, +350 % et +119 %. Les series tres courantes (Layton) valent 4 a 8 EUR complet
  en PAL, ce qui rend n'importe quel prix a 15 EUR absurde — mais rien dans l'annonce ne
  le dit.
- 2026-08-11 — Quand un vendeur est cher sur UN article, verifier son dressing entier :
  bellon49 etait a 2-4,5x le marche sur les cinq. Un seul appel wardrobe evite trois
  evaluations inutiles.
- 2026-08-11 — LIMITE STRUCTURELLE a retenir : tout ce qui ECRIT vers un vendeur inconnu
  exige l'onglet au premier plan — bouton « Message », modal d'offre, bouton « Voir le
  lot ». Seule la REPONSE dans un fil existant passe par API. En arriere-plan, preparer
  l'URL du lot et le texte, et les remettre a benglut : c'est un clic pour lui, et cela
  evite d'annoncer une action qui n'a pas eu lieu.
- 2026-08-11 — PLANCHER D'OFFRE MESURE : Vinted refuse toute offre sous 60 % du prix
  affiche. benglut l'a constate dans l'interface sur le lot bellon49 — 55 EUR affiches,
  minimum acceptable 33 EUR, soit exactement 60 %. Calculer l'offre a partir de ce seuil
  avant de la rediger : sous 0,60 x affiche, elle ne partira pas.
  CORRECTION de la lecon du meme jour qui disait le message « prix trop bas »
  inexploitable : la regle existe. Mes essais par API restaient refuses MEME au-dessus du
  seuil (29 EUR sur un article a 30), donc c'est le canal API qui est bloque pour moi,
  pas le montant. L'interface, elle, applique bien la regle des 60 %.
- 2026-08-11 — Consequence directe : sur une annonce a plus de 1,7x la cote, aucune offre
  legale ne peut ramener le prix sous la cote. Verifier ce rapport AVANT de preparer une
  offre, sinon on fait perdre du temps a tout le monde — cas du lot bellon49, 55 EUR
  affiches contre 29,05 de cotes cumulees : meme au plancher de 33 EUR on reste a +32 %.
- 2026-08-12 — Le modal d'offre exige que la FENETRE Chrome soit visible a l'ecran, pas
  seulement que l'onglet soit actif. Trois voies testees et toutes bloquees quand
  `document.visibilityState` vaut `hidden` : clic JS, vrai clic souris via `computer`
  (CDP Input), et creation d'un onglet neuf via `tabs_create_mcp` — le nouvel onglet
  reste `hidden` si la fenetre l'est. Le seul `[role="dialog"]` monte est la banniere
  cookies. Quand benglut naviguait lui-meme (fenetre visible), le meme modal s'ouvrait
  et l'offre Kid Icarus a 17 EUR est passee. Donc : si `visibilityState` est `hidden`,
  ne pas tenter d'offre — demander la fenetre au premier plan, ou preparer le texte.
- 2026-08-13 — `/api/v2/my_orders` EST PAGINE : `pagination.total_entries` donnait 118 et
  je ne lisais que la page 1. Toujours boucler sur `total_pages` avant de conclure quoi
  que ce soit sur les commandes — c'est ce qui a masque cinq commandes livrees pendant
  une dizaine de rondes.
- 2026-08-13 — Le contenu d'un lot se lit sur la PHOTO quand le titre et la description
  sont muets : `computer{action:"screenshot"}` fonctionne meme en onglet d'arriere-plan,
  contrairement au modal d'offre. C'est ainsi qu'a ete identifie le lot freddylct
  (Super Mario Sunshine + Mario Smash Football).
- 2026-08-13 — Une fiche vendue depuis longtemps peut etre SUPPRIMEE (404) et son fil
  sortir des 6 premieres pages d'inbox : le contenu d'une vieille commande devient alors
  irrecuperable. Saisir les commandes au fil de l'eau, pas des semaines apres.
- 2026-08-13 — Pour retrouver le contenu d'une vieille commande, passer par
  `transaction.user_msg_thread_id` puis `/api/v2/conversations/<id>` : le fil s'ouvre
  par son id meme quand la recherche par login ne le trouve plus dans l'inbox, et
  `transaction.item_ids` y liste les articles du lot. Les fiches, elles, peuvent etre
  supprimees (404) — d'ou l'interet de saisir au fil de l'eau.
- 2026-08-21 — COMPARER DU TOUT-COMPRIS A DU TOUT-COMPRIS. J'ai juge le lot nono732
  "+38 %" en confrontant le prix paye (articles + port + protection) a la cote
  PriceCharting nue, qui n'inclut ni port ni frais. Le biais est systematique : il fait
  paraitre mauvais tout achat correct, et il s'aggrave quand le lot compte peu
  d'articles. Reconstituer le cout separe : chaque article aurait porte son propre port
  (~3,50-4,35 EUR) et son propre plancher de protection (0,70 EUR). Un lot de 3 economise
  donc ~10 EUR rien qu'en frais — c'est un gain reel, pas un detail.
- 2026-08-21 — LA COTE PRICECHARTING N'EST PAS LE MARCHE FRANCAIS. Ghost Trick DS :
  PriceCharting PAL CIB 35,02 EUR, mediane des 44 annonces Vinted 63,69 EUR — presque le
  double. Les rares annonces sous 35 EUR etaient allemandes, italiennes, ou une boite
  vide ("copertina manuale e custodia no gioco"). Sur les titres rares et sur les jeux
  ou la version FR se paie, relever la mediane Vinted AVANT de rendre un verdict ; la
  cote PriceCharting sert de plancher, pas de reference. benglut avait raison : il
  n'avait pas trouve Ghost Trick sous 40 EUR.
- 2026-08-21 — Le temps compte aussi dans le verdict. Commander separement, c'est autant
  de vendeurs a relancer, de colis a suivre, de points relais a visiter et de fenetres de
  litige a surveiller. Un lot un peu plus cher a l'article qui fait avancer la collection
  d'un coup peut etre le bon choix : le dire, au lieu de ne chiffrer que l'ecart a la cote.

## 2026-08-27 — Un prix Vinted n'est jamais comparable brut à un prix Amazon

benglut, sur Crisis Core FF VII Reunion : *« Crisis Core sur vinted, tu ajoute la
protecteur acheteur + frais de port … on est aus prix du neuf presque identique »*.

J'avais annoncé « marché Vinted à 19,60 – 23,80 € » contre 33,98 € chez Amazon, en
laissant croire à ~10 € d'écart. Deux erreurs cumulées :

1. **`total_item_price` de l'API inclut la protection acheteurs mais PAS le port.**
   Il faut systématiquement ajouter ~3,50-4,35 € avant toute comparaison. Le vrai
   écart était de **3,24 €**, pas 10 €.
2. **La recherche n'était pas filtrée par plateforme.** Ma liste contenait une
   version PS5 à 20,65 € et une boîte vide à 5,94 €, qui tiraient artificiellement
   le « marché » vers le bas.

**Règle** : avant d'annoncer un écart de prix, reconstruire les deux totaux livrés,
et vérifier que chaque comparable est bien la même plateforme et un exemplaire
complet. Ouvrir les annonces, ne jamais se fier au seul titre.

**Corollaire** : quand l'écart tombe sous ~5 €, le neuf marchand gagne presque
toujours — délai, retour 30 jours, facture, et aucun risque de contrefaçon. Ce
dernier point n'est pas théorique : deux cartouches défectueuses ou absentes en un
mois (Phantom Hourglass, Boîte de Pandore).

## 2026-09-01 — Ne jamais annoncer un écart à partir de PriceCharting seul

benglut : *« je n'ai jamais vu "Layton l'Étrange Village" a 4.37 euro en version FR
ni Layton et le Destin Perdu a 8.14 »*.

J'avais annoncé qu'un vendeur était à **+243 %** et **+109 %** au-dessus de la cote,
sur la base des chiffres PriceCharting PAL stockés en base. Relevé Vinted France :

| Jeu | PriceCharting | Marché FR réel | Écart réel |
|---|---|---|---|
| Layton l'Étrange Village | 4,37 € | **~12,50 €** | +20 % au lieu de +243 % |
| Layton le Destin Perdu | 8,14 € | **~14,30 €** | +19 % au lieu de +109 % |

Le sens du jugement était bon (vendeur au-dessus du marché), la magnitude était
fausse d'un facteur 10. Un écart faux à ce point détruit la crédibilité de tout le
reste de l'analyse — et benglut, qui connaît ses prix, le voit immédiatement.

**Règle** : un écart en pourcentage ne s'annonce QUE sur un relevé Vinted France du
jour. PriceCharting sert à ordonner des titres entre eux, jamais à chiffrer une
affaire. Quand le relevé FR n'est pas disponible, dire « je n'ai pas de référence
française » plutôt que de sortir un pourcentage.

**Rappel de filtrage** : dans un relevé Vinted, exclure les boîtes vides, les
« boîte + notice » sans cartouche, les notices seules et les cartes VIP — sinon la
médiane s'effondre artificiellement. C'est ce qui a gonflé l'erreur ici.

## 2026-09-04 — Relire l'état final réel avant d'écrire en base

Une négociation étalée sur plusieurs messages (swap Another Code -> Final
Fantasy IV proposé, puis Dragon Ball Z suggéré comme option plus chère) a
fait écrire en base la dernière option DISCUTÉE plutôt que celle réellement
ACHETÉE (Final Fantasy IV). Repéré par benglut en confrontant la commande
Vinted réelle à la base. Avant tout `add-order`/`update-order` qui clôt une
négociation, relire la page de commande ou la liste confirmée par l'acheteur
lui-même — jamais supposer que le dernier message du fil reflète l'issue.
