# Brief de review permanent

Portée : les deux repos GameVault (public + privé). Lecture seule — une review ne
modifie jamais le code ; elle produit un rapport dans `docs/reviews/YYYY-MM-DD-<scope>.md`.

## Axes

1. **Sécurité / vie privée** — l'export public peut-il fuiter un prix, un vendeur,
   une référence, une note ? Les workflows CI ont-ils des permissions minimales ?
2. **Correction des données** — règles n°1-15 de docs/data-model.md réellement
   appliquées ? Chemins de contournement de la CLI ?
3. **Performance** — poids des pages (jaquettes), taille des exports, temps de build.
4. **UX premier essai** — un visiteur froid comprend-il chaque page sans explication ?
5. **Vélocité & coût token agent** — les skills suffisent-elles à une session froide ?
   Y a-t-il des lectures de fichiers évitables ?

## Format de sortie

Par constat : sévérité (bloquant/majeur/mineur) · fichier:ligne · description ·
correction proposée. Terminer par une table **Quick wins** (~1 h max chacun).

## Après la review

Annoter chaque constat : **corrigé / différé (raison) / rejeté (raison)** dans le
fichier de review lui-même. Un rapport non annoté force la review suivante à tout
re-litiger.
