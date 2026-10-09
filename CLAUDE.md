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

## 2. Machine-local truth → `LOCAL.md` (gitignored)

No absolute paths in committed files. Sibling-repo location, credentials notes and
per-machine detail live in `LOCAL.md`.

**Cloud/mobile sessions (claude.ai/code):** there is no `LOCAL.md`. Before any
`pnpm vault` command, clone the private data repo next to this one:
`git clone https://github.com/benglut/game-vault-data ../game-vault-data`
(the session's GitHub auth has access). Then follow the standard workflow —
including the no-push-without-explicit-order rule.

## 3. Token & time efficiency

- Search for the symbol, read only the needed range; never read a big file top-down.
- Re-use what is already in context; run independent reads in parallel.
- Minimal diffs; never rewrite a section for a 3-line change.
- No `MAP.md` yet: no source file exceeds ~800 lines. Create it the day one does.
- Delegate only self-contained lookups or single low-risk edits to ONE cheap
  sub-agent (`.claude/agents/locator.md`, `.claude/agents/editor.md`); never fan out
  in parallel; never delegate schema changes, releases, git, or the final review.

### Shell hygiene — this is what causes permission prompts (2026-09-09)

Allow-rules match the WHOLE command string. Every prompt benglut sees comes from a
command that no rule can match:

- **One command per Bash call.** No `cd … && x && y` chains: `Bash(pnpm vault *)`
  never matches `cd /path && pnpm vault …`. Use absolute paths or rely on the cwd.
- **No `node -e '…'` / `python3 - <<EOF` to read the base.** Each is a unique string
  AND arbitrary code, so it can never be allow-listed. Use `pnpm vault inspect
  games|inventory|orders [--match regex] [--status s] [--platform p]`. If a query
  the CLI cannot express recurs, add it to `inspect` rather than inlining a script.
- Deliberately NOT allow-listed, and that is correct: `node -e`, `python3`, bare
  `pnpm exec *`, `rm`. They are arbitrary execution — a prompt there is the point.

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
- the public export contains forbidden keys (`privateNotes`, seller names).
When it fires: fix the doc/data, never bypass.

## 8. Hard rules

- Conversation with benglut: **French**. Code identifiers: English. Docs and UI
  copy: **French** (explicit project requirement from the initial spec — deviation
  from the generic template, ratified 2026-08-08).
- **pnpm only. npm/npx are forbidden** (user order, 2026-08-07 — an `npm install -g`
  once failed on permissions and npm is banned from this machine's workflow).
- **Standing authorisation since 2026-08-11**: benglut has granted blanket permission
  to modify any file of the project and of the data repo, to edit `data/*.json`
  directly, and to commit and push to GitHub without asking, provided the changelog
  is kept up to date. This supersedes the two rules below, which stood until then.
  (Previously: never commit, tag or push without an explicit order — the bootstrap of
  2026-08-08 being ordered in the founding spec §16.)
- **No AI attribution anywhere** — no co-author trailers, no tool names in commits.
- **Still prefer `pnpm vault` over hand-editing `data/*.json`**, even though hand
  edits are now allowed: the CLI is what guarantees the changelog, the backups and
  referential integrity. Edit the JSON directly only where the CLI cannot express the
  change, and re-run `pnpm vault validate` straight after.
- `ordered` ≠ `owned`; a cancelled order never yields possession (CLI enforces it —
  don't work around it).
- Never invent a game that is not there (`needs_review` when uncertain).
- No secrets in either repo; `gh auth` locally, GitHub Secrets in CI.
- Verify your own work (tests + drift checker) before reporting done; report
  failures faithfully.
- **Vinted**: sync orders through the internal JSON API from an authenticated
  Chrome tab (see `.agents/skills/vinted-sync/SKILL.md`) — never screenshots,
  they cost 7× more tokens and hide lot contents. Reading, searching and
  favouriting are fine. **Never click Buy, never accept a seller's offer.**
  **Making an offer** (changed 2026-09-10, benglut's order — « c'est la seule façon de
  faire »): the only working path on Vinted is create the bundle → type the offer →
  send the short message in the bundle's chat. The agent runs that path itself, but
  **only after benglut's explicit yes on that specific offer** (items + amount + seller):
  an accepted offer commits his money, so the decision stays his, one offer at a time.
  Exception (benglut, 2026-10-06): when a seller asks « quel serait votre prix ? »,
  the agent may answer by message with a figure lower than every other verified
  offer or listing for the same game, without asking first. Buying stays his.
  The offer modal needs the Chrome window visible (`document.visibilityState` must not
  be `hidden`) — see `vinted-hunt/LEARNED.md` §2026-08-12.

## 9. UI/UX defaults

Premium, dark, fluid (full redesign 2026-10-09, benglut's order: « interface moderne et
fluide, stats, dashboard, courbes et graphiques »). Declutter; consistent components
from `src/components/ui/primitives.tsx`; no emoji in UI (inline SVG icons in
`src/components/icons.tsx` — user order, 2026-08-08); real icons sized by one
dimension; visible active states; tighten dead space. Charts are in-house SVG
(`src/components/charts/`) and follow the dataviz method: categorical palette
validated against the card surface `#12141d` (fixed order, never cycled), brand amber
only for single-series charts, one y-axis, hover tooltip on every chart, legend from
2 series. Update the smallest unit — patch in place before swapping sections, full
rebuild is last resort.

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
src/components/shell/    AppShell (sidebar, ⌘K palette, mobile tabs), nav
src/components/vault/    VaultProvider (live base + writes), api client
src/components/views/    Dashboard, Statistiques, Collection, Wishlist, Commandes,
                         Catalogue, Estimateur, Historique, Jeu
src/components/game/     GameDrawer/GameDetail (view + edit), cards, new-game dialog
src/components/charts/   AreaChart, ColumnChart, BarList, StackedBar, Sparkline
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
scripts/cloudflare/      deploy.ts — pnpm deploy:cf
.agents/skills/          8 task-scoped skills (load only when needed)
```

Persistent config surface: `publish.config.json` (private repo) — controls exactly
which fields reach `data/public/`. Guarded by `tests/publish.test.ts`.
