# Worklog — v0.1.1 (in progress)

## Added
- Catalogue de référence complet No-Intro pour la recherche, 7 consoles Nintendo
  (GB, GBC, GBA, DS, 3DS, N64, GameCube — 14 907 jeux, 14 884 jaquettes locales 160px) :
  script `scripts/catalog/fetch-catalog.ts` (dédup par titre normalisé, inversion
  d'article, agrégation des régions, reprise auto) → `public/catalog/*.json` +
  `public/catalog-covers/<plateforme>/*.jpg`
- Page `/catalogue` : recherche dans tous les jeux sortis, filtres
  possédé/manquant et région, badge « Possédé » par titre normalisé + alias,
  sélecteur de consoles en cartes illustrées SVG (`src/app/catalogue/page.tsx`,
  `src/components/CatalogClient.tsx`, `src/components/ConsoleIcons.tsx`)
- Estimateur de bonnes affaires : cotes par variante avec boîte (cib) / cartouche
  seule (loose), moteur de verdict 5 niveaux (`src/lib/deal.ts`), commandes
  `add-price --variant`, `deal`, `price-batch` (`scripts/vault/`), export
  `quotes.json`, page `/estimateur` mobile-first avec jaquettes dans les
  suggestions et fiche visuelle du jeu sélectionné (`src/components/DealEstimator.tsx`)
  — 9 tests ajoutés
- Notation des jeux : `qualityTier` S/A/B/C/D et `buyPriority` haute/moyenne/basse
  (`src/lib/schema.ts`), commandes `rate` / `rate-batch`, options
  `--quality/--priority/--wishlist` sur add-game ; 132 jeux notés (consensus
  critique) et cotés loose+CIB (264 observations, source estimation-agent)
- Page `/recommandations` : wishlist priorisée triée par qualité avec cotes —
  23 recommandations d'achat DS/3DS ; badges QualityBadge/PriorityBadge, filtre
  qualité sur la Collection, champs qualité/priorité sur la fiche jeu
- Jaquettes dans les résultats de la page Recherche
- Support EAN : `add-game --ean` (externalIds) + affichage fiche jeu
- Favicon SVG (manette dorée sur fond sombre, assorti au logo) — `src/app/icon.svg`
- Wishlist filtrable par plateforme (boutons consoles + compteurs, priorité et
  qualité affichées, filtre en URL) — `src/components/WishlistClient.tsx`
- 20 recommandations N64/GameCube en wishlist avec qualité, priorité et cotes
  loose/CIB (40 observations) + jaquettes ; couverture jaquettes de collection
  étendue aux 7 consoles — `scripts/covers/fetch-covers.ts`
- Catalogue : bouton « Toutes » (recherche multi-plateformes sur ~15 000 jeux,
  tag plateforme par carte), filtre qualité S-D, case qualité sur CHAQUE jeu
  (lettre connue ou « ? » — jamais inventée), toutes les entrées cliquables
  (fiche si dans la base, sinon carte détaillée en modale) —
  `src/components/CatalogClient.tsx`
- Toutes les consoles dans le filtre de la Collection (compteur par plateforme,
  consoles vides grisées en attente de photos) ; badges qualité dans le Catalogue
  (note exacte pour les jeux de la base + carte curée de ~120 incontournables S/A
  GB/GBC/GBA/N64/GC — `scripts/catalog/quality-map.json`)
- Mini-estimateur intégré à CHAQUE fiche jeu (état + prix → verdict inline,
  `src/components/MiniEstimator.tsx`) ; cotes ajoutées aux 23 recommandations
  (46 observations) — toutes les fiches ont une cote active
- Boutons consoles illustrés pour filtrer la Collection par plateforme
- Entrées du Catalogue cliquables vers la fiche quand le jeu est dans la base
  (badge Wishlist distinct du badge Possédé — bug corrigé) ; lien « voir la
  fiche » sur le jeu sélectionné de l'Estimateur

- Catalogue Nintendo Switch : 3 638 cartouches physiques (base nswdb) + 1 388
  icônes officielles locales (titledb FR/US/GB/JP, matching titleid puis nom),
  icône SVG Joy-Con, 30 incontournables notés — `scripts/catalog/fetch-switch.ts`
- Badge Possédé/Wishlist du catalogue fiabilisé : matching 3 niveaux calculé au
  build (127 possédés + 39 wishlist détectés) — `src/lib/catalog-match.ts`
- Audit photo complet de la collection physique (35 photos) : 94 jeux ajoutés
  (5 DS/3DS, 4 GameCube, 11 SNES, 17 GB/GBC, 20 GBA, 35 Switch, 2 Xbox — bases
  269 jeux / 273 lignes), 22 quantités corrigées (doublons ×2/×3 vérifiés),
  2 wishlist→owned (New Super Mario Bros. DS, Poochy & Yoshi's Woolly World) ;
  export public data/public régénéré
- Wishlist de suivi de séries : 44 entrées ajoutées pour couvrir intégralement
  Professeur Layton (5), Sonic (20 : GBA, GameCube, Switch, 3DS) et Final Fantasy
  (19 : DS, GBA, 3DS, GameCube, Switch, SNES, GB), priorités haute/moyenne/basse
- Couverture complète des jeux notés S sur toutes les plateformes : 24 entrées
  ajoutées (9 SNES, 9 Switch, 3 GBC, 1 N64, 1 DS, 1 3DS) — 102 jeux tier S
  désormais suivis, aucun sans entrée d'inventaire
- Sonic Classic Collection (DS) remis en wishlist après annulation de la commande
  par le vendeur

## Changed
- Filtres persistés dans l'URL (Collection et Catalogue) : deep-link + retour
  arrière sans perdre les sélections — `CollectionExplorer.tsx`, `CatalogClient.tsx`
- Index de recherche publié enrichi (région, qualité) — `scripts/vault/lib/publish.ts`
- Jaquettes du catalogue rangées par plateforme (`public/catalog-covers/<plateforme>/`)

## Fixed
- Jaquettes Switch : le script prenait le premier résultat de recherche eShop quand
  aucun titre ne correspondait exactement, posant la jaquette d'un autre jeu
  (Légendes Pokémon : Arceus portait celle de « Drift Legends », NBA 2K23 celle de
  « NBA BOUNCE »). Correspondance désormais stricte sur l'un des titres connus du
  jeu, sinon aucune jaquette (`scripts/covers/fetch-switch-boxart.ts`)
- Jaquettes Switch : rejet des assets issus d'une autre console — Hollow Knight
  portait `SQ_WiiUDS_…`, l'illustration Wii U
- Jaquettes Switch : préférence explicite au packshot de boîte sur l'icône carrée
  du menu console lorsque les deux fiches eShop existent — 80 jaquettes sur 86 sont
  désormais de vraies boîtes, contre 35 auparavant
- Alias eShop officiels ajoutés pour 7 jeux dont le titre de la base diffère du
  titre catalogue (Pat' Patrouille ×3, Mario + The Lapins Crétins, Tomb Raider
  I-III et IV-VI Remastered, Légendes Pokémon : Arceus)
- Couverture jaquettes de la collection portée à 100 % des jeux (402/402) : les
  10 manquantes récupérées — 2 en 3DS via libretro, 4 en Switch via les packshots
  FR de l'API eShop (`fetch-switch-boxart.ts`), et 4 sans source automatisée
  (Ori: The Collection, Destiny, Star Ocean: The Last Hope, Majesco's Rec Room
  Challenge) posées à la main au format du repo (400 px, JPEG 78). Les 6 entrées
  restantes sans image sont des `kind: hardware`, pas des jeux
- Suite de tests : `hookTimeout` 60 s et `testTimeout` 30 s dans
  `vitest.config.ts` — les hooks de `cli.test.ts` et `publish.test.ts` lancent
  `pnpm exec tsx` dont le cold start dépasse les 10 s par défaut, ce qui faisait
  échouer deux suites sur huit sans qu'aucune assertion ne tombe
- Prix d'achat de Super Mario 3D All-Stars corrigé : le lot à 48,05 € contenait
  quatre articles textile en plus du jeu, celui-ci reçoit 41,07 € au prorata des
  valeurs affichées au lieu du total
- Statuts de trois commandes ramenés à `ordered` : « bordereau envoyé au vendeur »
  chez Vinted signifie que l'étiquette est éditée, pas que le colis est parti
- `update-order --status` : rectifier un statut lu trop vite chez le marchand, les
  commandes n'allant sinon que vers l'avant
- Jaquettes du catalogue : fallback sur les variantes régionales quand le fichier
  libretro préféré est corrompu (pointeur LFS) — 103 échecs N64/GC/GBA réduits à 21
  (`scripts/catalog/fetch-catalog.ts`)
- Serveur statique local : `/collection?x=y` sans slash final renvoyait 404
  (`scripts/serve-out.mjs`) — liens de la page Plateformes réparés
- e2e adaptés : les boutons de filtre sont légitimes, l'invariant lecture seule
  vérifie désormais l'absence de formulaires et de contrôles d'édition
- La Collection n'affiche plus les jeux uniquement en wishlist — ils vivent
  sur les pages Wishlist/Recommandations (`src/app/collection/page.tsx`)

- Jaquettes manquantes récupérées : fallback CDN thumbnails.libretro.com pour les
  pointeurs LFS corrompus (21→1 sur le catalogue), collection à 100 % (175/175 —
  alias wishlist réparés après un bug d'expansion zsh, « Bien-être du visage »
  retrouvé dans le repo DSi, « Mission Safari » identifié = Go, Diego! Safari
  Rescue), Switch 1 404 icônes via 12 régions titledb

## Removed
- Enrichissement post-audit mobile (inventaire du téléphone intact) : 94 jeux
  notés S-D + alias EN + 188 cotes loose/CIB ; jaquettes de collection 266/269
  (SNES/X360 ajoutés à fetch-covers, conversion sips validée par URL — les
  pointeurs LFS passent au CDN, 4 PNG corrompus réparés) ; catalogue Switch
  re-parsé (noms nswdb nettoyés : rev/kiosk/bilingues) → 3 470 jeux uniques,
  2 690 icônes ; 6 jaquettes Switch récupérées une à une via titledb/copies
- Recherche : les correspondances exactes par mots entiers passent devant le
  fuzzy (« pokemon rouge » → Version Rouge en 1er) — `src/lib/fuzzy.ts` partagé
  Recherche + Estimateur, suffixes plateforme étendus (gb/gbc/n64/gamecube/snes),
  4 tests ajoutés
- Commande `update-order` : total/port/protection/vendeur/référence + répartition
  des prix par item (met à jour order.items et purchasePrice de l'inventaire),
  arrondi centimes — `scripts/vault/index.ts`

## Changed (v2 modèle ERP)
- Statuts simplifiés : `shipped`→`fulfilled`, `received`→`delivered` (commandes et
  inventaire), dates `fulfilledAt`/`deliveredAt` + nouveau champ
  `estimatedDeliveryAt` (livraison annoncée, sortie des notes) — commandes CLI
  `fulfill-order` / `deliver-order` avec `--eta` (anciens noms conservés en alias)
- Modèle ERP « 1 article = 1 entrée de stock » : `quantity` limité à 0|1, les 29
  exemplaires en quantité multiple éclatés en entrées individuelles (280→309),
  chacune avec ses propres données d'achat ; `add-inventory` crée désormais une
  nouvelle entrée au lieu de refuser, `set-status --quantity 2` est rejeté
  (`scripts/seed/migrate-erp.ts`, `src/lib/schema.ts`, `scripts/vault/index.ts`)
- Page Commandes : dates d'expédition et livraison estimée affichées

## Changed (refonte UI)
- Interface repensée autour des jaquettes : composant `GameCard` poster (ratio 3/4,
  survol avec élévation et zoom, badges qualité/statut/plateforme superposés) et
  `GameGrid` responsive 2→6 colonnes — Collection (avec bascule Grille/Liste),
  Wishlist et Recommandations (`src/components/GameCard.tsx`)
- Fiche jeu immersive : bandeau plein écran avec jaquette floutée en fond,
  grande jaquette nette, titre en dégradé et badges (`src/app/jeu/[id]/page.tsx`)
- Thème plus contrasté (fond profond, halo d'accent, ombres portées) et
  `src/lib/labels.ts` (module pur) pour partager les libellés côté client
- Sélecteur de consoles : les plateformes vides sont repliées derrière un bouton
- Panneau latéral (`src/components/GameDrawer.tsx`) : un clic sur une carte fait
  glisser la fiche depuis la droite sans quitter la page (filtres conservés,
  Échap/clic extérieur pour fermer, ctrl/cmd-clic garde la navigation classique) ;
  branché sur Collection, Wishlist et Recommandations
- Recommandations groupées par console (compteurs de priorité par section)
- Panneau latéral = fiche complète : jaquette en grand format centrée (titre en
  dessous, rien à côté), exemplaires, cotes + mini-estimateur, commandes liées,
  métadonnées du jeu, alias et EAN ; plus de voile sombre — la grille reste
  visible et cliquable pour enchaîner d'une jaquette à l'autre
- Page Commandes : jaquettes des jeux de chaque commande (grille compacte) et
  panneau latéral disponible, total et dates en en-tête
- Icônes de navigation dessinées en composants React inline (12 icônes, style
  Lucide MIT) — aucune dépendance ni fichier externe, couleur héritée du thème
- Dashboard refait en tableau de bord : 4 tuiles cliquables (jeux possédés,
  valeur estimée vs dépensé, en transit, wishlist), commandes en attente avec
  livraison estimée, « à chasser en priorité » et « pièces les plus valorisées »
  en jaquettes, répartition par plateforme en barres, bloc « à faire »
  (à vérifier / doublons / sans cote / estimateur), derniers arrivés, historique
- Commandes : prix par article et total (le prix d'un article inclut sa part de
  port et de frais — garde-fou d'intégrité dans `store.ts`, publication des prix
  activée dans publish.config.json), badge de statut retiré des jaquettes
- Catalogue en grille de posters (mêmes grandes jaquettes que la Collection),
  badges qualité/possession superposés — `src/components/CatalogClient.tsx`
- Abréviations de collectionneurs reconnues dans les recherches (`src/lib/abbreviations.ts`) :
  « DQM 2 » trouve Dragon Quest Monsters Joker 2, « BOTW », « FFTA », « NSMB »,
  « SMT »… — actif sur le Catalogue et la Recherche, 1 test ajouté
- Skill `vinted-sync` : synchronisation des commandes via l'API JSON interne de
  Vinted depuis un onglet Chrome authentifié (7× moins de tokens qu'une capture,
  et seule méthode qui révèle le contenu réel des lots) ; limites explicites —
  jamais d'achat ni d'offre, l'engagement financier reste humain
  (`.agents/skills/vinted-sync/SKILL.md`, référencé dans CLAUDE.md et AGENTS.md)
- Commandes resynchronisées sur les totaux Vinted réels (port et frais inclus) :
  Kirby 30,10→33,89, Golden Sun 32,20→35,19, lot gabrieltrichard69 24,85→28,63,
  lot val215121 réparti au prorata des prix réels (Valkyrie 52,85…) ; 2 commandes
  manquantes ajoutées (Mario 3D All-Stars ×2 : ltim13560 56,19 et loulou280208 48,05)
- Vraies jaquettes de boîte Switch (packshots FR de l'eShop européen) au lieu des
  icônes carrées du menu console — `scripts/covers/fetch-switch-boxart.ts`
  (filtre `system_type:nintendoswitch` : sans lui, la version 3DS d'un même titre
  gagnait) ; 37/37 récupérées
- `scripts/covers/sync-from-catalog.ts` : complète les jaquettes manquantes depuis
  le catalogue déjà téléchargé, à lancer après tout `add-game`
- Panneau latéral : un badge par statut distinct avec compteur (fini les doublons
  « Wishlist Wishlist »), exemplaires annulés/remboursés sortis du stock affiché
  et résumés en une ligne, chaque exemplaire renvoie vers sa commande d'origine
- Carte poster : quantité déplacée en haut à droite (elle masquait la jaquette),
  et elle ne compte plus les exemplaires annulés
- Catalogue Nintendo Switch et Switch 2 depuis l'API de l'eShop européen :
  19 398 titres en français avec vraies jaquettes de boîte (19 396 images locales
  160px), remplace la base nswdb et ses icônes carrées —
  `scripts/catalog/fetch-eshop-catalog.ts`
- Sorties en boîte et dématérialisées séparées en catalogues distincts pour la
  Switch : 1 396 jeux vendus en boîte d'un côté, 17 502 exclusivités
  dématérialisées de l'autre (icône SVG dédiée, code « SW DIGITAL » sur la
  jaquette) ; l'eShop ne renseignant pas ce critère pour la Switch 2, ses
  500 titres restent réunis plutôt que d'inventer un découpage
- Switch 2 comme console à part entière (icône SVG, plateforme `switch2` dans le
  seed de référence) ; le Catalogue compte 10 sélecteurs
- Badge Possédé/Wishlist confronté aux deux catalogues d'une même console : un
  jeu acheté en import reste reconnu même si l'eShop FR le dit dématérialisé
  (36 des 37 jeux Switch de la base reliés) — `src/lib/catalog-match.ts`
- Catalogue : le panneau latéral remplace la mini-fenêtre — clic sur n'importe
  quel jeu, exactement la fiche de la Collection quand le titre est dans la base
  (exemplaires, cotes, estimateur, lien pleine page), fiche catalogue simplifiée
  sinon ; la navigation dans la grille reste possible panneau ouvert
  (`src/app/catalogue/page.tsx`, `src/components/CatalogClient.tsx`,
  `src/components/GameDrawer.tsx`)
- Panneau latéral à structure fixe : Exemplaire, Cotes, Commandes et Fiche du jeu
  sont toujours affichés, avec « — » ou une ligne d'explication quand la donnée
  manque, au lieu de sections qui disparaissaient d'un jeu à l'autre
- Cotes de marché réelles pour 260 jeux (GB, GBC, GBA, DS, 3DS, N64, GameCube,
  Switch) : relevés PAL de PriceCharting convertis en euros, fourchette
  basse/médiane/haute calculée sur les quantiles des 24 derniers mois d'historique
  du site plutôt que sur une amplitude arbitraire — 520 observations, source
  `pricecharting-pal` ; remplace les estimations de l'agent d'estimation
- Panneau latéral : bloc « Ailleurs » avec une recherche Vinted pré-remplie
  (titre + console, ponctuation retirée) et un lien vers la fiche MobyGames
  (titre anglais pris dans les alias, la base étant anglophone)
- Skill `vinted-hunt` : ronde Vinted autonome (commandes → base, messagerie,
  chasse aux lots, likes, négociation) — plafonds d'offre, interdit sur le paiement,
  contrôle de la version française (code produit `-FRA`, langue du jeu, état sur
  photo). Rédigé en anglais pour le coût de relecture, messages vendeurs en français.
  Trois fichiers : la règle (`SKILL.md`), le brouillon de leçons (`LEARNED.md`,
  promu dans la règle après trois occurrences) et la mémoire des actions
  (`TIMELINE.md`, lue en début de ronde pour ne pas refaire deux fois le même
  travail). L'économie de tokens fait partie du travail : expériences mesurées,
  résultats consignés, et toute promotion réécrit au lieu d'ajouter
- Wishlist étendue aux incontournables absents de la collection : 19 titres notés S
  ajoutés en priorité haute (Pokémon Game Boy et GBA, Zelda Oracle et Minish Cap,
  Metroid Fusion et Zero Mission, Banjo-Kazooie, Conker, Perfect Dark, Paper Mario
  La Porte Millénaire, Twilight Princess…) — la base passe à 300 jeux, 56 en wishlist
- `remove-inventory` : supprimer une ligne d'inventaire erronée, avec refus par défaut
  si elle est rattachée à une commande ou déjà possédée (`--force` pour outrepasser)
- Vue Commandes : bandeau de synthèse des commandes non reçues — nombre, valeur
  immobilisée, articles attendus, et répartition expédiées / encore chez le vendeur
- Dashboard : la tuile « En transit » affiche désormais la valeur immobilisée plutôt
  qu'un simple compte, et le bloc des commandes en attente rappelle le total et les
  dates de commande et d'expédition
- Tactique du lot d'appoint documentée dans le skill : la remise vendeur portant sur
  tout le panier, ajouter quelques articles à 1-3 € franchit le palier et fait
  baisser le jeu visé — avec le test « remise gagnée > coût de l'appoint » et
  l'obligation de ne compter que la quote-part du jeu dans la base
- Wishlist : ajout de `Super Mario Galaxy + Super Mario Galaxy 2` (Switch) ; cotes
  PriceCharting PAL relevées pour Luigi's Mansion 3 (CIB 24,97 € / loose 21,53 €)
  et Super Mario Odyssey (CIB 27,12 € / loose 25,62 €)
- Skill `vinted-hunt` : la pose d'un favori passe par le clic DOM sur la grille
  catalogue, jamais par l'API — `user_favourites/toggle` répond « Ok » mais ne sait
  que retirer. Piège de filtrage documenté : le `title` d'une carte contient le
  suffixe « … € protection incluse », qui faisait rejeter des annonces valides
- Commande Vinted du 11 août enregistrée : lot Kid Icarus Uprising + Pokémon Soleil
  chez lucietesolat, 32,83 € tout compris, réparti au prorata des prix affichés ;
  référence de transaction Vinted renseignée pour lever l'ambiguïté d'appariement
- Un achat validé sort le jeu des listes d'achat : Recommandations, Wishlist, compteur
  du tableau de bord et badge du catalogue partagent désormais une seule règle
  (`stillWanted` dans `src/lib/data.ts`) — une ligne wishlist résiduelle ne suffit plus
  à faire réapparaître un jeu déjà commandé ou possédé. Il n'y revient que si la
  commande tombe (annulée, remboursée) et qu'il ne reste aucun exemplaire en stock.
  Règle verrouillée par `tests/still-wanted.test.ts`
- Historique Vinted repris en entier : 118 transactions relues (contre la seule première
  page jusqu'ici), 31 depuis juillet 2026. Cinq commandes livrées manquaient à la base et
  ont été rattachées aux exemplaires déjà en stock (palaz000, xaurelienx, maelys94436),
  deux réceptions enregistrées (gabrieltrichard69, val215121), et quatre commandes en
  cours saisies avec leurs dix jeux créés (sylloup1234, boog84, emarine83, freddylct)
- Complétude partielle posée là où le vendeur annonce « sans notice » : les trois Sonic DS
  d'emarine83 et le lot GameCube de freddylct
- Toute commande d'une place de marché porte désormais sa référence de transaction :
  11 références rétro-remplies sur les commandes existantes, et `check-drift` échoue
  si une commande marketplace n'en a pas. La réconciliation se fait par identifiant seul,
  sans repasser par vendeur + date + montant
- Vue Commandes : panneau latéral dédié à la commande — cliquer une carte ouvre le suivi
  daté (commandée, expédiée, reçue, annulée, remboursée, livraison estimée), la liste des
  articles achetés avec le prix de chacun, la source, la somme des lignes confrontée au
  total payé, et l'identifiant interne. Les jaquettes gardent leur propre panneau jeu
- Vue Commandes : filtres « Toutes / En cours / Terminées / Annulées » avec compteurs
- Jaquettes : 274 → 380 sur 383 jeux. Récupération libretro relancée après ajout des
  alias anglais manquants (Star Wing → Star Fox, Kirby : Au fil de la grande aventure →
  Kirby's Extra Epic Yarn, Another Code : Mémoires Doubles → Two Memories, les deux
  Layton, Sonic Boom : Feu & Glace), et packshots eShop pour les 28 jeux Switch.
  Restent 3 jeux hors catalogue libretro : un GBA obscur et deux titres Xbox
- Le matériel entre dans la collection : un type d'entrée `game | hardware` sur le jeu
  (défaut `game`, rien ne change pour l'existant). Consoles et accessoires partagent
  l'inventaire et les commandes — donc l'historique d'achat et les montants restent
  d'un bloc — mais sont exclus du compteur « jeux possédés », de la valeur estimée et
  du décompte par plateforme. Tuile « Matériel » au tableau de bord,
  `add-game --kind hardware` à la CLI, garde-fou dans `check-drift`,
  règle verrouillée par `tests/hardware.test.ts`
- Quatre consoles saisies avec leurs commandes : Nintendo 2DS (73,59 €), 3DS XL édition
  Animal Crossing (154,24 €), 3DS XL rouge et lot Wii 2 manettes (217,24 € ensemble)
- Achat Amazon enregistré : Super Mario Galaxy + Galaxy 2 (Switch), 51,49 €
- Jaquettes : dépôt libretro Wii ajouté au script, plus les alias anglais manquants
  (Rayman contre les Lapins Crétins → Raving Rabbids, Lapin Malin → Reader Rabbit).
  392 jaquettes pour 396 jeux ; les 3 restants sont hors catalogue libretro
- Référence de transaction fabriquée automatiquement quand la place de marché n'en
  fournit pas (remise en main propre, vente de particulier) : `add-order` génère
  `<CODE>-<horodatage base 36>-<aléa 16 bits>`, ex. `LBC-msxtezmk-4f58` — unique,
  trié chronologiquement, non devinable. Codes figés VNT/LBC/EBY/AMZ plutôt qu'une
  troncature du nom. Le garde-fou `check-drift` ne peut donc plus être contourné
  par une chaîne descriptive bricolée à la main (`scripts/vault/index.ts`)
- Cotes matériel relevées : 3DS XL édition Animal Crossing (loose 221,56 € / CIB
  355,06 €, PriceCharting PAL), et pour les modèles sans fiche PAL — 3DS XL rouge,
  2DS, pack Wii, New 3DS noire — médianes des annonces Vinted actives, référence
  plus honnête pour un achat d'occasion entre particuliers
- Monster Hunter 4 Ultimate (3DS) et Rabbids 3D ajoutés avec leurs cotes
- Lot Leboncoin en main propre saisi : New Nintendo 3DS noire + 4 jeux pour 160 €,
  répartis au prorata des cotes (console 144,41 €, les 4 jeux 15,59 € ensemble)
- Super Mario Galaxy + Galaxy 2 (Switch) reçu
- La Collection ne montre plus que des exemplaires réels : un jeu dont les seules lignes
  sont annulées ou remboursées reste dans l'historique des commandes mais n'entre plus
  dans la collection (`inCollection` dans `src/lib/data.ts`, testé). Repéré par benglut
  sur Luigi's Mansion 3, présent alors que ses deux lots benj33290 avaient été remboursés

## Changed
- Dépendances mises à jour (8 PR Dependabot regroupées et validées en local avant
  fusion) : zod 3.25→4.4.3, vitest 3.2→4.1.10, @types/node 22→26.1.2, et les actions
  GitHub checkout v4→v7, setup-node v4→v7, codeql-action v3→v4,
  upload-pages-artifact v3→v5, deploy-pages v4→v5. Zod 4 vérifié au-delà de la CI :
  `pnpm vault validate` passe sur les 427 jeux réels du dépôt privé, ce que la CI
  ne teste pas
- TypeScript 5.9 → 6.0.3. TS 6 refuse les imports à effet de bord sans déclaration
  (TS2882 sur `import "./globals.css"` dans `src/app/layout.tsx`) : ajout de
  `src/globals.d.ts` qui déclare `*.css`, Next gérant lui-même ces imports au build

## Changed (session du 22-23 août)
- Notation complète : les 100 jeux sans `qualityTier` notés (112 S, 86 A, 100 B,
  94 C, 30 D) — plus aucune entrée sans rang, les filtres qualité de la Collection,
  de la Wishlist et du Catalogue redeviennent fiables
- Plateforme `switch2` ajoutée aux données : elle était définie dans
  `scripts/seed/generate-seed.ts` mais n'avait jamais été appliquée à
  `platforms.json`, donc aucun jeu Switch 2 ne pouvait être saisi
- Séries complétées en wishlist avec cotes et jaquettes : Spyro (15 entrées),
  Kingdom Hearts (5), plus Rabbids 3D, Crash of the Titans, Monster Hunter 4
  Ultimate, Super Mario RPG, Mario vs. Donkey Kong, Tropical Freeze,
  L'Épopée Fraternelle, Origami King, Tomb Raider I-III et IV-VI, Soul Reaver,
  Rayman Legends Definitive Edition
- Cotes recalées sur le marché Vinted réel là où PriceCharting s'écartait trop du
  marché français : Ghost Trick 63,69 €, Majora's Mask 3D 63,70 €, Ocarina of Time
  N64 47,94 €, Super Mario 64 N64 26,95 €, Super Mario Bros. Wonder 37,45 €,
  New 3DS/2DS XL et pack Wii. La cote PriceCharting reste utile comme plancher,
  pas comme référence
- Jaquettes : 100 % des jeux couverts, seules les 6 entrées matériel restent sans
  illustration (aucun catalogue ne couvre les consoles)
