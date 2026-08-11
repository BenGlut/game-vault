# Skill: autonomous Vinted round

Periodic Vinted sweep for benglut: keep the base current, answer sellers, spot
deals, like, negotiate.

Written in English on purpose — the agent reads it every round, French costs more
tokens. **Messages to sellers stay in French**, sober, first person.

Read `vinted-sync` first for endpoints and token costs. This skill says **what to do
and how far to go**, not how to call the API.

## Three files, three jobs

| File | Role | Read | Written |
|---|---|---|---|
| `SKILL.md` | the rules | every round | rarely, by promotion |
| `LEARNED.md` | lessons, draft | every round | end of round |
| `TIMELINE.md` | what was actually done | **start of round** | as you go |

## Several agents share this skill

More than one agent may run on this account at once (2026-08-10: two did).

- `TIMELINE.md` is the coordination channel — append-only, it survives concurrent
  writes. `LEARNED.md` and this file are rewritten whole: **append to them, never
  rewrite the file**. A block rewrite destroyed 7 lessons on 2026-08-10.
- After reading TIMELINE, append a RÉSERVE line stating what you are about to do.
  Leave alone anything another agent reserved less than 15 minutes ago.
- The one-message-per-seller-per-day cap counts **every** agent, so a send is only
  safe once TIMELINE shows no other agent wrote to that seller today.
- Ask the other agent in TIMELINE with `? →`, answer with `! →`.

## Prerequisite: the authenticated Chrome

Use `mcp__claude-in-chrome__*` only. The built-in browser has no Vinted cookie and
lands on the login page. Never type credentials to fix that — tell benglut the
session expired and stop.

Entry check: `/inbox` header exposes `a[href="/inbox"]` labelled "N nouveaux
messages". Missing → session dead → report, exit. That header counter and the API
`unread` flag disagree; trust the API, thread by thread.

## Hard limits

- **Never complete a payment.** Making an offer is allowed: on Vinted an accepted
  offer reserves the price, the purchase still needs payment confirmation. That last
  step commits real money and belongs to benglut. (Fixed 2026-08-10: the opposite was
  stated in error.)
- **Caps**: never above the game's median CIB quote; 40 € per item, 120 € per lot.
  Above that, prepare the offer and hand it to benglut.
- **One message per seller per day** max, or it reads as a bot.
- **Unlike once the need is gone.** Favourites are benglut's shortlist: a game bought
  or no longer wanted must have its hearts removed, or the list stops meaning anything
  and sellers keep sending offers on something already owned. Sweep the favourites of a
  title the day it is acquired, verify each heart went back to outline.
- **Like widely, not only what you would buy.** A like frequently makes the seller send
  an unsolicited discount — benglut's own experience. So like every listing that fits the
  target (right platform, right region, right completeness), even when the asking price
  is above quote: the offer that follows is what turns it into a deal. Never like a
  listing rejected on substance (wrong platform, import, empty box) — no discount will
  fix that.
- Never work around a Cloudflare block: wait, slow down, or abandon the round.

## Round

### 0. Read `TIMELINE.md` first

It is the memory. Without it every round re-evaluates the same listings, re-asks the
same questions, re-checks orders that have not moved. Skip anything already done and
unchanged; only revisit when the state moved (new reply, price drop, status change).

### 1. Orders → base

`vinted-sync` routine. Field-proven pitfalls:

- "Bordereau envoyé au vendeur" ≠ shipped. Only "Commande expédiée et en cours
  d'acheminement" means `fulfilled`.
- Always open `/api/v2/transactions/<id>`: the list only shows "Lot 5 articles".
- **Mixed lots corrupt prices.** A lot often holds cheap filler plus one game — by
  design, see the filler tactic below; spread the total across every item, not the
  game alone.
- All writes go through `pnpm vault`, never by hand in `data/*.json`.

### 2. Inbox

Read threads whose last message is the seller's.

**Replying**: `POST /api/v2/conversations/<id>/replies`, body `{reply:{body:txt}}`,
header `X-CSRF-Token` (extract with `/CSRF_TOKEN\\?":\\?"([0-9a-f-]{36})/` from any
page's HTML). Works in a background tab, no clicking, no dropped characters. Creating
a *new* thread this way returns 403 — for an unknown seller use the listing's
"Message" button, which needs the foreground tab.

**Interface and API quirks, all field-verified:**

- **Liking goes through the DOM, never the API.** On a catalog page,
  `document.querySelectorAll('button[aria-label*="favoris"]')` yields ~148 hearts and
  `b.click()` really toggles them (the aria-label flips to "Supprimer des favoris").
  Put **no delay** in the loop: a background tab throttles timers to ~1/minute and the
  CDP call dies at 45 s, whereas 60 delay-free clicks land at once. The API
  `/api/v2/user_favourites/toggle` (body `{type:'item',user_id,item_ids:[id]}`) only
  ever **removes** — on an add it answers `200 {"code":0,"message":"Ok"}` and does
  nothing, so a counter built on the status code lies. Read `is_favourite` back from
  `/api/v2/catalog/items`, which is live; the favourites *list* endpoint is cached and
  still shows an item minutes after it was removed.
- Making an offer needs the listing modal and therefore the **foreground tab**: in a
  background tab the button clicks silently and no field appears. Once open, set
  `#offer` through React's native value setter, then click "Proposer <montant>".
  `POST /api/v2/transactions/<tx>/offer_requests` exists but answers "Prix de l'offre
  trop bas" even at 97 % of the asking price — the message is misleading and the
  channel unusable.
- `/api/v2/items/<id>` returns 404 — useless anyway: `/api/v2/catalog/items` already
  carries title, total price, condition, photos, seller and URL.
- Seller's full wardrobe: `/api/v2/wardrobe/<user_id>/items`. `/api/v2/users/<id>/items`
  returns 404. Read the whole wardrobe in one call before evaluating listings one by one.
- `/api/v2/my_orders` returns empty fields depending on the originating page: go to
  `/my_orders` and read the screen when the API stays silent.
- `/api/v2/users/conversations` returns an id that is NOT the account's — do not use it
  to identify who sent a message.

### 3. Hunt

**Scope: DS, 3DS, N64, GameCube, Switch only. Do not hunt Game Boy, Game Boy Color or
Game Boy Advance on Vinted** (benglut's decision, 2026-08-11). Those three platforms are
saturated with AliExpress reproductions — correct labels, correct seals, correct product
codes — and the effort of authenticating each listing outweighs the gain. If a Game Boy
title is wanted as a *playable* copy rather than a collectible, buying the reproduction
openly on AliExpress is cheaper and honest about what it is. GB/GBC/GBA titles stay in
the wishlist as collection goals; they are simply not hunted here.

Targets: the prioritised wishlist (`/recommandations`), minus the three platforms above.

Compare each candidate to market via `pnpm vault deal` (dry-run by default, `--yes`
writes). Quotes are PAL PriceCharting readings converted to euros — an international
market, dearer than Vinted France. A listing at the median is not a deal: aim well below.

**How to search Vinted — measured, not guessed (2026-08-10).** On « Metroid Samus
Returns »: the plain text query returned 22 real matches out of 40; adding « 3ds » to the
query dropped it to 13; adding `catalog_ids=3026` and `price_to` destroyed it entirely
(Metal Gear, Street Fighter, Killer Instinct). Vinted exhausts the genuine matches then
**pads the page with anything from the same category**. So:

- **Query the plain title, nothing more.** No console, no filters, no price cap.
  Measured on Samus Returns: full title 24/40 real matches, « metroid samus » 13,
  « samus » 13, « metroid 3ds » 8 — and the union of all four is 24, i.e. the short
  variants add nothing. One query, not four.
- **Short franchise queries serve a different purpose**: `metroid`, `zelda`,
  `mario kart` alone are for *discovering titles* — « metroid federation » surfaces
  Federation Force, another game entirely — not for exhausting one title. Use them to
  spot games missing from the wishlist, which starting from the list can never do.
- Filter on the returned titles, client-side. That is the only reliable filter.
- Take `per_page=40` and read them all — real matches are spread to the last rank.
- **Never cut the list at the quote.** Listing everything, then judging, is the job:
  a search that returns only bargains cannot tell « no deal » from « none for sale ».
  That error made Samus Returns look absent when 22 copies were listed at 37–210 €.

**Vinted search is very noisy.** Require the game's FULL title in the listing title —
`f.?zero` returned F-Zero X and F-Zero GP Legend, two other games — and drop anything
matching: **cartmod / cardmod / cart mod / repro / reproduction / flash / bootleg**, including
obfuscated spellings with digits (« Cardm0d », « repr0 ») used to slip past filters (a reflashed cartridge, not
a Nintendo original — 2026-08-11: a « Minish Cap » boxed at 21,70 € against a 124 € quote
was one, the word appeared only in the description), notice, boitier, boîte/boite in first position, boîte de protection, goodies,
poster, housse, jaquette, coque, carte / carte VIP, keychain / porte-clés, pin's, demo,
vide, sans le jeu, repro, custom, and the merch that a title search always drags in —
OST / CD / vinyle / soundtrack / artbook / badge. Then drop foreign editions:
jap/japon/ntsc/import, deutsch/USK, ita/italiano/gioco/cartuccia, españa/juego,
nederlands. **Exclude the sequels and remakes by name too**, or the search silently
prices the wrong game: "NEO The World Ends With You", Aria of Sorrow next to Dawn of
Sorrow, Luigi's Mansion 2 next to 3.

**Filter the title, not the card label.** A catalog card's `title` attribute reads
`<titre>, État: <état>, <prix> €, <prix> € protection incluse` — so a naive "protection"
filter (meant for protective cases) rejects every priced listing, and the état/price tail
pollutes every other match. Cut at `/,\s*[ée]tat:/` first, then filter.

**Judge the seller's SET, not the label.** The decisive counterfeit tell is not print
quality — repro labels photograph as convincingly as originals — it is **the combination
of titles**. AliExpress sells ready-made Game Boy repro lots; a seller listing that exact
set is reselling one. Signature of the common lot: Super Mario Land 1 & 2, Super Mario
Land DX, Yoshi, Mario Golf, Wario Land 1/II/3, Super Mario Bros Deluxe, Donkey Kong
Country, Mario's Picross — all loose, all the same price, all « très bon état ».
Two instant kills inside it: **Mario's Picross 2 never left Japan** and **Super Mario
Land DX is a fan colour-hack** — neither can exist as a European or US cartridge.
Checking those two titles against `public/catalog/*.json` unmasks the whole lot.
(2026-08-11: benglut caught this after I had cleared the lot on label quality alone.)

**Pokémon on Game Boy / GBA is the most counterfeited category on Vinted.** Beyond the
cartmod wording, watch for **romhacks sold as retail games**: a title Nintendo never
published — « Pokémon NEW Émeraude », « Emerald+ », « Version V2 » — is a modified ROM on
a burned cartridge. Cross-check the exact title against `public/catalog/*.json` before
anything else; if it is not in the No-Intro catalogue, it does not exist.

**Empty containers are the most frequent trap** — three in one day. Three signals, in
this order:

1. **The title, but read the qualifier.** « Boîte seule », « boîtier », « juste la
   boîte », « sans le jeu », « Caja », « kein spiel », « leeg » = empty. But « avec
   boîte », « complet boîte », « en boîte » mean the opposite — a complete copy, which
   is what benglut wants. The word alone decides nothing; the qualifier does.
2. **The URL slug**, which often says what the title hides: `…-3ds-case`,
   `…-sans-le-jeu`, `…-boite-vide`.
3. **The description** — the last resort and the one that caught half of today's traps:
   « Boîte seule (sans la cartouche du jeu) », « cartouche non incluse ». Titles were
   perfectly clean on Kid Icarus, Majora's Mask and Chrono Trigger.

Roughly half the empty boxes announce themselves in the title. On a sought-after title,
an unusually low price means an empty box until the description says otherwise.

**The same title exists on several consoles** — Captain Toad ships on Wii U, 3DS and
Switch. Read the listing's "Plateforme" field, never the title.

**Compare in delivered price**: item + buyer protection + shipping. On a ~20 € game the
fees add 6–8 €, i.e. 30 %. One bundle from one seller pays shipping once — that is where
the saving is, not in the advertised discount.

Lots are the richest seam: per-game price collapses and sellers like clearing out.

#### Filler tactic — build the lot yourself

A seller's bundle discount is a **percentage on the whole basket**, and it steps by
item count (commonly 2, 3, 5). So when the target is one expensive game, adding a
few of that seller's cheapest items — clothes, a book, anything at 1–3 € — crosses
the threshold and discounts the game too. Shipping is shared as well, once instead
of once per item. benglut's own tactic, proven: 58,50 € of listed value paid 48,05 €,
the game's share falling from 50 € to 41,07 €.

Do the arithmetic before adding anything, and only proceed when:

> discount gained on the target game **>** cost of the filler items

The filler is dead weight, not a bonus. Below the next count threshold, adding items
only raises the bill. Check the seller's discount grid before assuming a step exists.

Consequences, both mandatory:

- **Never let the filler distort the base.** Record the game at its prorated share
  of the amount actually paid (share of listed value × total), never the whole
  total — that is exactly how Mario 3D All-Stars ended up booked at 48,05 € instead
  of 41,07 €.
- **Never buy filler that exceeds the discount** just to reach a threshold, and never
  add items benglut would then have to store or dispose of at meaningful cost.

#### Read the seller before naming a price

The seller's wardrobe says more than the listing. Fetch it with
`/api/v2/wardrobe/<user_id>/items` (note: `/users/<id>/items` returns 404).

**The good ground: non-specialists.** Few items, mostly clothes, kids' things,
books — one or two games among them. They are clearing out, they do not know what a
game is worth, and they want it gone quickly. Their prices are the lowest and they
accept offers. Field-proven on 2026-08-10: the cheapest French Captain Toad Switch
(22,75 €) came from a seller with **four items total**, while sellers holding 75–96
items asked 26–32 € for the same game.

**The hard ground: semi-pros.** Dozens of listings, mostly games, prices aligned to
the market. They know the quotes and rarely move.

Adapt the register, it changes what works:

- **With a non-specialist**, sell speed and simplicity: take several items at once,
  be warm and human, say what it is for. **Never quote market prices to them** — it
  invites them to go and look up the value, and the deal dies. Their clothes at
  1–3 € are the ideal filler for the bundle tactic: they were leaving anyway.
- **With a semi-pro**, argue with figures — recent sold prices, condition, the fact
  the listing has been sitting. Warmth buys nothing there.

#### Act, do not report

A listing that passes every check below **and** sits under the caps is not a finding to
report — it is an offer to place, in the same round, before the report is written.
Reporting it and waiting is how Castlevania Dawn of Sorrow was lost on 2026-08-10:
verified French, 17,53 € delivered against a 26,36 € quote (-33 %, the best gap of the
day), liked, mentioned in five consecutive reports, never offered on, sold within hours.

The rule: **check → offer → then report what was done.** Under the caps, no permission is
needed; the payment is benglut's and remains his. Above the caps, and only there, prepare
the offer and hand it over.

#### The authentication standard: see the board, or certify it another way

**Only two kinds of listing qualify** (benglut's rule, 2026-08-11):

1. **The photos show the cartridge's PCB** — opened shell, board visible. This is the
   one thing repro factories cannot fake convincingly: a genuine Nintendo board carries
   moulded Nintendo markings, a proper chip layout and a game-specific reference, while a
   reproduction is a bare modern board, often with a single glob-top blob or a flash chip
   and a visible battery holder. Labels, seals and product codes are all printable; the
   board is not.
2. **Authenticity is certifiable another way** — original box *and* manual matching the
   cartridge, a factory seal, or a specialist seller whose photos leave no doubt.

Anything else is refused, however good the label looks. If the listing is otherwise
attractive, **ask the seller for a photo of the board** — a legitimate seller opens the
shell or at least photographs the back; a reseller of reproductions will decline, stall,
or answer with generic reassurance.

#### Prefer complete copies — they are the authentic ones

Since counterfeit cartridges carry correct labels, seals and product codes, the box and
manual are the strongest authenticity signal left: forging a credible box and manual
costs far more than a burned cartridge, so **repro sellers list loose carts, always**.
That reframes the whole hunt — the honest market is the complete-copy market, priced at
or slightly above the CIB quote, not the stream of loose cartridges at -50 %.

Searching « <title> complet boite » surfaces that segment directly and filters out most
of the noise in one step.

#### Checks before any offer

No offer without looking at the photos, via `computer{action:"zoom"}` on the useful
area — front, spine, back, cart label.

**1. Prefer a French box.** benglut collects PAL-FR. Evidence, most to least reliable:

- **product code** on back or spine, `-FRA` suffix (`NTR-`, `CTR-`, `DOL-`, `AGB-`,
  `NUS-XXXX-FRA`). `UKV` English, `NOE` German, `HOL` Dutch, `EUR`/`EUU` multilingual.
  **The code tells you the region, never the authenticity.** Repro factories print the
  correct European codes: the AliExpress GBA Metroid lot carries `AGB-AMTP-EUR` and
  `AGB-BMXP-EUR`, the exact codes two Vinted listings used — and that I had accepted as
  proof (2026-08-11, caught by benglut). A code is necessary, never sufficient;
- back written in French, "Notice en français";
- PEGI with French descriptors; ESRB or USK alone disqualifies;
- spine: sometimes translated when the front is not.

An English front proves nothing — many PAL-FR games keep an English title. The back
decides.

**A suspiciously low price on a sought-after retro title is a Japanese import until
proven otherwise** — three out of three on 2026-08-10 (Mario Kart 64 at 11,20 €,
Paper Mario/Mario Story at 11,20 €, Super Mario 64 "Japon"). The title never says so;
the label does (`NUS-006 (JPN)`, "MADE IN JAPAN"). Check the code on the photo before
computing any gap, and beware old listings — a low item id means a stale price.

**2. What actually matters is the game's language.** French box is the preference,
playable French is the condition:

- **French box** — ideal, proceed.
- **Foreign box, French in the game** (`EUR`/`EUU` multilingual, or the cart carries
  French). If the deal is good, proceed normally: discuss, negotiate, place the offer.
  Record the true region — `PAL-EU` with `languages: ["fr"]`, never `PAL-FR` for
  convenience; the base already separates them (265 PAL-FR / 11 PAL-EU).
- **Neither** — skip, unless the title never shipped in French, checked against the
  local catalogue before claiming it.

Doubt is settled by the back cover language list, or by asking the seller.

**3. Loose** (no box): nothing to check on packaging — judge the cart label; the
product code is printed there too.

**4. Condition**, what photos show and costs later: crushed corners, yellowed spine
(common on GB/GBC), cracked DS/3DS cases, missing manual or inner tray, torn or
re-glued cart label, deep circular scratches on GameCube discs.

**5. Ask the seller when photos fall short.** One short question at a time, in
French, never an interrogation:

> Bonjour, la notice est-elle bien présente ? Et pourriez-vous me montrer le dos de
> la boîte, pour vérifier qu'il s'agit bien de la version française ?

No back photo and no answer → walk away rather than pay PAL-FR price for an import.

### 4. Write `TIMELINE.md` and report

Append as you go, one dated line per action, in a form the next round can act on:
listing id or seller, what was done, outcome, and for a rejection **the reason** —
a listing dismissed for a German box must never be re-evaluated from scratch.

Then report to benglut: base changes, messages sent, offers placed and their amount,
deals found with their gap to quote. State failures plainly.

## This skill improves itself — and gets cheaper doing it

It is read in full every round, so **every added line is paid for on every future
round**. Growth is a cost, not progress.

End of round, append to `LEARNED.md` only what would save time or prevent an error:
an unexpected Vinted/PriceCharting naming, a data trap, a message wording that closed
or killed a negotiation, a rate threshold that triggered a block, a repeating seller
behaviour. One dated line each, factual.

**A lesson seen three times gets promoted into this SKILL.md and deleted from
`LEARNED.md`.** Draft stays draft, skill stays rule.

### Token economy is part of the job

Experiment deliberately, one change at a time, and record the measured result in
`LEARNED.md` — a cheaper way to reach the same answer is worth as much as a good
deal. Known ground: the JSON API costs ~200 tokens against ~1 500 for a screenshot;
a single `fetch` returning a small projected object beats reading a whole page;
`TIMELINE.md` avoids re-reading what has not moved. An experiment that fails gets
written down too, so it is not retried.

Applied at promotion time:

- **Promoting means rewriting, not appending.** Fold the lesson into the sentence
  that already covers it. If the section grew, it was done wrong.
- **Delete what no longer earns its place**: a rule never triggered in twenty rounds,
  a pitfall Vinted has since fixed, a stale example.
- Caps: `LEARNED.md` 30 lines, `TIMELINE.md` 60 days — beyond that, promote, compact,
  or drop the weakest.

A wrong rule is corrected in place with a date, like the offer rule above.
