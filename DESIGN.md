# JQT Design System

The input, not the output. Everything JQT ships visually should be generated
from this file: the website, social assets, decks, product surfaces.

Written to the DESIGN.md convention so it can be dropped into Claude Design, a
coding agent, or a brief, and produce the same brand every time.

Sources: the real JQT mark, the references Chris chose between June and
September 2026, and the rules he has stated more than once.

---

## 1. What JQT is

Forward deployed engineering, productized. JQT embeds in one operation, builds
the software that operation runs on, answers for the result, then extracts the
reusable core into a product for that whole industry.

One vertical operating system per industry. Not an agency, not a consultancy,
not a dev shop.

**Positioning line, current:**
> We build the software your operation runs on, then stay and run it.

**The proof:** Kept. Hotel housekeeping and operations software, built inside a
working hotel, live, with a public demo anyone can walk.

---

## 2. The mark

A wireframe globe resting on a chevron, with interlocked J, Q and T letterforms
cut into the chevron's face.

Read it as it was built: the globe is borderless (software has no geography, and
"borderless" is gate four of the JQT filter), the chevron is forward deployment,
the letterforms are engineered rather than drawn. Monochrome with a tonal
gradient from grey to black. No color in the mark, ever.

Masters live in `jqt_content_drop/jqt-logo/`: `jqt-mark-light-master.png`,
`jqt-mark-dark-master.png`, icon set 16 through 512, `mark-og-1200x630.png`.

Do not recolor it, add a gradient to it, place it on a busy photograph, or set
it at an angle.

---

## 3. Color

Sampled from the mark itself, not chosen.

| Token | Value | Use |
|---|---|---|
| `--ground` | `#F4F3EF` | Page ground. Warm off-white, the mark's own field |
| `--ink` | `#000000` | Headlines, the mark, anything that must be read first |
| `--ink-2` | `#4A4A46` | Body copy |
| `--ink-3` | `#8A8A84` | Labels, captions, metadata |
| `--line` | `#DEDCD6` | Hairlines and dividers |
| `--raise` | `#EAE8E2` | A surface lifted off the ground |
| `--navy` | `#3D5A7A` | The single accent. Links, the one emphasized word, a live dot |

**One accent, held with discipline.** Navy is the only chromatic color on a
marketing page. If something needs emphasis and navy is already spent nearby,
use weight or scale instead of reaching for a second hue.

**Semantic color is not the accent** and never leaks into marketing:

| Token | Value | Meaning |
|---|---|---|
| `--ok` | `#2F8F5B` | Clean, done, on time |
| `--warn` | `#9A731E` | Working, due, low |
| `--crit` | `#B5453A` | Flagged, out of order, overdue |

Dark surfaces use `#12161C` ground with `#EEF1F5` ink and the same navy, lifted
to `#5E86B3` so it holds contrast.

---

## 4. Typography

The goby DNA Chris extracted is explicit: **bold oversized mixed-weight
typography**. Type carries the page; there is no illustration system to lean on.

- **Display:** a heavy geometric or condensed grotesque, set very large, tight
  tracking (`-.02em`), `text-wrap: balance`. Headlines run two to four words a
  line and are allowed to dominate a screen.
- **Body:** a neutral, highly legible grotesque at 16 to 17px, `line-height
  1.6`, measure capped near 60 to 65 characters.
- **Accent:** one italic serif phrase per section at most, in navy, against the
  big sans. This is the Dutchie move and it is already the strongest thing on
  the current site. Use it on the half of the headline that carries the claim.
- **Data:** a monospace for room numbers, prices, times and counts, with
  `font-variant-numeric: tabular-nums`. Numbers in an operations product should
  look measured, not typeset.

**Licensing, decided August 2026:** Fontshare is the only source that is free,
commercially licensed and self-hostable. Self-host it. Loading Google Fonts from
Google is the one live privacy exposure on the site and self-hosting closes it.
Google Fonts is acceptable only inside a throwaway artifact preview, never in
production.

---

## 5. Layout

**Mobile first, and this is not a formality.** The site is read on phones. As of
September 2026 the homepage was 16,794px tall at 393px wide, about twenty
screens, and the Kept page ran text edge to edge with zero side gutters. Both
were shipped. Neither was caught by an overflow check.

**Hard rules:**

- Side gutter is set ONCE, on one wrapper, as `padding-inline`. Vertical rhythm
  uses `padding-block`. **Never the `padding` shorthand on an element that also
  carries the wrapper class**, because its `0` silently deletes the gutter. That
  is exactly how the Kept page lost its margins on every section.
- Minimum gutter 22px at phone width, 40px from 760px up.
- Grids collapse to `minmax(0,1fr)`, never bare `1fr`, whose minimum is `auto`.
- Touch targets 44px minimum for standalone controls. Inline links inside a
  sentence stay at text height.
- Use `dvh`, not `vh`, for anything pinned to the bottom, and add
  `env(safe-area-inset-bottom)`. Set `viewport-fit=cover` or the inset is zero.

**Page budget: eight tiles, and every tile earns its viewport.**

This is the one place Apple and Tesla need translating rather than copying.
Both use full-viewport tiles, and both are fine, because each tile is carrying a
product photograph doing real work. The current JQT homepage is twenty screens
of PARAGRAPHS, which is a different failure entirely.

So: a tile may fill the viewport when it holds the product. A tile holding only
prose gets the height its prose needs and no more. If a section cannot justify
its height against the one above it, it is cut, not shortened.

**Mobile section order**, from the structure reference:

1. Hero: the claim, one supporting line, one primary action, one line of proof
2. The problem, three items, tight
3. The product, as the thing itself and not a description of it
4. How we work
5. Pricing, with real numbers
6. Close
7. Footer

---

## 6. The centerpiece: let them use it

The strongest reference Chris chose is Adaline: **you can use the product on the
marketing page**. In June this was impossible. It is not any more. Kept has a
public demo with three doors, real data, and a nightly reset.

So the hero is not a screenshot of a board. It is a board, or it is one tap from
the real one. This replaces testimonials and logo bars, which JQT cannot use
anyway: the pilot property is a Wyndham franchise owned by family, and real
client names are off the table.

**Proof by artifact, not proof by metric.** There are no outcome numbers yet.
What is true and checkable today: the checklist gate, the append only log, the
daily RFC 3161 anchor an auditor can verify with openssl and no account, three
languages that are never gated, and a live demo. Never invent a statistic.

---

## 7. The header bar

Two tiers, taken from Apple, with Tesla's behaviour over the hero.

- **Global bar.** Persistent, pinned, thin (44 to 52px). The mark on the left,
  a short quiet link set, one primary action on the right. Links are small
  (12 to 14px), widely spaced, and never shout.
- **Over the hero it is transparent.** No background, no border, no shadow. It
  floats and trusts the content beneath it for contrast. On scroll it toggles to
  an opaque ground with a hairline. Tesla does exactly this and it is the single
  cheapest move that makes a page feel built rather than assembled.
- **No visible separator** between the bar and the hero. The seam is what makes
  a site look like a template.
- **Mobile:** collapse to a hamburger, mark stays visible, the primary action
  stays visible. The action never hides behind the menu.
- JQT's persistent "Ask JQT" bar anchored bottom-right is the same pattern Tesla
  uses for its own question bar. Keep it.

## 8. Motion

**Premium comes from movement through the scroll**, not from decoration sitting
still. This is the half of Apple and Tesla that is hardest to copy and the half
that actually reads as expensive.

- **One tile, one idea, roughly one viewport.** The page is a stack of
  edge-to-edge tiles alternating light and dark, each centred on one headline,
  one line, and one piece of product. Apple's whitespace rule: at least 64px of
  air above a headline, 48 to 64px below, and nothing within 40px of a product
  image.
- **The product moves as you scroll.** A board that fills in, a room that turns
  from dirty to clean, a log line that appends, a count that ticks. Tie it to
  scroll position so the reader drives it. This is the Adaline "taste it"
  mechanic expressed as motion, and Kept is the only thing on the page that
  should move.
- **One universal timing.** Tesla uses `0.33s` on a single cubic-bezier for
  every interactive state change, everywhere. Pick one curve, one duration, and
  do not vary them per component. Inconsistent easing is what makes a page feel
  cheap even when every individual animation is fine.
- **Scroll reveals start from a visible resting state.** Nothing parked at
  `opacity: 0` waiting on an observer: that is what a share preview, a
  screenshot and a skimming reader all get.
- Honour `prefers-reduced-motion`: the page must still read as a finished
  document with every animation switched off.

**The restraint that makes it work:** near-zero decoration everywhere else. No
shadows on type, no gradients, no borders, no patterns. Tesla's spec calls it
radical subtraction. Motion is the budget, so spend it there and nowhere else.

---

## 9. Never

Chris has flagged each of these, most of them more than once.

- **No em dashes or en dashes.** Anywhere. Commas, periods, colons, parentheses.
  Hyphen or "to" for ranges. It reads as an AI tell.
- **No AI agency look.** No 3D mascots, no glassmorphism, no purple-to-blue
  gradient hero, no acid green on near-black, no emoji as section markers, no
  one radius and one shadow stamped on every block.
- **No stock abstraction.** No abstract backgrounds behind the hero. Rejected.
- **No real client names**, no "trusted by" logo wall, no testimonials.
- **No invented metrics.** The pilot has no outcome data.
- **No internal vocabulary in the first line.** "Forward deployed operations" was
  the first thing on the page and nobody searches it. It earns its place one
  line down, explaining something the reader has already been told.
- **No legal boilerplate blurb in the footer.** Plain `Terms` and `Privacy`
  links, nothing else. The pages still have to exist and be reachable: Kept is a
  live SaaS handling staff data.
- **Status announcements instead of facts.** Do not write that something is
  robust, secure or industry leading. State the fact that makes it true. The
  concrete version is almost always already in the same sentence.

---

## 10. Voice

Short declaratives. The claim, then the thing that makes it checkable.

Write from the operator's side of the screen: rooms, shifts, the floor, the
desk, the morning. Not "stakeholders", not "solutions", not "leverage".

Name the failure honestly before naming the fix. The strongest copy on the site
is the sentence that admits this category sells to the person who signs and
ships to the person who cleans.

---

## 11. Reference set

What Chris actually chose, and what each one is for.

| Reference | What to take |
|---|---|
| **apple.com** | The gallery. One tile per idea, reverent product framing, near-invisible UI, a thin persistent nav, unusually low density |
| **tesla.com** | Radical subtraction. Nav transparent over the hero then opaque on scroll, one accent used only for primary actions, a single 0.33s curve for everything |
| **airsign.co** | The skin. Editorial, gallery-minimal, huge whitespace, the product as a sculptural object |
| **adaline.ai** | The mechanic. Use the product on the page. The centerpiece |
| **dutchie.com/business** | Product UI as the hero, one warm accent held with discipline, an italic serif phrase against big sans |
| **IBM / Carbon** | Credibility and structure. The grid, the restraint, the do-and-do-not discipline |
| **VoltAgent/awesome-design-md** | The format of this file. 74 brand specs. Read `ibm`. Do not read `claude`, it is the look being avoided |
| Goby recordings, June | Bold oversized mixed-weight type, one accent, an honest process flow, tasteful motion |

Anti-reference, stated explicitly: the "Claude look" and the generic AI agency
hero. If a draft could be any AI company's landing page, it has failed this file.
