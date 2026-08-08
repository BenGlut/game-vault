# Skill : import photo

Pipeline complet : [docs/importing-photos.md](../../../docs/importing-photos.md). Résumé strict :

1. Photo → `../game-vault-data/evidence-files/` + entrée evidence.
2. Titres détectés avec niveau de confiance explicite.
3. `pnpm vault search` pour chaque titre (jamais de création directe).
4. Doublon existant → proposer quantité+1 ou `duplicate`, pas un nouveau jeu.
5. Rapport tableau → validation humaine pour tout ce qui n'est pas certain.
6. Écriture via CLI ; incertain = `needs_review`, JAMAIS `verified` automatique.
7. Lier `evidenceIds` aux items.

Un jeu flou/illisible n'est pas ajouté.
