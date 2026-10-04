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
- 2026-09-19 — offres posées par benglut dans la nuit : ste8777 Metroid Prime Hunters 24,90 €
  → offre 15 €, **contre-offre vendeur 20 € en attente** (vrai jeu en boîte, vendeur FR) ;
  junko997 Sonic Classic Collection DS 13 € → offre 10 € (jaquette FRANÇAISE vérifiée sur
  photo, « 4 classiques en un jeu », PEGI 3, vendeur FR 65 ventes) ; dimitrider Sonic
  Frontiers Switch 12 € → offre 10 € (annonce « prix fixe »).
  **mcfix_informatica refuse toute offre** (« nous n'acceptons pas les offres ») → préférer
  junko997 pour le Sonic Classic, même prix sans port international.
  lothaire.gosset : toujours aucune réponse depuis le 16/09 sur le lot de 4 à 30 €.
- 2026-09-19 — **ste8777** (FR, 613 ventes, note 1, remise lot 3→10 %) : Metroid Prime Hunters
  24,90 €, contre-offre 20 €. Photos : **édition française confirmée, code NTR-AMHP-FRA**,
  dos intégralement en français, MAIS **jaquette déchirée en bas du dos** (« boîte voir
  photo »). Notice non précisée. Le reste de son dressing ne vaut pas le palier de remise :
  lot de 10 jeux DS/3DS 14,90 € = **cartouches nues** (photo), WarioWare D.I.Y. 9,90 € =
  cartouche nue (NTR-UORP-EUR), lot de 3 jeux 3DS = Spy Hunter + Lego Chima + Sonic Boom
  Feu & Glace (déjà possédé). Ses jeux Switch sont au-dessus du marché : Monster Hunter
  Stories 2 à 29,90 € contre médiane 20 (n=45), Mario Tennis Aces 24,90 contre 18,95 (n=47),
  WarioWare Get It Together 19,90 contre 19 (n=54). **Conclusion : prendre le Metroid seul.**
- 2026-09-19 — **Metroid Prime Hunters ACHETÉ** chez ste8777 : contre-offre 20 € acceptée,
  24,58 € payés, colis Petit. Édition française NTR-AMHP-FRA, jaquette déchirée au dos,
  notice à contrôler à la réception. La case DS de Metroid se referme (reste Prime Pinball).
- 2026-09-19 (2e ronde) — 8 titres ratissés, **aucune affaire achetable**. Relevés :
  Kirby SSU n=29 q1 62 méd 90 · KH 358/2 Days n=13 q1 30 méd 50 · KH Re:coded n=2 (130 et
  230 €) · RE Deadly Silence n=30 q1 70 méd 80 · FF XII Revenant Wings n=50 q1 12 méd 15 ·
  Metroid Prime Pinball n=5 q1 24,99 méd 25 · Skylanders Spyro's Adventure : que des
  figurines, aucun jeu 3DS · AC Happy Home Designer : recherche HTML sans résultat.
  Candidats sous q1 tous éliminés : KH 358/2 « 🇫🇷 » à 14,99 € = **boîte sans cartouche**,
  Revenant Wings 6 et 7 € = boîtiers vides, RE Deadly Silence 19 € = carte VIP grattée et
  30 € = cartouche seule, **Metroid Prime Pinball 22 € = cartouche nue** (NTR-AP2P-EUR,
  photo) chez un vendeur noté 0,4 sur 4 ventes.
- 2026-09-19 — **snakeplissken8** (FR, 143 ventes, note 1, 325 annonces, AUCUNE remise de lot,
  « prix ferme », pas de Vinted Go ni La Poste → Mondial Relay). Absents de la base et
  vérifiés en boîte sur photo : **Xenoblade Chronicles 3D New 3DS 9,99 €** (marché n=90,
  q1 et médiane 20 — jaquette FR « uniquement sur New Nintendo 3DS », tourne sur la New 2DS
  XL de benglut), **Rodea The Sky Soldier 3DS 9,99 €** (n=44, q1 13,99, méd. 16,99, boîte
  PAL NIS America), **So Blonde Retour sur l'île DS 9,99 €** (jaquette FR ; aucune référence
  de marché, seules des copies allemandes du 1er épisode à 4-5 €). Autres options : Ninja
  Town DS 4,99, Away Shuffle Dungeon DS 12,99, La Nouvelle Maison du Style 3DS 2,99, Shin
  Megami Tensei V Switch 14,99 (édition différente du Vengeance possédé). Doublons chez lui :
  Kirby Battle Royale, Paper Jam Bros, A Link Between Worlds, Ocarina of Time 3D, Ghost
  Trick, Lucky Luke, Yo-kai Watch 2. Son Zelda Phantom Hourglass à 49,99 € est hors marché
  (médiane 15).

## 2026-09-19 — lot snakeplissken8 enregistré, passe de likes wishlist

**Commandes.** Le lot snakeplissken8 (22416001431, 55,03 €) acheté par benglut
est entré en base : So Blonde Retour sur l'île, Away Shuffle Dungeon, Rodea the
Sky Soldier, Ninjatown, Xenoblade Chronicles 3D — cinq titres créés, cinq lignes
d'inventaire en `ordered`. Xenoblade Chronicles 3D confirmé à 9,99 € contre trois
exemplaires relevés à 15 € le même jour : la meilleure ligne du lot.
Trois commandes passées en `fulfilled` (bordereau/expédition confirmés côté
Vinted) : boîte Dawn of Sorrow (stajo92), lot Sonic 3 jeux (theophilec10),
Sonic X Shadow Generations. Restent deux livraisons à valider par benglut sur
Vinted (rathalosvg, pommtp34) et le remboursement Code Name S.T.E.A.M. à saisir.

**Chasse.** Relevé sur 24 titres de la wishlist DS/3DS/Switch. Le tri
`price_low_to_high` est inutilisable : il remonte des cartes Pokémon, des
vêtements et des goodies avant le moindre jeu. Seul `order=relevance` combiné à
une regex exigeant le titre du jeu dans l'intitulé donne un résultat exploitable.

**9 annonces likées** après lecture de description : Sonic Mania Plus 9,90 €,
Team Sonic Racing 10 €, Luigi's Mansion 3 20 €, Metroid Prime Pinball 22 €,
Metroid Prime Remastered 28,99 € (PAL EUR), Zero Escape Virtue's Last Reward
30 €, Xenoblade Chronicles 3 30 €, Metroid Dread 35 €, Celeste 35,90 € (contre
60-100 € relevés, la meilleure anomalie de la ronde).

**9 écartées** pour la raison exacte lue en description : Hotel Dusk 8 €
(japonaise), Theatrhythm 8 € (box only) puis 10 € (loose), Hyrule Warriors 5 €
(boîte + code, sans cartouche) et 10 € (sans boîte), Ring of Fates 10 € (sans
boîtier), GTA Chinatown Wars 17 € (senza custodia), Phoenix Wright Justice for
All 20 € (boîte IT/ES/PT), Persona 5 Royal 26,99 € (boîtier anglais), Last
Window 23 € (boîte seule, « pas de jeu »), Advance Wars Dual Strike 10 €
(cartouche nue), FF XII Revenant Wings 9,99 € (boîte allemande USK).
Une seule annonce sur deux passe le filtre titre ; une sur trois survit à la
lecture de la description.

**Marché relevé.** Professeur Layton vs Phoenix Wright ne descend pas sous
59,99 € (plancher sur 6 annonces) ; Time Hollow part de 30 € et grimpe à 105 € ;
Last Window complet tourne à 35-44 €. Ces trois-là resteront chers.

- 2026-09-30 — VEILLE watchlist (17 titres, HTML). **Passent les 3 filtres** : Hotel Dusk 19 € ×2
  chez el_sales (BE) 9906694191 et 9907172153 — boîte NTR-AWIP-FHG (DE/FR/NL), notice, cartouche,
  en ligne depuis 24 j ; Phoenix Wright AA boîte NTR-AGYP-FHUG (EN/FR/DE/NL) : rulius22 29 €
  (10071102145, notice FR), cashexseraing 29,99 € (10008248037, liké), mr.offspring 28 €
  (10039475294, déjà dans l'offre 140 € sur ses 4 Ace Attorney). **Rejets à ne pas réévaluer** :
  Trials 45 € ibou07 (10031982424) = boîte allemande NTR-YG3X-NOE/USK ; Trials 36 € cartouche
  seule, 31 € sans boîte ; SMT IV 95 € = US ; Chrono Trigger 80/90 € = JP, 90 € jap/us, 90 € sans
  boîte, 79 € Modul seul ; TWEWY 25 € = NEO Switch, 35 € = Switch ; VLR 20 € (9782978251) =
  cartouche nue UKV ; RE Deadly Silence 34,99 et 34,90 € = cartouches seules ; JFA 25 € sans
  boîte, 26 € anglais, « Ace attorney » 24 € = JFA boîte USK ; PWAA 25 € oazard = cartouche nue,
  12 € = JP ; Hotel Dusk 14 € sans boîte, 8 € JP, 10 € boîte seule, 15 € aro3544 cartouche nue,
  15 € gustavstadi boîte USK (dos non montré), 18 € sans boîte. So Blonde et Tunguska déjà en
  collection : à sortir de WATCHLIST.md. Offres : thesmil 16 € relancée le 25/09 sans réponse ;
  bastien-39 LM3 21 € en attente depuis le 17/09 alors que LM3 a été acheté chez reishi06.
- 2026-09-30 — VEILLE (2e passage, tâche planifiée). **Nouveau : Zero Escape VLR 3DS 40 €** chez eltrall
  (IT, 55731852, 57 avis 5/5) 6233597584 — boîte PAL PEGI 16, guide MAA-CTR-AKGP-UKV, cartouche
  LNA-CTR-AKGP-UKV, en ligne depuis 519 j, vendeur vu le 18/09. Déjà en favori (le toggle l'a retiré
  puis remis : l'état se lit sur `is_favourite` du wardrobe, la liste favoris ne le montrait pas).
  PWAA au seuil pile 30 € : 9826483608 et 4967630144, complets multilingues FR. **Rejets** : VLR 30 €
  9948319608 = JP (CERO, CTR-AKGJ-JPN) ; VLR 45 € 5392954492 = boîte allemande ; ZTD 90 € 7955520751
  et 60 € = PS4 ; PWAA 25 € 9609422274 = cartouche nue ; JFA 25 € 7290790498 = PT, 30 € = DE ;
  KH 358/2 28 € ×2 = sans boîte / JP. Offres : thesmil toujours muette (2 articles encore en vente) ;
  mareck86 Trials : contre 78 € ferme du 25/09, offre 68 € en attente.
- 2026-10-02 — VEILLE (tâche planifiée). Colis : aucun en point relais ; Sonic Superstars chacharose18 retourné, excuses déjà envoyées le 01/10, pas de réponse. **Passent les 3 filtres** : JFA 30 € anne-sophie.bzh 10196562376 (NTR-A2GP-FHG DE/FR/NL, notice, cartouche, en ligne depuis 2 j, liké) ; Hotel Dusk 20 € watcha29 10035572539 (NTR-AWIP-FHG, notice, cartouche, 15 j) ; VLR complet UKV (pas d'édition FR) : theflippingdutchman 35 € 6949196298 (402 j), romainb893 40 € 10097502300, bonneaffairesforyou 40 € 10018601589, ohko 40 € 2455445635. **Rejets** : SMT IV 89 € 9998274688 = US sous blister ; Chrono 80 € 10080879969 = JP, 90 € 10036364239 sans boîte, 90 € 10114997536 jap/us, 75 € 10106952545 Modul seul ; Trials 21 € 5773325739 = GBA (JP) ; RE DS 40 € 9804178954 sans boîtier ; JFA 20 € 8991886439 = IT/ES/PT, 25 € 6887334972 sans boîte ; HD 20 € amarie.a 9729879361 = UK anglais, 20 € charles914 9590918029 = cartouche nue, 15 € 9839426470 sans boîte, 14 € 10046329288 sans boîte ; KH 358/2 3 € et 8 € = manga. Relances : thesmil relancé le 25/09, toujours muet → à abandonner ? ; cedhrik (Xenoblade 3, offre vendeur 27,50 €) muet depuis notre demande de photo du dos du 01/10.
- 2026-10-02 — CORRECTION : JFA 10196562376 signalé à tort, déjà commandé dans le lot mr.offspring (order_muorhc3k, 01/10, avec PWAA, Trials, Apollo Justice). Les trois retirés de WATCHLIST.md. Leçon : la veille doit passer `pnpm vault inspect inventory --match` avant de signaler, la watchlist peut être en retard sur la base. Relance cedhrik : envoi bloqué par le garde-fou de permissions, non envoyée.
- 2026-10-03 — VEILLE (tâche planifiée). Colis : aucun en point relais (Sonic Superstars chacharose18 toujours sans réponse aux excuses du 01/10 ; Kirby Return, Sonic Frontiers, Sparks of Hope en route, livraison 6-9 oct.). **Passent les 3 filtres** : Hotel Dusk 20 € chriss-reims 10009790940 (NTR-AWIP-FHG DE/FR/NL, notice, cartouche, 18 j, déjà liké) ; VLR complet UKV TSA-CTR-AKGP-UKV : mirwen 37 € 8001729599 (254 j, liké), naydyloum 38 € 7926658874 (IE, 20 j, liké) ; VLR 40-45 € complets non chiffrés au dos : vic131511 5582814447, wanted_games 9611220589, wrldofretro 5777741144 (vendeur absent depuis mars). **Rejets** : Chrono 68 € 10212637651 = JP ; KH 358/2 30 € 10214928133 senza custodia, 30 € 10155029334 sans boîte (ES), 30 € 3452431058 JP ; TWEWY 40 € 9628279421 boîte vide ; VLR 29 € 9755709791 = PS Vita, 30 € 6971364045 cartouche seule, 25 € 9881005211 PS Vita ; ZTD 100 € 4389054835 = bonus de précommande ; HD 15 € 9908585588 gustavstadi (USK, connu), 15 € 7146227352 aro3544 (nue, connu), 20 € 8831283806 sans boîte, 18 € 8132850495 sans boîte. Offres : alchimie-des-saisons HD 18 € relancée le 02/10 03:15, muette → à abandonner ? ; thesmil 16 € (1-2 Switch + Paper Mario OK) toujours en attente alors que Paper Mario OK a été commandé le 02/10 → clôture proposée. Rien envoyé.
- 2026-10-04 — Sur ordre de benglut : (1) alchimie-des-saisons HD 9778271144 (offre 18 € en attente) — 2e et dernière relance envoyée 00:46, « annonce en ligne depuis 39 jours », vérifiée dans le fil. (2) chriss-reims HD 10009790940 — offre 16 € (−20 % sur 20 €) posée via la page de lot à 1 article, conversation 25511413429, statut « En attente », + message court (collectionneur, paiement immédiat, plus petit colis ; pas d'argument d'ancienneté ni de médiane : 19 j en ligne et 20 € déjà sous le q1). ⚠ Si les deux acceptent, deux Hotel Dusk : annuler l'une. Note : chriss-reims vend aussi Kirby Super Star Ultra DS à 110 € (au-dessus du seuil 45 €).
