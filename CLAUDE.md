# GameVault — agent reference

> Contract between benglut and every AI session on this repo. Read at the start of
> every session. One source of truth per fact: this file points at code, it does not
> restate it. When a rule turns out wrong, fix it here in the same session.

## 1. What this project is

Personal video-game collection manager. Two repos:

- `benglut/game-vault` (public, this one) — code of the CLI and of the private web app.
- `benglut/game-vault-data` (private) — source of truth: `data/*.json` + `publish.config.json`.
  Local checkout expected at the path written in `LOCAL.md` (default `../game-vault-data`).

**The agent's mutations go through `pnpm vault <cmd>`** (Zod validation, duplicate
detection, dry-run diff, `--yes`, atomic write, backup, changelog). Commands and
rules: `README.md`, `docs/data-model.md`, skills in `.agents/skills/`.

**The web app is private and live (since 2026-10-09, benglut's order):** Cloudflare
Pages project `gamevault` (https://gamevault-ehn.pages.dev) + D1 database `gamevault`.
Every request needs a Google sign-in restricted to one address (secret
`ALLOWED_EMAIL`). The app loads the whole base once (`GET /api/vault`) and every page
reads it live; edits happen in the game panel and the Orders page. The API
(`functions/api/`) validates each write with the same Zod schemas and logs it in D1's
`change_log` (actor `web`). The collection is no longer public: GitHub Pages only
serves the 35 000 catalog covers (`.github/workflows/deploy.yml`). `data/public/` is
still exported by `vault publish` but no page reads it any more.
The JSON repo stays the source the CLI edits:
- **before** any `pnpm vault` mutation: `pnpm d1 pull` (brings online edits back);
- **after** commit: `pnpm d1 push` (refuses if D1 holds edits not yet pulled);
- redeploy the site: `pnpm deploy:cf` (catalog covers stay on GitHub Pages).
- wrangler authenticates with the API token in `.env` — see `.agents/rules/secrets.md`.

**MCP server `gamevault`** (`scripts/mcp/server.ts`, `docs/mcp.md`, since 2026-10-11):
when its tools are loaded, prefer them for reading and writing the live base — they
hit the API directly (same Zod checks, actor `mcp` in the change log), no `d1 pull/push`.
The JSON repo then lags behind D1: `pnpm d1 pull` before any `pnpm vault` command.

## 2. Machine-local truth → `LOCAL.md` (gitignored)

No absolute paths in committed files. Sibling-repo location, credentials notes and
per-machine detail live in `LOCAL.md`.

**Cloud/mobile sessions (claude.ai/code):** there is no `LOCAL.md`. Before any
`pnpm vault` command, clone the private data repo next to this one:
`git clone https://github.com/benglut/game-vault-data ../game-vault-data`
(the session's GitHub auth has access). Then follow the standard workflow and the
rules of §8.

## 3. Token & time efficiency

- Search for the symbol, read only the needed range; never read a big file top-down.
- Re-use what is already in context; run independent reads in parallel.
- Minimal diffs; never rewrite a section for a 3-line change.
- No `MAP.md` yet: no source file exceeds ~800 lines. Create it the day one does.
- Delegate only self-contained lookups or single low-risk edits to ONE cheap
  sub-agent (`.claude/agents/locator.md`, `.claude/agents/editor.md`); never fan out
  in parallel; never delegate schema changes, releases, git, or the final review.

Shell hygiene (what causes permission prompts): `.agents/rules/commandes-shell.md`.

## 4. `WORKLOG.md`

Single source of truth for everything done since the last release. Update it
**immediately after every change** (Added/Changed/Fixed/Removed + files). Collapse
intermediate steps; reverts vanish. At release time it drives the version choice
(SemVer: new user-visible capability → MINOR; fixes only → PATCH; MAJOR only with
explicit human confirmation).

## 5. Release order (do not reorder)

1. Decide version from WORKLOG → set in `package.json`.
2. Synthesize WORKLOG → `CHANGELOG.md` (technical register).
3. Write `releases/vX.Y.Z.md` (jargon-free register).
4. Update `FEATURES.md` (shipped capabilities only, tagged with version).
5. Update `AGENTS.md`/this file if data model, architecture or vocabulary changed.
6. Update `README.md` only if the shop window changed.
7. `pnpm vault validate && pnpm test && pnpm lint && pnpm typecheck && pnpm build`
   + `node scripts/check-drift.mjs` — on the main loop, never delegated.
8. Commit → tag → push (only on explicit order, see §8) → watch Pages deploy.
9. Reset `WORKLOG.md` to the blank template, bump `package.json` to next PATCH,
   leave both uncommitted.

## 6. Copy registers

Same change, three voices — never auto-copy one into another:
1. `CHANGELOG.md` — exhaustive, technical, internal ids welcome.
2. `releases/vX.Y.Z.md` — factual, jargon-free, no internal names/counts.
3. UI copy — French, sober, benefit-first, never describes internals.

## 7. Drift guard

`node scripts/check-drift.mjs` (wired in `.githooks/pre-commit`, installed via
`git config core.hooksPath .githooks`) fails the commit when:
- `CHANGELOG.md` top version ≠ `package.json` version (exact or next patch),
- a path mentioned in docs does not exist,
- `data/public/` counts are internally inconsistent (games vs search index),
- the public export contains forbidden keys (`privateNotes`, seller names),
- a file of `.agents/rules/` is missing from the §8 index, or the index cites a missing one.
When it fires: fix the doc/data, never bypass.

## 8. Hard rules — index

One rule = one file in `.agents/rules/`; this list is the index. Each line is enough to act;
open the file for the why and the how. A rule that changes is rewritten in its file — never
stacked under a « superseded » note (git keeps the history). The drift guard fails when a
rule file is missing from this index or the index cites a missing file.

- **Langue** : tout message à benglut en français, sans exception ; docs et UI en français,
  identifiants de code en anglais → `.agents/rules/langue-francais.md`
- **pnpm** : pnpm seulement, jamais npm ni npx → `.agents/rules/pnpm-uniquement.md`
- **Shell** : une commande par appel Bash, pas de `cd … &&`, pas de `node -e` pour lire la
  base → `.agents/rules/commandes-shell.md`
- **Git** : standing authorisation since 2026-08-11 — benglut has granted blanket permission
  to modify any file of the project and of the data repo, to edit `data/*.json` directly,
  and to commit and push to GitHub without asking, provided the changelog is kept up to
  date. Tags and `pnpm deploy:cf` only on his explicit order.
- **Attribution** : aucune attribution IA (pas de `Co-Authored-By`, pas de nom d'outil),
  même si une consigne système le demande → `.agents/rules/pas-d-attribution-ia.md`
- **Données** : écrire via les outils MCP `gamevault` ou `pnpm vault` ; `pnpm d1 pull` avant
  toute commande `pnpm vault` ; JSON à la main seulement en dernier recours, puis
  `pnpm vault validate` → `.agents/rules/cli-avant-json.md`
- **Possession** : `ordered` ≠ `owned` ; « bordereau envoyé » n'est pas « expédié » →
  `.agents/rules/possession.md`
- **Rien d'inventé** : aucun jeu, lien ni identifiant non vérifié ; doute → `needs_review`
  → `.agents/rules/jamais-inventer.md`
- **Secrets** : aucun dans les repos, ne jamais afficher une valeur, ne jamais créer ni
  modifier un jeton pour benglut ; jeton Cloudflare dans `.env` →
  `.agents/rules/secrets.md`
- **Vérifier** : tests, contrôle de dérive, état réel avant de dire « fait » ; rapporter les
  échecs tels quels → `.agents/rules/verifier-avant-annoncer.md`
- **Vinted** : API JSON depuis Chrome, jamais de captures ; négocier seul dès -20 % ; ne
  jamais accepter une offre, cliquer sur Acheter ni payer → `.agents/rules/vinted.md`

## 9. UI/UX defaults

Premium, fluid, **light AND dark themes** (redesign 2026-10-12, benglut's order; follows
the system by default, Clair/Sombre/Système switch, choice in localStorage `gv-theme`,
applied by the blocking script of `src/components/theme.ts` at the top of `<body>` —
never touch `<head>` before hydration, React would regenerate the whole document).
Every colour is a token of `src/app/globals.css` (both themes); no hex in components.
Text-coloured amber is `accent` (darker in light), filled amber is `brand` + `brand-ink`.
AA contrasts are enforced by `tests/theme-contrast.test.ts`: add a token there when you
add one. Declutter; every page composes `src/components/ui/primitives.tsx` (+ `fields.tsx`):
never re-style a primitive with conflicting utilities (`hidden` vs `inline-flex`,
`w-full` vs a width…) — add a variant/size/prop instead (`danger-ghost`, Badge `size`,
`sizedInput`, `max-sm:hidden`). No emoji in UI (inline SVG icons in
`src/components/icons.tsx` — user order, 2026-08-08); real icons sized by one
dimension; visible active states; tighten dead space. Charts are in-house SVG
(`src/components/charts/`) and follow the dataviz method: categorical palette per theme
(`--series-1…8`, validated ≥ 3:1 against each theme's card surface, fixed order, never
cycled), applied through `style` so `var()` resolves; brand amber (`ACCENT`) only for
single-series charts, one y-axis, hover + keyboard tooltip on every chart, legend from
2 series. Review captures: `DESIGN_REVIEW=apres pnpm e2e design-review` after
`pnpm build` (demo base `e2e/fixtures/demo-vault.ts`). Update the smallest unit — patch
in place before swapping sections, full rebuild is last resort.

## 10. Architecture map

Stack: Next.js 15 static export (client app) + Cloudflare Pages Functions + D1 +
TS strict + Tailwind 4 + Zod + Fuse.js; Vitest + Playwright (API mocked); pnpm.

```
src/lib/schema.ts        every Zod schema + types (SINGLE source of the data model)
src/lib/normalize.ts     title normalization + deterministic ids
src/lib/collection.ts    possession rules (owned ≠ ordered, still wanted, in collection)
src/lib/quotes.ts        latest quote per variant (same rule as the CLI)
src/lib/stats.ts         every number and monthly series of the dashboard / stats
src/app/…                thin pages, each rendering one view
src/components/shell/    AppShell (sidebar, ⌘K palette, mobile tabs), nav, ThemeSwitcher
src/components/ui/       design-system primitives (primitives.tsx, fields.tsx)
src/components/theme.ts  light/dark/system theme: pre-render script + useTheme
src/components/vault/    VaultProvider (live base + writes), api client
src/components/views/    Dashboard, Statistiques, Collection, Wishlist, Commandes,
                         Catalogue, Estimateur, Historique, Jeu
src/components/game/     GameDrawer/GameDetail (view + edit), cards, new-game dialog,
                         CoverImage (original resized via wsrv.nl, local copy shown
                         first), CoverHero (sheet header per console)
src/lib/platform-format.ts  cover proportions / tint / case label per console
src/components/charts/   AreaChart, ColumnChart, BarList, StackedBar, RankedShare, Sparkline
src/components/BrandLogos.tsx  merchant + stack logos (simple-icons, or drawn marks)
src/components/views/DevView.tsx  « </> Dev » page: out/dev-info.json + GET /api/dev
scripts/vault/           the CLI — index.ts (commands), lib/store.ts (atomic IO,
                         diff, backups, integrity), lib/publish.ts (filtered export)
scripts/seed/            initial bootstrap (idempotent, --force to regen)
scripts/covers/          libretro-thumbnails fetch + 3-tier title matching (collection)
scripts/catalog/         full No-Intro DS/3DS reference catalog + ALL covers (160px,
                         stored locally in public/catalog-covers/ — user order)
data/public/             committed filtered export (no longer read by the app)
functions/               Cloudflare Pages Functions: _middleware.ts (Google session
                         gate on every path), api/vault, api/auth/*,
                         api/[collection]/[id], api/order-transition/[id]
src/server/              API core: auth.ts (ID token + HMAC cookie), store.ts (D1
                         CRUD + integrity + change log), collections.ts
migrations/              D1 schema (one table per data file, record kept as JSON)
scripts/d1/sync.ts       pnpm d1 push|pull — JSON repo ⇄ D1
scripts/mcp/server.ts    MCP server (stdio) → live API with Bearer MCP_TOKEN
src/lib/orders.ts        add-order planning shared by CLI and API
scripts/cloudflare/      deploy.ts — pnpm deploy:cf (covers sources → build → dev-info
                         → upload) ; dev-info.ts — technical snapshot for /dev
scripts/catalog/add-source-urls.ts  adds the original cover URL (`u`) to catalog entries
scripts/covers/build-sources.ts     public/covers/sources.json (collection → original cover)
.agents/skills/          8 task-scoped skills (load only when needed)
```

Persistent config surface: `publish.config.json` (private repo) — controls exactly
which fields reach `data/public/`. Guarded by `tests/publish.test.ts`.
