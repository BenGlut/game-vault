# pnpm uniquement

**Règle.** pnpm seulement ; npm et npx sont interdits, y compris pour un outil ponctuel
(`pnpm dlx` au lieu de `npx`).

**Pourquoi.** Ordre de benglut du 2026-08-07, après l'échec d'un `npm install -g` sur une
question de permissions : npm est banni du flux de cette machine.

**Comment.** pnpm est installé via corepack dans `~/.local/bin`. Un terminal qui répond
« command not found » n'a pas ce dossier dans son PATH : donner le chemin complet
`~/.local/bin/pnpm`, jamais npm en repli.
