# Changelog

## v0.1.0 — 2026-08-08

Première version fonctionnelle complète.

### Added
- Modèle de données Zod complet (`src/lib/schema.ts`) : Game, InventoryItem, Order,
  Platform, Seller, Listing, PriceObservation, Evidence, ChangeLogEntry,
  PublishConfig ; 9 statuts d'inventaire ; régions PAL-FR/PAL-EU/NTSC-U/NTSC-J ;
  complétude `code_in_box` distincte (règle n°8).
- Normalisation des titres + ids déterministes `game_<platform>_<slug>` / `inv_…`
  (`src/lib/normalize.ts`).
- CLI `pnpm vault` (`scripts/vault/`) : search, add-game, add-inventory, set-status,
  add-order, ship-order, receive-order, cancel-order, refund-order, add-price,
  validate, publish. Dry-run par défaut, diff par id, `--yes`, écriture atomique
  (tmp+rename), backup horodaté, entrée change-log, sortie JSON agent-friendly.
  Garde-fous : doublons refusés, règle n°5 (item de commande annulée ≠ owned),
  wishlist→ordered automatique dans add-order.
- Export public filtré (`scripts/vault/lib/publish.ts`) piloté par
  `publish.config.json` : purchase_price/seller/reference/notes exclus par défaut ;
  stats agrégées ; index de recherche compact ; `VAULT_PUBLIC_DIR` pour les tests.
- Seed idempotent (`scripts/seed/generate-seed.ts`) : 74 jeux 3DS + 56 DS (130),
  31 plateformes toutes marques, tous items `needs_review`, 8 flags
  `quantityNeedsReview` (section 15 du cahier des charges).
- Interface Next.js 15 export statique, lecture seule stricte (zéro bouton, zéro
  form) : Dashboard, Collection (filtres plateforme/statut/franchise/région/vérif),
  Recherche Fuse.js (fautes/accents/FR-EN/abréviations/suffixe plateforme),
  Commandes, Wishlist, Doublons, Plateformes, Valeur, Historique, fiche jeu
  (possession/quantité/prix/cote/état/complétude/commandes liées).
- Jaquettes libretro-thumbnails (`scripts/covers/fetch-covers.ts`) : matching
  3 niveaux (exact / mots réordonnés / sous-ensemble), préférence France>Europe,
  conversion JPEG 400px via sips — 128/130 couvertes.
- Icônes SVG inline (`src/components/icons.tsx`) — zéro emoji dans l'UI.
- Tests : 29 Vitest (normalisation, schémas, CLI bout-en-bout sur copie jetable,
  anti-fuite du publish) + 5 Playwright (dashboard, filtres, recherche EN, fiche,
  absence totale de boutons/forms).
- CI GitHub Actions (lint/typecheck/test/build/e2e) + deploy GitHub Pages
  (`GITHUB_PAGES=true` → basePath `/game-vault`), Dependabot, CodeQL.
- Docs : architecture, data-model, agent-workflows, security, importing-photos,
  deployment ; AGENTS.md ; 8 skills `.agents/skills/` ; CLAUDE.md (contrat agent) ;
  drift checker (`scripts/check-drift.mjs`) + hook pre-commit.
