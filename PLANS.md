# PLANS.md — Feuille de route GameVault

## V1 (livrée — 2026-08-08)

- [x] Schémas Zod complets (9 fichiers de données + publish.config)
- [x] CLI `pnpm vault` : 12 commandes, dry-run/diff/--yes, backups, changelog, écriture atomique
- [x] Seed initial : 74 jeux 3DS + 56 jeux DS (130), tous `needs_review`, 8 quantités à confirmer
- [x] Export public filtré (`data/public/`) — aucun prix d'achat, vendeur, référence ni note privée
- [x] Interface lecture seule : Dashboard, Collection, Recherche, Commandes, Wishlist, Doublons, Plateformes, Valeur, Historique, Fiche jeu
- [x] Jaquettes libretro-thumbnails : 128/130
- [x] Tests : 29 Vitest + 5 Playwright
- [x] CI/CD GitHub Actions + GitHub Pages

## V1.x (prochaines étapes)

- [ ] Vérification physique de la collection (passer les fiches en `verified`, confirmer les 8 quantités)
- [ ] Jaquettes manquantes : Bien-être du visage, Mission Safari (scan manuel → evidence)
- [ ] Enrichir métadonnées (année, éditeur, genres) avec vérification par lot
- [ ] Import photo (pipeline docs/importing-photos.md)
- [ ] Cotes initiales des jeux les plus valorisés (Pokémon, Zelda)
- [ ] Wishlist initiale

## V2 (plus tard, seulement si nécessaire)

- [ ] Base distante (uniquement si le JSON devient limitant)
- [ ] Historique de cotes graphique
- [ ] Suivi automatique d'annonces (listings)
