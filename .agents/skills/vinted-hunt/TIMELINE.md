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
