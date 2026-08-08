# Skill : recherche d'inventaire

Trouver un jeu / vérifier une possession. Lecture seule, aucun risque.

```bash
pnpm vault search "pokemon lune"     # tolère fautes, accents, FR/EN, alias
```

Sortie : matchs triés par score avec items d'inventaire (statut, quantité, vérification).

- Toujours chercher AVANT d'ajouter quoi que ce soit (anti-doublon).
- Référence fiable d'un jeu = son `id` (`game_<plateforme>_<slug>`), jamais le titre libre.
- Introuvable ≠ à créer : confirmer avec l'humain avant tout `add-game` (règle n°10).
