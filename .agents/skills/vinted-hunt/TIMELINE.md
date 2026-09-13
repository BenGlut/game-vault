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
