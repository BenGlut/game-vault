# PLANS.md — Feuille de route GameVault

## V1 (livrée — 2026-08-08)

- [x] Schémas Zod complets (9 fichiers de données + publish.config)
- [x] CLI `pnpm vault` : 16 commandes, dry-run/diff/--yes, backups, changelog, écriture atomique
- [x] Seed initial : 74 jeux 3DS + 56 jeux DS (130), tous `needs_review`, 8 quantités à confirmer
- [x] Export public filtré (`data/public/`) — aucun prix d'achat, vendeur, référence ni note privée
- [x] Interface lecture seule : Dashboard, Collection, Recherche, Catalogue, Estimateur, Recommandations, Commandes, Wishlist, Doublons, Plateformes, Valeur, Historique, Fiche jeu
- [x] Jaquettes de la collection (libretro-thumbnails)
- [x] Tests Vitest + Playwright, CI/CD GitHub Actions + Pages
- [x] Catalogue de référence No-Intro complet (DS, 3DS, GBA) avec toutes les jaquettes en local, filtres région/possession
- [x] Notation qualité S/A/B/C/D des 132 jeux + cotes loose/CIB (source estimation-agent)
- [x] Estimateur de bonnes affaires (verdicts Très bon plan → Mauvais deal)
- [x] 23 recommandations d'achat priorisées (page dédiée)
- [x] Commandes Vinted en cours importées (kaizen1912, gabrieltrichard69)

## V1.x (prochaines étapes)

- [ ] **Affiner les cotes** : remplacer les `estimation-agent` par des ventes réelles
      (eBay sold / PriceCharting) — commencer par les Pokémon DS
- [ ] Vérification physique de la collection (passer les fiches en `verified`, confirmer les 8 quantités)
- [ ] Réceptionner les 2 commandes Vinted à l'arrivée (`receive-order`)
- [ ] Jaquettes manquantes : Bien-être du visage, Mission Safari + quelques recommandations
- [ ] EAN en masse (nécessite une clé API gratuite : IGDB via Twitch ou UPCitemdb)
- [ ] Enrichir métadonnées (année, éditeur, genres) avec vérification par lot
- [ ] Import photo (pipeline docs/importing-photos.md)

## V2 (plus tard, seulement si nécessaire)

- [ ] Base SQLite (uniquement si >10k items ou requêtes complexes — JSON+Git suffisent largement en V1)
- [ ] Historique de cotes graphique
- [ ] Suivi automatique d'annonces (listings)
- [ ] Autres plateformes de catalogue (GB, GBC, Switch…)
