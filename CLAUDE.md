# GameVault — agent reference

> Contract between benglut and every AI session on this repo. Read at the start of
> every session. One source of truth per fact: this file points at code, it does not
> restate it. When a rule turns out wrong, fix it here in the same session.

## 1. What this project is

Personal video-game collection manager. Two repos:

- `benglut/game-vault` (public, this one) — code, read-only web UI, filtered public
  export in `data/public/`, deployed to GitHub Pages.
- `benglut/game-vault-data` (private) — source of truth: `data/*.json` + `publish.config.json`.
  Local checkout expected at the path written in `LOCAL.md` (default `../game-vault-data`).

**The web UI never writes. All mutations go through `pnpm vault <cmd>`** (Zod
validation, duplicate detection, dry-run diff, `--yes`, atomic write, backup,
changelog). Commands and rules: `README.md`, `docs/data-model.md`, skills in
`.agents/skills/`.

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
  The offer modal needs the Chrome window visible (`document.visibilityState` must not
  be `hidden`) — see `vinted-hunt/LEARNED.md` §2026-08-12.

## 9. UI/UX defaults

Read-only, premium, dark. No edit affordances of any kind on the public site.
Declutter; consistent components; no emoji in UI (inline SVG icons in
`src/components/icons.tsx` — user order, 2026-08-08); real icons sized by one
dimension; visible active states; tighten dead space. Update the smallest unit —
patch in place before swapping sections, full rebuild is last resort.

## 10. Architecture map

Stack: Next.js 15 static export + TS strict + Tailwind 4 + Zod + Fuse.js;
Vitest + Playwright; pnpm; GitHub Actions → Pages.

```
src/lib/schema.ts        every Zod schema + types (SINGLE source of the data model)
src/lib/normalize.ts     title normalization + deterministic ids
src/lib/data.ts          build-time readers of data/public/ + labels + coverUrl
src/app/…                pages (all read-only)
src/components/…         ui.tsx (badges/cards), icons.tsx (SVG), *Explorer/Search (client)
scripts/vault/           the CLI — index.ts (commands), lib/store.ts (atomic IO,
                         diff, backups, integrity), lib/publish.ts (filtered export)
scripts/seed/            initial bootstrap (idempotent, --force to regen)
scripts/covers/          libretro-thumbnails fetch + 3-tier title matching (collection)
scripts/catalog/         full No-Intro DS/3DS reference catalog + ALL covers (160px,
                         stored locally in public/catalog-covers/ — user order)
data/public/             committed filtered export — the ONLY data the site sees
.agents/skills/          8 task-scoped skills (load only when needed)
```

Persistent config surface: `publish.config.json` (private repo) — controls exactly
which fields reach `data/public/`. Guarded by `tests/publish.test.ts`.
