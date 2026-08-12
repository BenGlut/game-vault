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

## Changed
- Filtres persistés dans l'URL (Collection et Catalogue) : deep-link + retour
  arrière sans perdre les sélections — `CollectionExplorer.tsx`, `CatalogClient.tsx`
- Index de recherche publié enrichi (région, qualité) — `scripts/vault/lib/publish.ts`
- Jaquettes du catalogue rangées par plateforme (`public/catalog-covers/<plateforme>/`)
- Périmètre de chasse élargi aux titres notés S/A hors wishlist (décision benglut du
  2026-08-12), sous deux conditions fermes : ni possédé ni commandé, et prix au plus
  égal à la cote ; coût marginal d'un article ajouté à un lot chiffré
  (`affiché × remise × 1,05`, rentable jusqu'à `cote × 1,12`), avec les deux pièges
  mesurés — palier de remise sans gain et tranche de port — et le rappel qu'une offre
  au plancher bat toujours le remplissage — `.agents/skills/vinted-hunt/SKILL.md`

- Yoshi Touch & Go (DS, PAL-EU, boîte sans notice) ajouté et rattaché à une commande
  Vinted du 12/08 chez albandamet — 17,34 € rendus (13 € article + 1,35 € protection
  + 2,99 € port) ; export public régénéré (303 jeux, 341 lignes)

## Fixed
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
