# Worklog — v0.1.1 (in progress)

## Added
- Catalogue de référence complet DS + 3DS (listes No-Intro via libretro-thumbnails)
  pour la recherche : script `scripts/catalog/fetch-catalog.ts` (dédup par titre
  normalisé, inversion d'article, agrégation des régions, téléchargement de TOUTES
  les jaquettes en miniatures 160px JPEG, reprise auto) → `public/catalog/*.json`
  + `public/catalog-covers/*.jpg`
- Page `/catalogue` (`src/app/catalogue/page.tsx`, `src/components/CatalogClient.tsx`) :
  recherche dans tous les jeux sortis, filtre possédé/manquant, badge « Possédé »
  par correspondance titre normalisé + alias ; lien nav ajouté — `src/app/layout.tsx`
- Support EAN : `pnpm vault add-game --ean …` (stocké dans `externalIds.ean`) et
  affichage sur la fiche jeu — `scripts/vault/index.ts`, `src/app/jeu/[id]/page.tsx`
- Estimateur de bonnes affaires : cotes par variante avec boîte (cib) / cartouche
  seule (loose) sur les observations de prix (`src/lib/schema.ts`), moteur de
  verdict 5 niveaux Très bon plan→Mauvais deal (`src/lib/deal.ts`), commandes
  `pnpm vault add-price --variant cib|loose` et `pnpm vault deal --game … --price …
  --state cib|loose` (`scripts/vault/index.ts`, `scripts/vault/lib/quotes.ts`),
  export public `quotes.json` (`scripts/vault/lib/publish.ts`), page `/estimateur`
  mobile-first (`src/app/estimateur/page.tsx`, `src/components/DealEstimator.tsx`),
  cotes CIB/loose sur la fiche jeu — 9 tests ajoutés (`tests/deal.test.ts`,
  `tests/cli.test.ts`)

- Notation des jeux : `qualityTier` S/A/B/C/D et `buyPriority` haute/moyenne/basse
  sur Game (`src/lib/schema.ts`), commandes `pnpm vault rate`, `rate-batch --file`,
  `price-batch --file` et options `--quality/--priority/--wishlist` sur add-game
  (`scripts/vault/index.ts`) ; les 132 jeux de la collection notés (source
  consensus critique) et cotés loose+CIB (source estimation-agent, 264 observations)
- Page `/recommandations` : wishlist priorisée haute/moyenne/basse triée par
  qualité avec cotes — 23 recommandations d'achat DS/3DS ajoutées en wishlist
  (`src/app/recommandations/page.tsx`) ; badges QualityBadge/PriorityBadge
  (`src/components/ui.tsx`), filtre qualité sur la Collection, champs sur la fiche
- Jaquettes dans les résultats de la page Recherche
  (`src/app/recherche/page.tsx`, `src/components/SearchClient.tsx`)
- Filtre par région sur la page Catalogue (`src/components/CatalogClient.tsx`)
- Catalogue étendu à la Game Boy Advance (`scripts/catalog/fetch-catalog.ts`)

## Changed
- Jaquettes du catalogue rangées par plateforme : `public/catalog-covers/ds/…` et
  `public/catalog-covers/3ds/…` — `scripts/catalog/fetch-catalog.ts`,
  `src/components/CatalogClient.tsx`

## Fixed

## Removed
