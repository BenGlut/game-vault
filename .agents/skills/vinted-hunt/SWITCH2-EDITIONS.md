# Éditions « Nintendo Switch 2 Edition » — jouables sur Switch 1 et Switch 2

> benglut a quatre Switch 1 (Switch, OLED, deux Lite) et une Switch 2. Ces
> cartouches-là tournent sur les cinq machines : elles portent le logiciel
> Switch 1 **et** la mise à niveau Switch 2.

## Ce qui tranche, et qui est sur la jaquette

Sous le logo PEGI, en français :

> « Cette version Nintendo Switch 2 Edition **combine le logiciel Nintendo Switch
> et la mise à niveau Nintendo Switch 2 Edition**. La mise à niveau est également
> disponible séparément. »

**Cette phrase est la preuve, rien d'autre.** Ni le titre de l'annonce, ni la
couleur rouge du boîtier, ni le mot « switch 2 » écrit par le vendeur. Beaucoup
d'annonces intitulées « switch 2 » sont des jeux Switch 2 natifs, qui ne
démarrent pas sur Switch 1. Exiger la photo de la face avant avant de conclure.

## La liste (nintendo.com/fr-fr, relevée le 2026-09-21)

- Animal Crossing: New Horizons — Nintendo Switch 2 Edition
- Metroid Prime 4: Beyond — Nintendo Switch 2 Edition
- Légendes Pokémon : Z-A — Nintendo Switch 2 Edition
- Pikmin 4 — Nintendo Switch 2 Edition + Académie Dandori
- Kirby et le monde oublié — Nintendo Switch 2 Edition + Le pays des étoiles filantes
- Super Mario Bros. Wonder — Nintendo Switch 2 Edition + Rendez-vous au parc Bellabel
- Xenoblade Chronicles 2 — Nintendo Switch 2 Edition
- Xenoblade Chronicles 3 — Nintendo Switch 2 Edition
- Xenoblade Chronicles: Definitive Edition — Nintendo Switch 2 Edition
- Xenoblade Chronicles X: Definitive Edition — Nintendo Switch 2 Edition
- Fitness Boxing 3: Your Personal Trainer — Nintendo Switch 2 Edition

Source : recherche « 2 Edition » filtrée sur Nintendo Switch 2,
[nintendo.com/fr-fr](https://www.nintendo.com/fr-fr/Rechercher/Rechercher-299117.html?q=2%2BEdition&f=147394-86-126556).
La gamme s'étoffe : rafraîchir cette liste quand une chasse bute dessus.

## Comment c'est noté en base

Le champ `playsOn` d'un jeu (`src/lib/schema.ts`) liste les consoles sur
lesquelles la cartouche démarre quand ce n'est pas déductible de `platformId`.
Pour ces éditions : `--plays-on "switch,switch2"` à la création.

```
pnpm vault add-game --title "Metroid Prime 4: Beyond" --platform switch2 \
  --edition "Nintendo Switch 2 Edition" --plays-on "switch,switch2" --yes
```

Un jeu Switch 2 natif garde `playsOn` vide : sa plateforme dit déjà tout.

## Intérêt pour la chasse

Trois titres de cette liste sont dans la collection ou la wishlist de benglut :
**Animal Crossing: New Horizons** (wishlist), **Metroid Prime 4: Beyond**
(wishlist) et **Xenoblade Chronicles 3** (wishlist, offre en cours sur l'édition
Switch 1). Sur ces trois-là, comparer systématiquement les deux éditions : si
l'écart de prix est faible, la Switch 2 Edition vaut mieux — même compatibilité,
plus la mise à niveau.
