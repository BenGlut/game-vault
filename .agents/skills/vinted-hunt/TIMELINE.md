# Timeline — what the round actually did

Append-only memory. One dated line per action, readable by the next round.
A rejection MUST carry its reason, so the listing is never re-evaluated from scratch.
Keep 60 days; beyond that, compact.

*Compacté le 2026-09-07 : 930 → ~30 lignes. Le journal couvrait le 10 au 17 août et
n'avait plus été tenu depuis trois semaines ; il était pourtant lu en entier au début
de chaque ronde. Toutes les pistes qu'il contenait sont closes (commandes reçues,
vendeurs sans suite). Ce qui restait utile est ci-dessous ; le reste est dans
l'historique git.*

## Vendeurs à ne pas redémarcher

- millydressmode — offre à 60 € sur 85 € refusée le 2026-09-06, **a bloqué benglut**.
  Motif réel : chiffres de comparaison faux, message trop long, ton commercial.
  Voir `LEARNED.md` §2026-09-07. Ne pas recontacter.
- nolvnstreewearfr — litige Phantom Hourglass (boîte sans cartouche), retour initié
  le 2026-08-16, remboursement de 14,19 € suspendu à l'envoi du retour par benglut.

## Vendeurs productifs (lot déjà conclu, redémarchables)

- yamm3000 — 15 jeux à 213,98 €. Liquide sa collection, ~450 annonces DS/3DS.
- loic_schr, pommtp34 — lots de 5 jeux conclus les 6-7 septembre, colis « Petit »
  obtenu dans les deux cas via les instructions de lot copier-coller.
- jonathan_lava, alexvdnb, lisianebb — lots conclus, vendeurs réactifs.

## Pistes ouvertes

- zyeu14 — lot de 8 jeux, offre à 37 € en attente, vendeur avait annoncé « je vous
  fais ça demain » le 2026-09-06. À relancer si rien au 2026-09-09.

## 2026-09-09 — ronde chasse (favoris)

- RÉSERVE 2026-09-09 — chasse favoris sur la wishlist, périmètre N64 puis GameCube
  puis DS/3DS. Switch remis à la ronde suivante.
- 2026-09-09 — **Le like par API fonctionne** : `POST /api/v2/user_favourites/toggle`
  avec `{type:'item',user_favourites:[id]}`. La clé est `user_favourites`, pas
  `item_ids` — d'où l'échec silencieux des rondes précédentes. Plus besoin de
  cliquer les cœurs du DOM. Relecture de contrôle via `is_favourite`
  de `/api/v2/catalog/items`.
- 2026-09-09 — commandes : rien de livré. tigrou35 (Code Name S.T.E.A.M.) arrivé au
  point relais K_Deco à Bruguières le 09/09 à 15h45, à retirer. jonathan_lava (lot 4,
  64,90 €) sans scan depuis le 03/09, ETA 8-10 sept — à ouvrir si rien au 11.
  gameshelfshop pas encore expédié, deadline vendeur 15/09.
- 2026-09-09 — Zelda Phantom Hourglass : retour accepté par le vendeur le 03/09,
  aucun scan sur le bordereau. Les 14,19 € basculent chez le vendeur si le délai
  expire. Action côté benglut.
- 2026-09-09 — zyeu14 : sans réponse depuis le 07/09 21h59. Relevé des 8 jeux du lot,
  somme des médianes Vinted FR 41,74 € contre 40 € demandés ; lot conseillé à 40 €.
  Ne plus relancer (4 relances déjà envoyées).
- 2026-09-10 — chasse favoris : 130 likes posés (N64 34, GameCube 69, DS/3DS 61) sur
  33 titres de la wishlist. Périmètre Switch non traité, à faire à la ronde suivante.
  Passe de ménage ensuite : intrus retirés (t-shirt Conker, Leerhülle Double Dash,
  puntos VIP F-Zero, PLV Porte Millénaire, logo Twilight Princess, disque bonus
  Tales of Symphonia et RE4, cartridge Rhythm Paradise, 4 SMT IV Apocalypse,
  TWEWY 🇺🇸, Re:coded 🇪🇦, level list + notice GoldenEye).
- 2026-09-10 — **shinzoku** (id 189015673, 262 annonces) : boutique d'IMPORT JAPONAIS
  intégrale. Les 19 annonces sans « JP » au titre sont japonaises aussi (vérifié sur
  Twilight Princess = Wii JP, Tales of Symphonia = JP, Mario Kart 7 = JP). REJET
  DÉFINITIF, aucun lot possible — ne pas réévaluer.
- 2026-09-10 — **akane_tendo** (id 36471703, 740 annonces, 1487 ventes, note pleine,
  France) : `bundle_discount` = null, donc AUCUNE remise de lot possible, seul le port
  serait mutualisé. Un seul article de la wishlist dans tout le dressing : Resident Evil
  Revelations 3DS à 18 €, soit exactement la médiane du relevé FR (n=30, q1 14,90,
  médiane 18). Le Skylanders à 175 € est un tripack de FIGURINES, pas le jeu. Pas de lot
  à faire. Description muette sur boîte et notice — à faire préciser avant tout achat.
- 2026-09-10 — vérification deals sur les 4 candidats les plus bas (Tales of Symphonia GC,
  Lylat Wars, Rhythm Paradise, Advance Wars Dual Strike) : **aucun deal**. 16 favoris
  retirés après lecture des descriptions (1 jeu amputé du cd2, 9 cartouches nues,
  5 imports, 1 carte VIP). Relevés du jour : Symphonia n=71 méd 15 € ; Lylat n=75 méd 15,
  q1 14,90 ; Rhythm n=33 méd 25, q1 15 ; Dual Strike n=40 méd 40, q1 17,90 (bimodal).
  Ne pas rechasser ces quatre titres avant une baisse réelle.
- 2026-09-10 soir — **5 contre-propositions envoyées** (ordre de benglut : agressif, message
  court et humain, remerciement). Aucun chiffre de marché cité. Plus de message à ces
  vendeurs aujourd'hui :
  · david4713 — Coffret Sonic Origins Plus Switch, affiché 17, remise vendeur 15 → proposé 12
  · lecoindesgeeks — Metroid Prime Remastered Switch (boîte FR), 29,90 → proposé 20
  · lnnocence (BE) — Spyro Reignited Switch, 18 → 15 → proposé 11 + question boîte FR
  · mataros56 — Rhythm Paradise DS neuf sous blister, 20 → proposé 13
  · tabaxcs (IT) — RE Deadly Silence DS complet, 80 → 60 → proposé 48 si FR au dos
  Écartés : giorgiab1995 (RE Deadly Silence « no custodia » = loose), akane_tendo (RE
  Revelations déjà acheté), ozzzy18 (Re:coded ES), hispano-43 (358/2 Days neuf ES).
  ⚠️ smaug16 : offre de benglut à 12 € sur RE Revelations toujours en attente → doublon
  si acceptée, signalé à benglut.
- 2026-09-10 — Zelda Phantom Hourglass (nolvnstreewearfr) : **retour annulé**, transaction
  finalisée (450), 14,19 € perdus, contrefaçon conservée. Statut base en attente de la
  décision de benglut.
- 2026-09-10 23h26 — mataros56 : benglut avait offert 16 € sur Rhythm Paradise (22h44),
  contre-offre vendeur 18 € (22h46), mon message à 13 € parti à 22h47 = marche arrière,
  refusé. Message de lot envoyé sur ordre et texte de benglut : « Mon budget est de 33 €
  pour les trois (Rhythm Paradise neuf + RE Umbrella Chronicles + Lost in Blue
  Shipwrecked), en petit colis ». Affiché 47 €, plancher Vinted 28,20 €. Lot à créer et
  offre à poser par benglut. Relevés : Umbrella méd. 10 (n=36), Lost in Blue méd. 9,95
  (n=26) — vendeur +20 à +50 % au-dessus sur ses Wii, remise lot désactivée.
- 2026-09-10 23h34 — mataros56 : « la remise est trop importante, prenez 2 jeux pour ce
  prix » → 33 € pour DEUX jeux. Proposé à benglut : 3 jeux à 38 € (remonter est accepté).
  Nouveau circuit validé par benglut : créer le lot → taper l'offre → message dans le chat
  du lot, exécuté par l'agent après un oui explicite de benglut par offre (CLAUDE.md §8).
- 2026-09-11 — réceptions : jonathan_lava, paskalig (10/09) ; alexvdnb, nonovip94, loic_schr,
  pommtp34 (11/09). levalentinoy expédié. Restent : rathalosvg et kelevra79 en transit,
  tigrou35 en point relais, gameshelfshop non expédié (deadline 15/09).
- 2026-09-11 — réponses aux contre-propositions : **david4713 accepte à 13 €** le coffret
  Sonic Origins Plus (« au moins à 13 € et c'est à vous », envoi Mondial Relay), en attente
  du oui de benglut. lecoindesgeeks refuse 20 € (Metroid Prime R.). tabaxcs refuse 48 € (RE
  Deadly Silence) sans répondre sur le français. lnnocence : Spyro SANS boîte → décliné
  poliment. mataros56 : **Rhythm Paradise vendu à un autre** (14h14) pendant l'attente de
  la décision sur le lot — l'offre de lot n'a jamais été posée. smaug16 : offre de benglut
  à 12 € sur RE Revelations toujours pendante (doublon si acceptée).
- 2026-09-11 — Zelda Phantom Hourglass US : reçu le 26/08 (date du fil Vinted), noté
  contrefaçon, fonctionne uniquement sur DS (ordre benglut). Litige perdu, 14,19 € perdus.
- 2026-09-11 — **lukeroundplace** (IT, id 116597046, 927 annonces, 899 ventes, note pleine,
  aucune remise lot) : Spyro A New Beginning DS complet quasi neuf, PAL multilingue avec
  FR, 8,90 € (relevé FR n=68, q1 8,50, méd. 10) = prix du marché, pas une affaire ; port
  depuis l'Italie en plus. 840/927 annonces lues : rien d'autre de la wishlist DS/3DS/Switch
  (le reste possédé ou hors wishlist). Pas de lot.
- 2026-09-11 — boîtes Castlevania (benglut a une cartouche nue) : Mirror of Fate 3DS
  boîte + notice à 5,99 € (item 9712597894) ; Dawn of Sorrow DS aucune boîte seule en vente.
- 2026-09-11 — chasse favoris relancée : 41 titres DS/3DS/Switch, tri par pertinence,
  filtres titre+slug+description corrigés, 5 fiches lues max par titre.
- 2026-09-12 — **coffret Sonic Origins Plus acheté 13 €** chez david4713 (17,23 € payés,
  réf. 22185070902) : la négociation partie de 17 € affichés a abouti. Réceptions du jour :
  kelevra79 (Micro Maniacs PS1) et rathalosvg (Layton Aslantes). Restent ouverts :
  levalentinoy (en transit), gameshelfshop (non expédié, deadline 15/09), tigrou35 (point
  relais, non retiré), pommtp34 (livré, à valider par benglut).
- 2026-09-12 — Luigi's Mansion 3 Switch : relevé n=59, q1 22,50 €, médiane 25 €, q3 26 €,
  premiers exemplaires crédibles à 15-20 €.
- 2026-09-12 — lot paskalig tranché par les photos des annonces (descriptions vidées après
  vente) : **Dawn of Sorrow = cartouche seule**, étiquette NTR-ACVP-EUR (multilingue
  européenne, USK allemand) → complétude `loose`, région du jeu corrigée en PAL-EU.
  **Mirror of Fate = en boîte**, dos en français, code CTR-ACZP-FRA → PAL-FR confirmée,
  notice laissée en `unknown` faute de photo de l'intérieur. La boîte à chercher est donc
  celle de Dawn of Sorrow DS : aucune en vente au 12/09. Celle trouvée à 5,99 € est une
  boîte de Mirror of Fate, inutile.
- 2026-09-13 — VEILLE boîte Dawn of Sorrow (1re ronde) : **trouvée**. « Solo scatola
  Castelvania Dawn of sorrow DS » 14 € chez stajo92 (IT, 456 ventes, 0,96, remise lot
  active 2→5 % / 3→10 %), item 8687339825, mise en favori. Description « SOLO SCATOLA NO
  GIOCO ». Face avant PEGI 12 + USK 12 = tirage paneuropéen, cohérent avec la cartouche
  NTR-ACVP-EUR de benglut ; aucune photo du dos, donc code produit et notice non vérifiés.
  Marché des boîtes vides DS : n=115, q1 1 €, médiane 2 €, q3 5 € (les titres rares montent :
  Pokémon Noire 19,99 €, Dragon Quest 35 €). Exemplaire complet du jeu à 40 €.
  Proposé à benglut : offre à 8,50 € (plancher Vinted 8,40) + question dos/notice.
  Rien d'autre de la wishlist chez ce vendeur, donc pas de lot.
- 2026-09-13 — périmètre élargi (ordre benglut) : la wishlist devient une priorité, pas une
  limite ; tout jeu complétant la collection compte s'il est absent de la base, en DS/3DS/
  Switch, complet, FR ou multilingue FR, et sous le marché. Premier ratissage : aucune
  bonne affaire confirmée, les 3 candidats réels étaient loose, japonais ou des jaquettes
  faites main. Sonic Generations 3DS : absent de la collection, annonce à 10 € pile à la
  médiane (n=55, q1 7,90), muette sur la boîte ; les exemplaires à 3-4 € sont sans boîte.
- 2026-09-13 — commande geo91330 (FR) : Sonic Generations + Super Mario 3D Land, 6 € pièce,
  offre acceptée à 12 €, 16,78 € payés, colis Moyen. Sonic Generations sort de la wishlist ;
  **Super Mario 3D Land est un doublon** (5e exemplaire), signalé à benglut.
  Sonic Lost World 3DS reste en wishlist : relevé n=116, q1 8 €, médiane 10 €, exemplaires
  complets dès 5 €.
- 2026-09-13 — geo91330 ANNULÉE et remboursée par benglut le jour même (doublon Super Mario
  3D Land repéré par lui). Remplacée par **theophilec10** (FR) : Sonic Lost World 3DS +
  Sonic Generations 3DS + Sonic & Sega All-Stars Racing DS, 5 € pièce, offre acceptée à
  15 €, 20,43 € payés, colis Grand. Le racing est un 3e exemplaire : identifié par la PHOTO
  de l'annonce (fiches vendues vides, dressing vidé) — boîtier DS, jaquette FR, PEGI 7.
- 2026-09-13 — **VEILLE boîte Dawn of Sorrow CLOSE** : benglut a acheté lui-même la boîte
  stajo92 (offre 11 €, contre-offre vendeur 12 € acceptée, 17,85 € payés, colis Petit,
  réf. 22252959831). Commande rattachée à la fiche EXISTANTE inv_ds_castlevania-dawn-of-
  sorrow (pas de second exemplaire) ; complétude à passer de loose à CIB/no_manual à la
  réception après contrôle du dos et de la notice.
- 2026-09-13 — boîte de réception : 23 fils avec offre vendeur décodés. Recommandés à
  l'achat (offres vendeur, prix affiché) : maxou_vint Rhythm Paradise DS complet 14 €
  (n=33 q1 15 méd 25) · val.ham Spyro A New Beginning DS complet 8 € (n=68 q1 8,50 méd 10)
  · satanlegrand Spyro Eternal Night DS en boîte + Ultimate Band 6 € (n=52 q1 7,80 méd
  11,90) · madsc26 (BE) Team Sonic Racing Switch 10 € (n=43 q1 13 méd 15, langue boîte non
  vérifiée). Neutres : adelinemael Sonic Frontiers 15 € (méd 15), marinebecqwort Persona 5
  Royal NEUF 40 € (occasion méd 40), bastien-39 Luigi's Mansion 3 26 € (méd 25). Écartés :
  eno.mn Spyro EN 12 € (doublon de satanlegrand), nathan140611 LM3 30 €, almaferrer P5R ES,
  tomasrg Kirby SSU sans notice, mlobop TWEWY 120 €. Partis : danis508 LM3, lelox8756 ACNH,
  gabriel_duclos Sonic Classic Collection, biche738 Zelda PH (boîte non officielle).
  ⚠️ smaug16 : offre benglut 12 € sur RE Revelations toujours pendante = doublon.
- 2026-09-13 — wishlist « aventure / énigmes façon PC » : 10 titres ajoutés sur ordre de
  benglut — Myst, Secret Files: Tunguska, Hotel Dusk, Last Window, Time Hollow, Phoenix
  Wright ×3 (DS) ; Zero Escape VLR et Zero Time Dilemma (3DS). Déjà possédés, donc exclus :
  Syberia, Rooms, Runaway ×2, Another Code, Ghost Trick, et **Broken Sword Director's Cut,
  possédé sous son titre FR « Les Chevaliers de Baphomet »** (piège de recherche : chercher
  aussi le titre français avant d'annoncer un manque).
- 2026-09-13 — **val.ham** (FR) : lot Spyro A New Beginning DS + Myst DS, 10 € chacun, offre
  de benglut à 17 € en attente, colis Moyen. Les deux « boîte complète, jeu avec notice »,
  aucun doublon. Relevés : Spyro n=68 q1 8,50 méd 10 ; Myst n=38 q1 6 méd 10 (le bas est du
  loose/Modul). Verdict : bon lot, ~23 € livrés les deux.
- 2026-09-13 midi — commandes enregistrées : **val.ham** lot Spyro A New Beginning + Myst DS
  (offre 17 € acceptée, 22,03 € payés, réf. 22253264083) et **maxou_vint** Rhythm Paradise DS
  complet (offre vendeur 14 €, 18,28 € payés, réf. 22202880271). Trois titres sortent de la
  wishlist. Boîte Dawn of Sorrow et lot theophilec10 : bordereau envoyé aux vendeurs.
- 2026-09-13 — question benglut sur les autres « Myst-like » PC : catalogue No-Intro DS/3DS
  vérifié, **aucun portage** d'Égypte 1156 av. J.-C. (Cryo), de Shivers (les Ixupi, Sierra),
  de Riven, Myst III, Atlantis ou Amerzone. Les « Egypt » du catalogue sont des jeux de
  casse-briques/match-3 (Jewel Master, Luxor). Myst reste le seul de cette génération.
- 2026-09-13 — **Zero Escape sur Vinted** : 74 annonces « zero escape / virtue / zero time /
  nonary », dont une majorité PS Vita / PS4 (hors périmètre). Virtue's Last Reward 3DS :
  ~16 annonces 35-90 €, le gros entre 40 et 50 €. Retenus et likés (11) : 35 € UKV avec notice
  (Flipping Dutchman, NL, item 6949196298) · 37 € vendeur FR « anglais uniquement »
  (8001729599) · 40 € ×3 · 42 € · 45 € ×2 · 45 € boîte allemande · 49 € UKV · 50 € UKV CIB.
  Écartés : 30 € shinzoku (import JP, rejet définitif), 35 € « cartouche seule »
  (6971364045), 29 € et 33 € = PS Vita (29 € vérifié sur photo). **Zero Time Dilemma 3DS :
  aucune annonce** — 60 € et 90 € sont des PS4 (90 € vérifié sur photo). VLR n'est jamais sorti
  en français : UKV/allemand acceptables par la règle « boîte FR inexistante ».
- 2026-09-16 — commandes : levalentinoy LIVRÉ le 15/09 ; val.ham (15/09), maxou_vint, david4713,
  gameshelfshop (14/09) EXPÉDIÉS. stajo92 et theophilec10 : bordereau pas encore utilisé.
  tigrou35 au point relais depuis le 09/09 → risque de retour à l'expéditeur.
- 2026-09-16 — boîte de réception : 3 fils neufs seulement. nickylars0n FFCC Ring of Fates DS
  « FRA excellent état » 27→26 € (au-dessus du marché, voir ci-dessous) ; LM3 jessiejess1977 et
  F-Zero GX maurin36 déjà vendus. Offres de la ronde précédente TOUJOURS ouvertes :
  satanlegrand Spyro EN 6 €, madsc26 Team Sonic Racing 10 €, adelinemael Sonic Frontiers 15 €,
  bastien-39 LM3 25 € (a baissé de 26), marinebecqwort P5R neuf 40 €, eno.mn Spyro EN 12 €.
  smaug16 : offre benglut 12 € sur RE Revelations toujours pendante (doublon).
- 2026-09-16 — chasse via HTML (API catalogue en 404) sur 10 titres. Relevés : Hotel Dusk n=72
  q1 20 méd 29,90 · Last Window n=27 q1 45 méd 60 · Phoenix Wright AA n=61 q1 32 méd 40 ·
  Layton vs PW n=48 q1 69 méd 75 · Kirby SSU n=28 q1 60 méd 89 · Time Hollow n=5 · FFCC RoF
  ~n=25 q1 ~20 méd ~24 · Zero Time Dilemma 3DS : 0. **Tous les candidats sous q1 tombés à la
  lecture** : Hotel Dusk 8 € japonais / 10 € boîte+notice seules / 14 € « usado » ; Last Window
  23 € = BOÎTE SEULE sans jeu ; Phoenix Wright 15 € = version DE/ES/IT sans français ; Layton
  vs PW 44 € = cartouche seule ; Kirby SSU 60 € = cartouche seule ; FFCC RoF 12 € sans boîte.
  Seule piste valable : FFCC RoF complet VF 19,99 € (item 10007510342, coupure sur la tranche).
  À qualifier : Time Hollow 45 € vendeur FR muet (9952624120), Last Window 37 € vendeur DE
  « wie neu » (9756090126).
- 2026-09-16 — **lothaire.gosset** (FR, 272 ventes, 0,98) : remise de lot configurée mais à
  **0 % à tous les paliers**, donc seul le port est mutualisé. FFCC Ring of Fates DS 20 €
  complet (cartouche + boîte + notice + livret Wi-Fi) = q1 du marché. **Might & Magic: Clash
  of Heroes 18 € = DOUBLON** (reçu dans le lot jonathan_lava) — refusé malgré un prix sous le
  marché (n=4, tous à 20 €). Également chez lui : Animal Crossing Happy Home Designer 3DS
  7,68 € (wishlist, annonce muette sur la boîte, à faire préciser), Bob l'Éponge Contre les
  Robots-Jouets DS 4,50 € complet (n=16 q1 4,50 méd 5), La Princesse et la Grenouille DS
  4,50 € complet (n=59 q1 3,99 méd 4). Clochette et la Pierre de Lune 4,50 € = doublon.
- 2026-09-17 — priorité Metroid (ordre benglut). **Federation Force 3DS** : n=95, q1 12,50,
  méd. 19,99. Deux exemplaires en BOÎTE FRANÇAISE vérifiés sur photo : 10 € (9847432228) et
  12 € (9910040535) — le 10 € est la meilleure affaire, sous le q1.
  **Prime Hunters DS** : piège majeur, **6 annonces sur 6 entre 4 et 18 € sont la démo First
  Hunt** (4, 5, 7, 9, 10 et 18 € « complet »), jaquette « DEMO … FIRST HUNT » vérifiée sur
  photo à chaque fois. Les 13-20 € sont des cartouches seules. Premier vrai jeu en boîte
  confirmé : **24,90 € (9497804518)**, vendeur FR, cartouche excellente, notice non précisée.
  Alternative : 27 € (9882638290) vendeur DE, « Spiel, Hülle und Anleitung wie neu » =
  complet mais boîte allemande. Favoris : 96 au total, plus aucun N64/GameCube.
- 2026-09-18 — commandes : **Code Name S.T.E.A.M. NON RÉCLAMÉ au point relais, retour en
  cours vers tigrou35** (signalé 3 fois depuis le 09/09) — remboursement à attendre, base
  laissée en `fulfilled` tant que Vinted n'a pas validé. Nouveaux achats enregistrés :
  Sonic X Shadow Generations Switch 14 € (aaron_tlzze, 18,28 payés), **Metroid Prime
  Federation Force 3DS négocié 10 → 8 €** (probotec62, 11,98 payés, boîte FR vérifiée),
  **Spyro Eternal Night DS négocié 8 → 6 €** (satanlegrand, 9,88 payés). Reçus le 17/09 :
  Myst + Spyro A New Beginning (val.ham), Rhythm Paradise (maxou_vint), coffret Sonic
  Origins Plus (david4713, négocié 15 → 13 €).
- 2026-09-18 — négociations en cours : bastien-39 Luigi's Mansion 3 (affiché 23 €, offre
  benglut 21 €) ; lothaire.gosset lot de 4 (36,68 € affichés, offre 30 €) — message de
  relance envoyé sur ordre de benglut + question sur la boîte de Happy Home Designer.
- 2026-09-18 — chasse sur 10 titres. Relevés : Advance Wars Dual Strike n=37 q1 15 méd 20 ·
  GTA Chinatown Wars n=8 q1 20 · Hyrule Warriors Legends n=55 q1 13 méd 15 · RE Mercenaries
  3D n=52 q1 15 méd 18 · Sonic Classic Collection n=54 q1 18 méd 20 · Theatrhythm Curtain
  Call n=34 q1 20 méd 25 · Zelda Phantom Hourglass n=34 q1 10 méd 15 · Sonic Mania n=40
  q1 11,99 méd 13. **Sept candidats sous q1 vérifiés, six éliminés** : Theatrhythm 8 € =
  BOX ONLY, Sonic Classic 8 € = loose, Advance Wars 10 € = loose anglais, Hyrule 5 € =
  boîte + code sans cartouche, Sonic Mania 3 € = jaquette seule, RE Mercenaries 7 € =
  cartouche nue (photo : LNA-CTR-ABMP-EUR, USK). **Seule trouvaille : Sonic Classic
  Collection 12,90 € (9901331876), complet, BOÎTE FRANÇAISE, jeu multilingue** — vendeur
  italien, contre q1 18 et médiane 20.
- 2026-09-19 — Sonic Superstars Switch enregistré (chacharose18, affiché 18 €, offre benglut
  14 € acceptée, 18,39 payés). Négociations toujours sans réponse : bastien-39 LM3 (21 €) et
  lothaire.gosset lot de 4 (30 €).
- 2026-09-19 — **mcfix_informatica** (IT, 300 ventes, note 1, 189 annonces, AUCUNE remise de
  lot) : 108 articles Nintendo mais surtout des accessoires (pennini, kits batterie). Ses
  jeux DS « Pal Ita » à 7-10 € sont **au-dessus du marché français** : Nintendogs Teckel n=33
  q1 5 méd 5 ; Toy Story 3 n=61 q1 4 méd 5 ; Harry Potter Coupe de Feu n=32 q1 4 méd 5.
  Déjà possédés chez lui : Sonic Colours, Sonic Rush, Spyro Shadow Legacy, Spyro A New
  Beginning, Mario Party DS, Rooms, DBZ Supersonic Warriors 2. **Conclusion : pas de lot,
  seul le Sonic Classic Collection 12,90 € vaut le coup.**
- 2026-09-19 — chasse Switch : Team Sonic Racing n=29 q1 12 méd 13 (trois à 10 €) ·
  Sonic Frontiers n=48 q1 15 méd 15 (12 € « toutes langues », 10 € vendeur DE) ·
  Spyro Reignited n=30 q1 18 méd 19,90 (16 € vendeur IT « in Italiano ») · WoFF Maxima n=9
  q1 18 · Xenoblade Chronicles 3 : aucune annonce de jeu, que des stickers · Celeste : n=0.
