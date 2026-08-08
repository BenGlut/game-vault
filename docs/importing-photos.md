# Import de photos (étagères, lots, boîtes)

Pipeline obligatoire — aucune reconnaissance incertaine ne devient `verified`.

1. **Stocker la preuve** : copier la photo dans `../game-vault-data/evidence-files/`,
   créer l'entrée evidence (id `evidence_…`, type `photo`, path, date).
2. **Proposer les titres détectés** : lister chaque jeu identifié avec un niveau de
   confiance. En dessous de « certain », le dire explicitement.
3. **Normaliser** : rapprocher chaque titre via `pnpm vault search` (alias FR/EN).
4. **Chercher les doublons** : si l'item existe déjà → proposer `quantity+1` ou
   `duplicate`, ne jamais créer un second jeu.
5. **Produire un rapport** : tableau détecté / matché / action proposée / confiance.
6. **Attendre validation** de benglut pour tout ce qui n'est pas certain.
7. **Écrire** via `pnpm vault add-inventory` / `set-status` (`--yes` après diff) ;
   items certains vus physiquement → `--verified`, sinon `needs_review`.
8. **Conserver la preuve** : lier `evidenceIds` aux items concernés.

Règle n°10 : un jeu illisible/flou n'est PAS ajouté « au cas où ».
