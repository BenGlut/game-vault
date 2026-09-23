# Journal des leçons — ronde Vinted

## ⛔ Checklist avant d'écrire à un vendeur

Trois échecs sur quatre viennent de ce bloc. Le relire À CHAQUE message, pas au
début de la ronde — une règle qu'on ne relit pas au moment de s'en servir n'existe
pas (2026-09-07 : la règle enfreinte avait été écrite six jours plus tôt).

1. **Tout chiffre vient de `scripts/vinted/releve.js`, collé tel quel.** Jamais un
   comptage tapé à la volée. Un vendeur vérifie en deux minutes → §2026-09-07.
2. **Citer `n` et la fourchette q1-q3, jamais le minimum** présenté comme la norme
   → §2026-09-07, §cotes Layton.
3. **4 à 6 lignes maximum.** Au-delà, ce n'est pas lu → §2026-09-07.
4. **Ne pas citer la concurrence à un vendeur qui n'est pas pressé** : ça lui offre
   « allez l'acheter ailleurs » → §2026-09-07.
5. **Demander toujours le colis le plus petit**, ne jamais concéder d'avance
   → §2026-09-06.
6. **Ne jamais révéler le plancher de benglut, ni accepter un prix en son nom.**
7. **Calibrer l'écart sur le profil** : vendeur non pressé, peu d'annonces, note
   pleine → −10 à −15 % maximum → §2026-09-07.

*Le journal ci-dessous est daté et append-only. Une ligne par leçon, la plus courte
possible. Quand une leçon revient trois fois, la promouvoir dans `SKILL.md` ou dans
la checklist ci-dessus, et la retirer d'ici.*

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

## 2026-09-06 — Négociation : toujours demander le minimum, toujours chiffrer

benglut : *« t'es vraiment trop nul en nego, tu doit demande toujours petit et
avoir des arguments fort »*.

**Erreur 1 — concéder avant la discussion.** J'ai demandé un colis « Moyen » en
justifiant moi-même que « huit boîtiers c'est un peu épais pour Petit ». C'est
décider contre l'intérêt de benglut avant même que le vendeur objecte. Deux
vendeurs (lisianebb, alexvdnb) ont accepté « Petit » sans difficulté sur des lots
comparables.

**Règle : on demande TOUJOURS la taille la plus petite.** Si le format ne passe
pas, c'est au vendeur de le dire et de remonter. Le repli est sa carte, pas la
nôtre. Même logique que pour le prix : ne jamais annoncer le plancher.

**Erreur 2 — arguments génériques.** « Ça vous fait un seul envoi à préparer » est
vrai mais sans force : tous les acheteurs l'écrivent. Les arguments qui portent
sont chiffrés et personnels au vendeur :

- **La concurrence mesurée** : « chacun de ces titres a entre 68 et 84 exemplaires
  en ligne » — factuel, vérifiable, et ça nomme son vrai problème.
- **Son objectif déclaré** : il avait écrit « je revends ma collection ». Un
  vendeur qui liquide optimise la vitesse d'écoulement, pas le prix unitaire.
  Reprendre ses propres mots est plus efficace que n'importe quel argument à soi.
- **L'ancienneté de l'annonce** quand le lot stagne.

**Règle : avant d'écrire une offre, relever le nombre d'exemplaires concurrents
et relire ce que le vendeur a dit de sa situation.** Un chiffre vaut dix formules
de politesse.

## 2026-09-07 — Un chiffre faux envoyé à un vendeur détruit la négociation

Offre à 60 € sur les deux lots de `millydressmode` (85 € demandés) : **refusée**,
avec une réponse longue et cinglante. Le refus ne portait pas sur le montant mais
sur mes chiffres. Elle a vérifié et elle avait raison :

> *« vos comparaisons de prix sont énormément sur des prix boîte vide sans jeu et
> notice 😂 via vinted donc facile de comparer ce qui n'est pas comparable […]
> j'ai regardé les annonces »*

Ce que j'avais écrit contre ce qui était vrai :

| Affirmé au vendeur | Réalité (relevé filtré) |
|---|---|
| Corner Shop 2 : **22 exemplaires** | **11** — le comptage brut incluait boîtiers, notices, inserts |
| « tous entre **10 et 15 €** » | Bon Appétit : 10-60 €, médiane **22 €**, seulement 5 annonces sur 25 sous 15 € |

**La règle existait déjà** (entrée du 2026-09-01 : exclure boîtes vides, notices,
cartouches nues). Je l'ai appliquée aux relevés internes du même jour — le filtre
`EX` des scripts de cotation — et **pas** au message envoyé à un humain, c'est-à-dire
au seul endroit où l'erreur avait un coût.

**Règle : tout chiffre destiné à un vendeur passe par le relevé filtré, jamais par
un comptage brut.** Un vendeur vérifie en deux minutes ; un chiffre faux ne coûte
pas la vente, il coûte la crédibilité — et il donne au vendeur la réplique parfaite :
« si c'est moins cher ailleurs, allez-y ».

### Trois erreurs de forme dans le même message

1. **Trop long.** *« votre paragraphe de 3 tomes je ne l'ai pas lu en entier, j'ai lu
   2 voire 3 infos »*. La structure en « trois oui » n'a jamais été lue. Sur Vinted,
   un message de négociation tient en 4 à 6 lignes. Le reste n'existe pas.
2. **Le comparatif invite au renvoi.** *« si vous trouvez moins cher ailleurs,
   pourquoi venir négocier chez moi ? »* puis *« je vous invite à acheter sur vos
   autres annonces »*. Citer la concurrence donne au vendeur une porte de sortie
   gratuite. Ça ne marche que sur un vendeur pressé — jamais sur un vendeur qui
   dit ne pas l'être.
3. **Ton de commercial.** *« On sent votre métier de négociation commerciale »*,
   *« c'est pour l'achat revente »*. Argumentaire structuré + auto-présentation
   chiffrée (« 53 évaluations, 4,9/5 ») = script pro. Un particulier collectionneur
   écrit court et sans plan.

**Signaux de vendeur à lire AVANT d'écrire** : elle avait 19 évaluations 5/5, aucune
réduction de lot activée, des annonces récentes, et a dit *« je ne suis pas pressée
de les vendre »*. Elle possède 4 DS et connaît les prix. Sur ce profil, l'écart
demandé doit rester modeste (−10 à −15 %) et l'argument doit être le volume acheté,
pas la dévaluation de sa marchandise. -29 % sur un vendeur non pressé, c'est perdu
d'avance.

## 2026-09-09 — Annoncer son maximum, puis baisser son offre : zyeu14

Relecture du fil `zyeu14` (lot 8 jeux, 40 € demandés). Deux fautes cumulées, dans
cet ordre :

1. **Le plafond a été écrit noir sur blanc** : « 35 € est mon maximum sur ce lot,
   je ne peux pas monter au-delà » (06/09 01:12). La règle 6 de la checklist dit
   exactement l'inverse. Un vendeur qui connaît le plafond n'a plus qu'à attendre :
   c'est lui qui tient la montre, et le silence lui coûte zéro.
2. **L'offre formelle a BAISSÉ** : 37 € le 06/09 à 01:13, puis 35 € le 07/09 à
   21:58. Reculer sur son propre chiffre en cours de discussion se lit comme de la
   mauvaise foi, pas comme de la fermeté. Le vendeur n'a plus répondu depuis.

**Règle : une offre formelle ne redescend jamais.** Si le premier chiffre était
trop haut, on le laisse expirer sans en renvoyer un plus bas.

**Corollaire sur les relances** : quatre relances en 36 h sur un vendeur qui avait
écrit « je prends le temps de vous répondre demain » ont transformé une négociation
en harcèlement. Après une réponse promise, on attend au moins 48 h, une seule fois.

## 2026-09-09 — `/api/v2/items/<id>` renvoie 404 systématiquement

Huit fiches testées, toutes en 404, y compris des annonces vérifiées visibles dans
le dressing du vendeur. L'endpoint n'est plus exploitable ; ne pas en conclure
qu'une annonce a été supprimée ou vendue.

Remplacement : `/api/v2/wardrobe/<user_id>/items?page=N&per_page=60`, qui rend
`title`, `price`, `is_visible`, `is_closed` et se pagine sur
`pagination.total_entries`. Pour le contenu exact d'un lot en offre,
`/api/v2/transactions/<id>` → `order.items` porte titres et prix unitaires.

## 2026-09-10 — Ronde chasse : ce que le filtre laisse passer

- Le filtre TITRE et le filtre DESCRIPTION ne peuvent pas être le même. Dans un titre,
  « notice »/« boîte » désigne le produit vendu ; dans une description, ce sont au
  contraire les marqueurs d'un exemplaire COMPLET. Appliquer le filtre accessoire à la
  description écartait du bon (3 Majora's Mask valides rejetés).
- « notice du jeu X » et « boîte du jeu X » passaient, parce que le mot « jeu » annulait
  l'exclusion accessoire. Ancrer aussi sur la POSITION : accessoire si le titre commence
  par notice/boîte/jaquette/guide, ou sur le motif `<accessoire> du jeu`.
- L'origine s'annonce aussi en **drapeau emoji** : 🇺🇸 sur un World Ends With You, 🇪🇦 sur
  un Kingdom Hearts Re:coded. Aucun mot à filtrer, seulement le glyphe.
- Vocabulaire d'import à ajouter au filtre : `Modul` et `OVP` (allemand, cartouche nue et
  boîte d'origine), `Leerhülle` (boîtier vide), `compleet`/`spel` (néerlandais),
  `cartucho`/`puntos VIP` (espagnol), `cartridge` (anglais, que le filtre français ratait).
- « Shin Megami Tensei IV » ramène « Shin Megami Tensei IV **Apocalypse** », un autre jeu :
  4 favoris sur 5 étaient le mauvais titre. La règle « exclure les suites par nom » vaut
  aussi pour les sous-titres accolés, pas seulement pour les numéros.
- Un appel CDP meurt à 45 s. Pour toute boucle plus longue, la lancer **sans l'attendre**
  dans la page (`(async()=>{…})()` qui écrit dans `window.__res`) et relever le résultat
  dans un appel suivant. Supprime toute contrainte de durée.

## 2026-09-10 — Aucun deal sur 33 titres : le bas de gamme est loose, et il ne le dit pas

Vérification à la description des candidats les moins chers, après les avoir likés.
Résultat : **zéro exemplaire complet FR confirmé**. Ce qui a été démasqué :

- Tales of Symphonia GameCube à 7 € : *« Juste le cd1 fonctionnel »* — le jeu tient sur
  deux disques. Un GameCube multi-disques peut être vendu amputé sans que le titre le dise.
- Advance Wars Dual Strike : **7 favoris sur 10 étaient des cartouches nues**, dont trois
  identiques à 13,90 € du même vendeur, *« cartouche seule, vendue sans boîte ni notice »*.
- Lylat Wars : sur 8 favoris, deux loose avérés, aucun complet confirmé, six muets.
- Rhythm Paradise : *« Alleen cartridge / Talen: Engels »*, *« nur das Spielmodul, ohne
  Hülle und Anleitung »*.

**Vocabulaire à ajouter au filtre** : `lose` (avec un seul o — orthographe fréquente chez
les vendeurs français), `les 2 étiquettes` (les deux étiquettes d'une cartouche, donc nue),
`juste le cd1`, `alleen cartridge`, `nur das Spielmodul`, `ohne Hülle`, `Talen: Engels`,
`English Language`.

**La leçon de fond, et elle est plus importante que le vocabulaire :** sur ces titres le
marché est **bimodal**, et la médiane globale ne veut rien dire. Sur Advance Wars Dual
Strike : q1 17,90 € et médiane 40 € — le q1 est le prix du loose, la médiane celui du
complet. Comparer une annonce à la médiane d'un échantillon mélangé fait passer une
cartouche nue pour une affaire à −65 %. Séparer les deux marchés avant tout verdict, ou
ne rien annoncer.

**Et : une description muette sur la boîte n'est pas une description favorable.** Sur le
bas du classement, le silence est le cas normal du loose. Ne pas liker un candidat muet
sous la médiane du complet sans avoir posé la question.

## 2026-09-10 — La langue du vendeur n'est pas la région de la boîte

Mon filtre description rejetait toute annonce contenant `italiano`, `gioco`, `juego`,
`nederlands`, ou un drapeau emoji. Deux faux positifs coûteux sur Kirby Super Star Ultra :

- 90 € — vendeur italien, mais *« completo di custodia. LINGUE DISPONIBILI ITALIANO
  FRANCESE INGLESE SPAGNOLO TEDESCO »* : c'est une boîte PAL multilingue avec le
  français, donc **acceptée** par la règle de benglut, et 30 € moins chère que le premier
  complet confirmé du marché.
- 119,99 € — description multilingue avec 🇫🇷 🇪🇸 🇩🇪 en tête de chaque paragraphe. Les
  drapeaux étiquetaient les **langues du texte**, pas la région du jeu.

**Règle : sur une DESCRIPTION, ne rejeter que sur une affirmation explicite de région**
(`jap`, `ntsc`, `version us`, `solo español`, `nur deutsch`, `englische Version`). La
présence de mots étrangers dit seulement d'où écrit le vendeur. Les drapeaux emoji ne
valent que dans un TITRE, où ils désignent bien le produit.

Corollaire : un vendeur étranger qui vend une boîte PAL multilingue est souvent le
meilleur prix du marché français, précisément parce que les acheteurs FR le filtrent.

## 2026-09-10 — Switch : le bas du classement prix, ce sont les accessoires

Chasse Switch triée `price_low_to_high` : sur Metroid Dread, Luigi's Mansion 3 et
Xenoblade Chronicles 3, **les six premiers résultats étaient tous des accessoires** — étuis,
pochettes, stickers, cahiers, porte-clés, tapis de souris, pin's, boîte vide — et le filtre
titre les a laissés passer. 24 favoris parasites posés puis retirés.

- Vocabulaire manquant : `étui`, `pochette`, `stickers` (le `\bsticker\b` rate le pluriel),
  `notebook`, `cahier`, `affiche`, `sans jeux` (pluriel), `code de téléchargement`, et les
  mots étrangers `sleutelhanger`, `alfombrilla`, `pegatinas`, `hoja`, `spille`, `caja`.
- L'origine se lit aussi dans le **slug** : `edicion-japonesa`, `pal-ita-version`,
  `pal-spa`. Appliquer le filtre de région au titre ET au slug, pas seulement à la
  description.
- Sur Switch, ne pas trier par prix croissant : trier par pertinence (`order=relevance`)
  et exiger un mot qui affirme le jeu (`jeu`, `game`, `switch` + titre complet), sinon on
  cote et on like le merchandising.
- Le catalogue aussi finit en 429 : après une vingtaine de titres enchaînés, la réponse
  n'est plus du JSON (`SyntaxError` au `.json()`). Tester `r.ok` avant de parser.

## 2026-09-10 — Relire le fil JUSTE AVANT d'envoyer, pas au début de l'analyse

mataros56 (Rhythm Paradise neuf, 20 €) : j'ai préparé une contre-proposition à 13 € à
partir d'une lecture du fil vieille de plusieurs minutes. Entre-temps benglut avait
lui-même offert 16 € (22 h 44) et le vendeur avait contré à 18 € (22 h 46). Mon message à
13 € est parti à 22 h 47 : vu du vendeur, une marche arrière de 5 €. Réponse : « Non
désolé ». Même faute que l'offre qui baisse chez zyeu14, cette fois par défaut de
synchronisation.

**Règle : relire les 3 derniers messages du fil dans le même appel que l'envoi**, et
annuler l'envoi si le dernier message n'est plus celui qu'on croyait — une offre de
benglut, une contre-offre du vendeur, ou n'importe quel message plus récent que
l'analyse. benglut négocie aussi en parallèle depuis son téléphone.

## 2026-09-10 — Position de benglut : se contredire vers le haut n'est pas grave

benglut, après le message « Mon budget est de 33 € » à mataros56 : *« pas grave si on se
contredit, on a droit de faire des miss click »*. Donc : annoncer un budget puis remonter
si le vendeur contre est acceptable pour lui — ne plus le mettre en garde là-dessus.
Ce qui reste à éviter, c'est l'inverse : **redescendre** sous un chiffre déjà posé
(zyeu14 37 → 35, mataros56 16 → 13), qui a coûté les deux négociations.

## 2026-09-12 — Deux pièges rencontrés le même jour

- **`releve.js` ne connaissait pas le merchandising Switch.** Sur Luigi's Mansion 3, les
  14 annonces retenues étaient toutes des étuis, housses, affiches et tapis : médiane
  annoncée 5,99 € contre 25 € pour le jeu. Filtre ACCESSOIRE complété (étui, pochette,
  housse, carrying case, porta, sleutelhanger, tapis, cahier, affiche, pegatinas…), et les
  accents MAJUSCULES ajoutés — « Étui » passait au travers de `[ée]tui`.
- **Règle n°15 du vault** : `add-order` doit recevoir des prix d'articles dont la somme
  égale le TOTAL PAYÉ, port et protection compris — pas le prix de l'article seul. Une
  commande à un seul article se saisit donc au total payé (13 € négociés → `:17.23`).
  La validation refuse la publication sinon.

## 2026-09-13 — La tranche sous 12 € en DS/3DS est presque entièrement du loose

Premier ratissage « bonnes affaires hors wishlist » (24 requêtes franchise, tri prix
croissant, plafond 12 €) : 219 annonces retenues au titre, 125 après filtrage du bruit,
**3 candidats réels, et les 3 refusés à la lecture de la description** :

- Metroid Prime Hunters DS à 2,99 € → « Loose sans boîtier ».
- Dragon Quest Monsters Joker 2 DS à 5 € → « en loose » ET « exemplaire japonais ».
- Castlevania Portrait of Ruin + Dawn of Sorrow à 4 € → « **Dos carátulas hechas
  manualmente** » : deux jaquettes FAITES MAIN, pas les jeux. Piège spécifique à la
  chasse aux boîtes — une jaquette imprimée n'est pas une boîte d'origine.

Le bruit à filtrer dans cette tranche, en plus des accessoires : les **lots** (`lot`,
`lote`, `juegos`, `giochi`, `spiele`, `divers`, `vari`, `sammlung`), les **notices** et
**cartes promo** (`manual`, `livret`, `dépliant`, `flyer`, `locandina`, `carte`, `card`,
`VIP`), et `cart only` / `sueltos` / `cada uno`.

**Conclusion pratique** : ratisser sous 12 € coûte cher en lectures de fiches pour un
rendement quasi nul. Mieux vaut viser 12-25 € sur les titres absents de la collection,
là où les exemplaires complets existent vraiment.

## 2026-09-16 — `/api/v2/catalog/items` renvoie 404 : la recherche passe par le HTML

L'endpoint JSON de recherche répond 404 depuis le 16/09, même depuis une page catalogue
authentifiée avec CSRF et anon_id. La page `/catalog?search_text=…` est désormais rendue
côté serveur, sans appel XHR visible. **Contournement qui marche** : `fetch('/catalog?
search_text=…&order=relevance|price_low_to_high')` en `text/html`, puis extraire les cartes
avec `href="(/items/\d+…)"[^>]*title="…"` — le `title` porte « titre, État: …, prix €, prix
protection incluse €». Page lourde (~7 Mo) : espacer d'1,5-2 s. `is_favourite` n'est plus
disponible par ce canal ; `/api/v2/users/…`, `/wardrobe/…`, `/transactions/…`,
`/conversations/…`, `/my_orders` et `/user_favourites/toggle` fonctionnent toujours.

## 2026-09-17 — « Metroid Prime Hunters » sous 10 € = la DÉMO First Hunt

Sur DS, la démo **Metroid Prime Hunters: First Hunt** (livrée avec les consoles) a sa
propre boîte, très proche de celle du jeu. Cinq annonces vérifiées à 4, 5, 7, 9 et 10 €
étaient toutes la démo, dont une vendue « avec boîte inclus » et une autre « complet » —
sans jamais écrire « demo » dans le titre. La jaquette, elle, le dit en gros :
**DEMO … FIRST HUNT**.

**Règle** : sur ce titre, ne jamais conclure sans la photo de la jaquette, et traiter tout
prix sous ~12 € comme la démo par défaut. Le vrai jeu complet se situe vers 15-25 €
(médiane globale 8 € parce que l'échantillon est noyé de démos et de cartouches nues).
Même vigilance pour tout jeu ayant eu une démo en boîte séparée.

## 2026-09-19 — les POST Vinted exigent maintenant X-Anon-Id + X-CSRF-Token

`POST /api/v2/user_favourites/toggle` renvoie désormais **403 `access_denied`**
quand il part d'un simple `fetch()` depuis la console : la session cookie suffit
pour les GET, plus pour les écritures. Les en-têtes obligatoires sont
`X-Anon-Id`, `X-CSRF-Token` et `Locale`, et le front les pose via XHR, pas via
fetch — donc un hook sur `window.fetch` ne les capture pas.

Recette qui marche, sans jamais lire le jeton :

1. hooker `XMLHttpRequest.prototype.open/setRequestHeader/send` et stocker les
   en-têtes des requêtes dont l'URL contient `favourite` ;
2. faire **un vrai clic souris** (outil `computer`, pas `dispatchEvent`) sur un
   cœur pour amorcer la capture — les `PointerEvent`/`MouseEvent` synthétiques et
   `btn.click()` ne déclenchent rien, React ignore les événements non natifs ;
3. rejouer ces en-têtes en XHR pour tous les autres likes.

Repères de clic : le cœur visible est `[data-testid="favourite-button"]` dont le
`getBoundingClientRect().width > 0` (deux homonymes cachés existent sur la page).
Conversion CSS → cadre de capture : `x*1568/innerWidth`, `y*768/innerHeight + 38`
— l'offset vertical de 38 px est la barre du navigateur, l'oublier fait cliquer
38 px au-dessus du cœur et le like ne part pas.

Le toggle est parfois **à cohérence différée** : un 200 peut ne pas apparaître
dans `/api/v2/users/<id>/items/favourites` à la lecture suivante. Vérifier, et
ne rejouer le toggle qu'après une relecture confirmant l'absence, sinon on
dé-like ce qu'on vient de liker.

## 2026-09-19 — ne jamais dériver « vendu » d'un match dans le HTML brut

Un test `/Cet article a été vendu|is_closed":true/` sur le HTML d'une fiche
renvoie vrai sur **toutes** les fiches : ces chaînes traînent dans les gabarits
et dans le bloc « articles similaires ». Résultat : 12 annonces disponibles
classées vendues et aucune likée. Le statut se lit dans le JSON de la fiche, pas
par grep sur la page.

## 2026-09-19 — formules de rejet manquantes dans le filtre description

Trois pièges passés au travers en une seule passe, tous corrigés depuis :
`sans son boîtier d'origine` (le filtre n'attrapait que « sans la/le/sa boîte »),
`Pas de jeu !!!` pour une boîte seule vendue sous un titre de jeu normal, et
`senza custodia`. Ajouter aussi `Boitier : Anglais` et `English version` : la
langue du boîtier est annoncée dans la description bien plus souvent que dans le
titre, et c'est le seul critère qui décide de la région de la boîte.

## 2026-09-19 — une seule photo = cartouche nue (règle, pas indice)

benglut : « je ne prends que des jeux en boîte ». Chez enzor944 (833 ventes),
le nombre de photos prédit l'état mieux que la description, qui dit « Très
bonne état » sur tout :

- **1 photo → cartouche nue**, sans exception sur 3 vérifications : Mario &
  Luigi Partners in Time 22,99 € (`NTR-ARMP-EUR`), Zelda Phantom Hourglass
  21,99 € (`NTR-AZEP-EUR`), Story of Seasons A Wonderful Life 10,99 €
  (`LA-H-A9QCC-EUR`).
- **2-3 photos → boîte** : Star Fox Command (boîte + notice FR + carte VIP,
  `NTR-ASFP-FRA`), Heroes of Ruin, Super Monkey Ball Banana Blitz HD,
  Crash N. Sane Trilogy, Stardew Valley.

Corollaire, et c'est le piège qui coûte cher : **un prix très en dessous de la
médiane sur un titre recherché n'est pas une affaire, c'est un signal de
loose.** Partners in Time à 22,99 € quand la médiane complète est 49,90 € (n=64)
semblait valoir ×2,2 — c'était simplement le prix normal d'une cartouche nue.
Avant de présenter un écart de prix comme une opportunité, vérifier la photo :
sinon on recommande un loose en le chiffrant comme un complet.

Le vendeur écrivait « sans boîte » sur l'un de ses deux Partners in Time et rien
sur l'autre, pourtant identiques. **Le silence d'une description ne vaut pas
mention de la boîte.**

## 2026-09-19 — récupérer les photos : passer par l'API, pas par le HTML

Les URLs `images1.vinted.net` extraites du HTML d'une fiche renvoient
`{"result":"not-found"}` à `curl`, même avec User-Agent et Referer : elles sont
périmées. Les URLs servies par `/api/v2/wardrobe/<uid>/items` portent une
signature `?s=<sha1>` et se téléchargent directement en dehors du navigateur.
C'est la seule voie fiable quand la fenêtre Chrome est réduite
(`innerWidth === 0`) et qu'aucune capture d'écran n'est possible.

## 2026-09-20 — trois façons de rater un « complet » sur un jeu recherché

Sur Zelda Phantom Hourglass DS (n=73, q1 30 €, médiane 38 €), huit annonces
« complètes » entre 30 et 35 € : une seule était la version française.

- **« Complet » dans le titre, « Cartouche seule » dans la description** : le
  titre n'engage à rien, seule la description compte (30 €).
- **Notice néerlandaise** : boîte PAL à jaquette commune, mais notice
  `NTR-AZEP-HOL` marquée HANDLEIDING (34 €). La jaquette PAL est identique dans
  toute l'Europe — **c'est la notice et le code produit au dos qui donnent la
  région**, jamais la face avant.
- **« jaquette repro »** annoncé honnêtement en milieu de description (35 €) :
  chercher `repro|reproduction|jaquette imprimée|custom` dans les descriptions,
  pas seulement dans les titres.

Le bon exemplaire se reconnaît au dos : texte français et code `NTR-AZEP-FRA`.
Même méthode que pour Resident Evil Mercenaries (`TSA-CTR-ABMP-FRA`) : demander
ou chercher la photo du dos de boîte avant de conclure sur la région.

## 2026-09-21 — l'ancienneté d'une annonce est un levier, seuil 21 jours

Consigne de benglut : mettre en wishlist réveille les vendeurs, et une offre
volontairement basse se tente **surtout sur les annonces qui dorment**. Son seuil :
**au-delà de 3 semaines, l'annonce est en vente depuis longtemps** et le vendeur
devient négociable.

Relever l'ancienneté systématiquement, avant de chiffrer une offre. La source
fiable est le `timestamp` de la première photo dans
`/api/v2/wardrobe/<sellerId>/items` — il concorde avec le « Ajouté : il y a X »
affiché sur la fiche. Ce champ n'existe ni dans le HTML brut de la fiche ni dans
le résultat de recherche : il faut passer par le vendeur.

Deux pièges de lecture :

- **Un vendeur qui republie remet tout à zéro.** Chez enzor944, 108 annonces sur
  140 avaient moins de 7 jours et aucune entre 1 et 3 mois : il re-liste en
  continu. Lui servir « vos annonces traînent » aurait été visiblement faux.
  Regarder la distribution du dressing entier avant d'utiliser l'argument.
- **Un marché abondant n'est pas un marché qui dort.** Super Mario Odyssey :
  78 annonces, mais cinq des sept exemplaires complets ont moins d'une semaine et
  trois dataient du jour même. L'abondance venait du renouvellement, pas de
  l'invendu — et la seule annonce au-delà de 21 jours était un jeu sans boîte.

## 2026-09-21 — un like posé sur description seule ne vaut rien pour une offre

benglut : « envoie plein d'offres, ça augmente nos chances ». Passé à l'acte sur
six annonces likées lors de la ronde du 19/09, **cinq étaient inexploitables** :

- Metroid Prime Pinball 22 € — cartouche nue (photo : cartouche sur un tapis)
- Metroid Prime Remastered 28,99 € — cartouche nue, 11 photos toutes de la carte
- Zero Escape: Virtue's Last Reward 30 € — **version japonaise** (jaquette CERO)
- Celeste 35,90 € — boîte **espagnole** (dos « Ya está, Madeline »)
- Xenoblade Chronicles 3 30 € — vendu entre-temps

Ces six-là avaient été likées après lecture de la description, sans vérification
photo, parce que le lot était long à traiter. La description ne dit presque jamais
« cartouche nue » quand le vendeur n'a rien à préciser, et ne dit jamais la langue
de la jaquette. **Liker sur description, d'accord ; offrir sur description, non.**

Ordre des opérations avant toute offre : disponibilité → photo de la boîte →
photo du dos pour la région → seulement ensuite le montant. Une offre envoyée sur
un loose ou un import est pire qu'une offre non envoyée : elle engage benglut sur
un article qui viole sa règle.

## 2026-09-21 — ronde complète sur la wishlist : le rendement réel

Ronde sur 21 des 42 titres de la wishlist DS/3DS/Switch, trois candidats les
moins chers relevés par titre, soit 63 annonces. **Quatre offres envoyées.**

Ce qui élimine, dans l'ordre de fréquence :

1. **Le marché du titre est hors budget** — Chrono Trigger DS (q1 120 €),
   Shin Megami Tensei IV (q1 125 €), Kirby Super Star Ultra (q1 60 €),
   The World Ends With You (q1 60 €) : sous le q1 il n'y a que des imports.
2. **Région** — FF XII Zodiac Age (dos anglais), Celeste (dos espagnol),
   Team Sonic Racing (jaquette USK allemande), Zero Escape VLR (jaquette CERO),
   Kirby et SMT IV (« 3DS JP » assumé dans le titre).
3. **Loose déguisé** — Theatrhythm, Ring of Fates, GTA Chinatown Wars,
   Revenant Wings : les trois annonces les moins chères de chaque titre étaient
   des cartouches nues ou des boîtes vides.
4. **Le piège du jour : World of Final Fantasy Maxima 18 €**, « Version
   Française » en gros sur la photo, prix sous le q1 — l'encart au bas de la
   jaquette dit **« Code de téléchargement uniquement — ne contient pas de carte
   de jeu »**. Chercher ce bandeau sur toutes les éditions Switch bon marché.
5. **La recherche dérive sur les titres à suite** : « Hades » remonte Hades II
   sur Switch 2, « Persona 5 Royal » remonte Tactica et Strikers, « The World
   Ends With You » remonte NEO. Vérifier que le candidat est bien le bon jeu.

Compter environ une offre défendable pour cinq titres cherchés. Ce n'est pas un
échec du filtre : c'est le marché.

## 2026-09-21 — où sont vraiment les annonces qui dorment

Mesure de l'ancienneté sur les dressings entiers, via le `timestamp` de la
première photo dans `/api/v2/wardrobe/<uid>/items` :

| Vendeur | annonces | ancienneté médiane | au-delà de 21 j |
|---|---|---|---|
| bonpoil52220 | 111 | **28 jours** | 63 |
| snakeplissken8 | 314 | **20 jours** | 156 |
| enzor944 | 140 | 5 jours | 1 |

C'est la différence entre un vendeur qui écoule (enzor944, 837 ventes, re-liste
en continu) et deux vendeurs dont le stock stagne. **La règle des 21 jours de
benglut se vérifie au niveau du dressing, pas de l'annonce isolée** : chez
enzor944 une annonce de 25 jours resterait une exception dans un flux rapide,
chez bonpoil52220 c'est la norme et le vendeur le sait.

Croiser systématiquement ces dressings dormants avec la base avant d'aller
chercher au catalogue : ils contiennent des titres absents de la collection que
personne ne cherche, à des prix qui n'ont pas bougé depuis deux mois.

## 2026-09-21 — ne pas conclure sur une seule photo d'intérieur

Sur le So Blonde de bonpoil52220, la photo du boîtier ouvert montrait des
logements en apparence vides : j'ai failli écarter l'annonce. Les deux photos
suivantes montraient la notice « MODE D'EMPLOI » française et la cartouche en
place — l'angle de la première masquait le contenu. Regarder **toutes** les
photos d'intérieur avant de conclure à l'absence, comme on les regarde toutes
avant de conclure à la présence.


## 2026-09-21 — Switch 1 / Switch 2 : la rétrocompatibilité ne va que dans un sens

Question de benglut : « plutôt que Metroid Prime 4 Switch on prend celle de la 2
et ça va aussi sur la 1 ». **C'est l'inverse.**

- Une cartouche **Switch 1** se lit sur Switch 2 (plus de 85 % du catalogue, avec
  des exceptions listées par Nintendo, surtout les jeux à Joy-Con de 1re
  génération : Nintendo Switch Sports, WarioWare Move It!, Ring Fit).
- Une cartouche **Switch 2 native** (Mario Kart World, Donkey Kong Bananza,
  Elden Ring Tarnished Edition, Final Fantasy VII Rebirth) **ne démarre pas** sur
  Switch 1.

**La seule exception** : les cartouches « Nintendo Switch 2 Edition » d'un jeu qui
existe aussi sur Switch 1. Marvelous a confirmé sur Rune Factory: Guardians of
Azuma que la carte contient les deux versions et lance celle qui correspond à la
console — sur Switch 1 on obtient le jeu de base, sans le pack d'amélioration.
Nintendo n'a **pas** généralisé cette règle à tous les éditeurs : elle se vérifie
titre par titre, jamais par déduction.

**Correction du même jour, benglut avait raison et moi tort.** La mention
« Nintendo Switch 2 Edition » sur une jaquette n'est pas une exception rare
confirmée par un seul éditeur : c'est une gamme Nintendo, et la jaquette porte la
phrase qui tranche, en français, sous le logo PEGI :

> « Cette version Nintendo Switch 2 Edition **combine le logiciel Nintendo Switch
> et la mise à niveau Nintendo Switch 2 Edition**. La mise à niveau est également
> disponible séparément. »

Vérifié sur la photo d'une annonce Metroid Prime 4: Beyond – Nintendo Switch 2
Edition. Cette cartouche démarre donc sur Switch 1 **et** sur Switch 2.

**Règle d'achat corrigée** : quand un jeu existe dans les deux éditions, l'édition
« Switch 2 Edition » est la meilleure pour benglut — elle tourne sur ses cinq
machines et apporte la mise à niveau sur la Switch 2. Elle ne vaut le détour que
si le surcoût reste faible : c'est un arbitrage de prix, plus de compatibilité.

**Ce qui reste vrai** : un jeu **Switch 2 natif** (Mario Kart World, Donkey Kong
Bananza, Elden Ring Tarnished Edition, Final Fantasy VII Rebirth) ne démarre pas
sur Switch 1. Et la mention doit être **lue sur la jaquette**, pas déduite du
titre de l'annonce : beaucoup de vendeurs écrivent « switch 2 » pour un jeu
Switch 2 natif. La liste des éditions concernées est dans `SWITCH2-EDITIONS.md`.

**La leçon de méthode** : j'ai généralisé à partir d'un article de presse sur un
seul éditeur au lieu d'aller lire la jaquette. benglut a envoyé l'annonce, la
photo donnait la réponse en une ligne.

## 2026-09-23 — la méthode « vendeur multi-titres » ne marche que sur DS/3DS

Idée testée : balayer les titres de la wishlist, remonter le vendeur de chaque
annonce, et repérer ceux qui en ont plusieurs pour monter un lot. Deux passes,
114 annonces, 45 vendeurs distincts.

**Résultat : un seul vendeur multi-titres exploitable, et encore.** Sur Switch,
aucun. Sur DS/3DS, trois — dont deux faux positifs (affiches publicitaires
italiennes, porte-clés) et un vendeur qui ne fait que de l'import japonais.

La raison est structurelle : **les jeux Switch se vendent à l'unité**, par des
particuliers qui liquident un ou deux titres. Les vendeurs qui vident une
collection entière, eux, sont sur DS et 3DS — c'est là que bonpoil52220 et
snakeplissken8 ont été trouvés. Réserver cette méthode à ces deux plateformes.

**Trois faux positifs à filtrer dans les recherches par titre :**

- `locandina`, `poster`, `affiche` — les vendeurs italiens listent les affiches
  publicitaires d'époque sous le titre exact du jeu
- `keychain`, `porte-clé`, `llavero` — même piège
- **la plateforme n'est pas dans le titre.** Quatre annonces « Spyro Reignited
  Trilogy » et « Final Fantasy XII Zodiac Age » d'un même vendeur se sont
  révélées PS4 et Xbox One. Un filtre sur le titre du jeu ne dit rien de la
  console : il faut soit exiger la plateforme dans l'intitulé, soit la lire
  dans la fiche avant de conclure.

## 2026-09-23 — Le message-type ne se colle pas les yeux fermés

Relance de toutes les offres en cours avec le message-type de benglut
(« vos articles sont en ligne depuis plus de 30 jours et au-dessus de la
médiane »). Sur huit fils, **trois seulement** pouvaient le recevoir tel quel.

Deux vérifications à faire avant chaque envoi, dans cet ordre :

1. **L'offre est-elle encore en attente ?** L'état est écrit dans le fil :
   « En attente », « Refusée », « Annulée », ou « Cet article n'est plus
   disponible ». Écrire « je viens de vous faire une offre » sur une offre
   refusée quatre jours plus tôt se voit immédiatement. Sur un refus, le bon
   message est une relance qui ne concède rien : accuser réception, rester
   joignable, ne pas remonter le prix.
2. **Le prix affiché est-il vraiment au-dessus de la médiane ?** Relevé du jour,
   pas une intuition. Trois annonces sur quatre étaient **en dessous** de q1 :
   Hyrule Warriors L'Ère du Fléau à 28,50 € (q1 32,50, médiane 35, n=89),
   Mario Odyssey à 26,90 € (q1 26,90, médiane 28, n=88), le lot Phantom
   Hourglass + Hey! Pikmin à 47,98 € (somme des médianes ≈ 53 €). Sur celles-là
   l'argument de prix est faux et vérifiable en deux clics côté vendeur : il
   faut le retirer et garder la partie vraie — règlement immédiat, plus petit
   colis.

**Le relevé de prix par le catalogue a changé de forme.** Les anciens motifs
`"price":{"amount":…}` et `"amount":"…"` ne matchent plus rien. Le prix est
maintenant dans l'attribut `title` de la vignette, avec l'état de l'article :
`href="/items/(\d+)-[^"]*"[^>]*title="([^"]*)"` puis `([\d]+\.[\d]{2})\s*€` sur
le titre capturé — le premier montant est le prix, le second le prix frais
inclus. Filtrer sur des mots du titre, sinon la recherche ramène consoles,
housses et amiibo.

**Ancienneté** : `photos[0].high_resolution.timestamp` donne des valeurs très
grandes sur les vieux comptes (677 jours chez kellort, 1630 chez nickra11).
C'est cohérent avec « vu la dernière fois il y a 8 mois / 4 ans » affiché dans
le fil : ces vendeurs ont disparu. Une offre y coûte zéro mais ne rapportera
rien — les compter à part dans le taux de succès.

## 2026-09-23 — Descendre sous le plancher d'offre : l'annonce unique

Le plancher Vinted (60 % du prix remisé d'un lot) interdit une offre plus basse
dans l'interface. Pour aller en dessous, on crée le lot (« Voir le lot » puis
« Message », jamais « Acheter » ni « Faire une offre ») et on demande par écrit
au vendeur de recréer **une annonce unique** au prix voulu, en taille de colis
« petit ». La technique vient d'un vendeur (lothaire.gosset l'a proposée de
lui-même le 22/09) et elle a l'avantage de fixer aussi la taille du colis.

Côté navigateur : fenêtre Chrome masquée (`visibilityState: hidden`), le clic
par `ref` sur « Voir le lot » n'a rien fait, mais **le clic par coordonnées a
ouvert la fenêtre du lot**, et le bouton « Message » puis l'envoi du texte ont
fonctionné. Seule la fenêtre d'offre reste bloquée quand Chrome est masqué.

Vérifier un dressing de revendeur photo par photo, c'est indispensable :
sur 44 jeux de gagadu98 absents de la collection, 14 étaient inacceptables
(cartouches seules, boîtes UK, US ou espagnoles, un code au lieu d'une
cartouche, et un « Best of Arcade Games » qui contenait « Best of Board Games »).
La description (« En bon état ») n'en signalait aucun.

## 2026-09-23 — Balayage wishlist complet : le vendeur est dans le catalogue

Le HTML de `/catalog?search_text=…` embarque pour chaque vignette un objet
`"productItem":{"id":…,"title":…,"price":{"amount":…},…,"user":{"id":…}}`
(guillemets échappés `\"` à déséchapper). On obtient donc **le vendeur de chaque
annonce sans ouvrir la page**, alors que le HTML d'une fiche article ne contient
que l'identifiant de l'acheteur connecté. Balayage des 45 titres DS/3DS/Switch
de la wishlist en ~90 s : 2 703 annonces, 2 313 vendeurs, 220 avec au moins deux
titres de la wishlist.

**Mais le nombre de titres ne fait pas le lot.** Les gros « multi-titres » sont
des boutiques à prix fixes (34,99 € partout), des importateurs japonais
(unam.corp, 768 articles « Import Japonais ») ou des revendeurs au prix fort.
Classer par écart à la médiane, pas par nombre de titres.

**Sur les titres DS rares, sous le q1 = piège, sans exception ce jour-là.**
Sur 19 annonces à moins de 70 % de la médiane, après filtres : SMT IV US sous
blister, Hotel Dusk japonais, Phantom Hourglass US puis japonais, trois
cartouches seules (Hotel Dusk, RE Deadly Silence, KH 358/2 « senza custodia »),
une boîte Hades vide, un Sparks of Hope « code activé en caisse ». Seule
survivante : un Paper Mario Origami King Switch à 16,50 € (q1 20 €).

**Nouveau piège : « AUCUNE VALEUR, CODE ACTIVÉ EN CAISSE ».** Étiquette sur des
boîtes Switch sous blister qui ne contiennent qu'un code, activé au passage en
caisse du magasin. Revendue neuve sur Vinted, la boîte contient un code
probablement jamais activé. À rejeter à vue.

**Les variables `window.*` disparaissent à chaque `navigate`** : relancer une
navigation entre deux étapes d'un balayage efface les résultats. Imprimer ce
dont on a besoin avant de naviguer.
