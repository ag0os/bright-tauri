# Ink & Paper — migration cleanup plan

The design system swap (Modern Indigo → Ink & Paper) landed as an **alias
layer**: the old `--color-*` / `--typography-*` token names still exist but
now resolve to the new warm-ink / marigold / Newsreader palette. That lets
46 feature files keep working untouched, but it leaves debt. This document
is the punch list to pay it down.

The stages are ordered by **risk of confusing a future developer** — earlier
stages remove landmines, later stages are polish.

---

## Current state (2026-04-21)

- **Applied:** new palette, new type scale, new radii/shadows, topbar,
  button/input/card atoms, paper-grain background.
- **Aliased:** old token names (`--color-primary`, `--typography-body-font`,
  etc.) still resolve — all feature CSS keeps rendering.
- **Untouched:** Storybook stories, `design-system/templates/dashboard/`,
  old token filenames (`modern-indigo.css`, `classic-serif.css`,
  `purple-gradient.css`), Phosphor `weight="duotone"` across 29 files,
  RichTextEditor body type.
- **Not an issue:** element-templates.json never contained emoji; element
  icons already use the Phosphor names from the design system readme
  (`User`, `MapPin`, `Car`, `Package`, `Buildings`, `Bird`, `Calendar`,
  `Lightbulb`) — see `ElementCard.tsx:getElementIcon`. Only the
  `weight="duotone"` there needs to change, which folds into Stage 3.

---

## Stage 1 — Stop the lie in Storybook (high priority)

**Problem.** Every token story in `src/design-system/stories/` is titled
against the *old* system: "Modern Indigo", "Classic Serif", "Minimal
Squared", etc. A developer opening Storybook will see Ink & Paper colors
rendered under headings that describe the system it replaced. They will
either think the docs are wrong or that the app is running the old system.

**Files.**
- `src/design-system/stories/ColorTokens.stories.tsx`
- `src/design-system/stories/TypographyTokens.stories.tsx`
- `src/design-system/stories/ButtonTokens.stories.tsx`
- `src/design-system/stories/InputTokens.stories.tsx`
- `src/design-system/stories/CardTokens.stories.tsx`
- `src/design-system/stories/IconTokens.stories.tsx`
- `src/design-system/organisms/navigation/Navigation.stories.tsx`
- `src/design-system/templates/dashboard/Dashboard.tsx`,
  `Dashboard.stories.tsx`, `stats-grid.css`

**Work.**
1. Rewrite the copy in each story: titles ("Ink & Paper colors", "Newsreader
   + Geist", "Marigold buttons", etc.), descriptions, and any example text
   that references indigo / Playfair / 4px radius.
2. Add a landing story at `src/design-system/stories/Introduction.mdx` (or
   `.stories.tsx`) that explains: the system is **Ink & Paper**, the two
   theme modes, the token layering (native tokens are authoritative, old
   `--color-*` are aliases during migration), and links to
   `docs/design-system.md`.
3. Add stories that exercise the **new** native tokens (`--fg1`, `--accent`,
   `--bg`, `--fs-*`, `--lh-reading`, `--radius-*`) alongside existing
   aliased stories — makes it obvious which layer is which.
4. Screenshot the rendered Storybook and compare each card against the
   preview HTML in the design package (`bright-design-system/project/preview/`).
5. Update `docs/design-system.md` to match — the current file still says
   "Modern Indigo", "Classic Serif", etc.

**Ship as:** one PR per story group (colors, type, components, nav/dashboard)
— small reviews, incremental.

**Done when:** `npm run storybook`, every card's copy matches the rendered
visuals, no mention of "Modern Indigo" / "Classic Serif" / "Playfair" /
4px radius in any story or in `docs/design-system.md`.

---

## Stage 2 — Rename the token files themselves

**Problem.** The filenames lie: `modern-indigo.css` now contains Ink & Paper,
`classic-serif.css` contains Newsreader. Future `grep indigo` returns the
warm-ink palette — confusing. `purple-gradient.css` is dead (unreferenced).

**Work.**
1. Rename:
   - `tokens/colors/modern-indigo.css` → `tokens/colors/ink-and-paper.css`
   - `tokens/typography/classic-serif.css` → `tokens/typography/newsreader-geist.css`
2. Delete `tokens/colors/purple-gradient.css` (verify no imports first:
   `grep -r purple-gradient src`).
3. Update every `@import` in:
   - `src/App.css`
   - `src/shared/components/TopBar.css`
   - any other file that imports these paths (grep first).
4. Update `docs/design-system.md` file-path references.

**Risk.** Low. Mechanical rename + import update. `tsc` won't catch broken
CSS imports — verify with `npm run build` and a visual smoke test.

**Ship as:** one PR. Small, reviewable.

**Done when:** no filenames contain "indigo", "classic-serif", or
"purple-gradient"; `npm run build` green; app still renders.

---

## Stage 3 — Migrate Phosphor `weight="duotone"` → regular

**Problem.** The design system readme (and chat transcript — the user
specifically corrected this) says **flat/regular** weight icons, no duotone.
TopBar is fixed; 29 other files still pass `weight="duotone"`.

**Files.** 29 `.tsx` files across `features/`, `shared/components/`,
`design-system/`, `editor/`. See the grep in the prior session.

**Work.**
1. Drop `weight="duotone"` everywhere it's the default. Phosphor's default
   weight is `regular`, so just delete the prop.
2. Keep `weight="fill"` only on selected/active-state icons per the design
   system (favorites, completed checkmarks).
3. One exception per the readme: empty-state hero icons at 48px/40% opacity
   can stay flat — just confirm none are using duotone.

**Risk.** Trivial — it's a prop deletion. No type changes.

**Approach.** Do it as a single scripted sweep with ripgrep + `sed`, then
visually review the diff. Or a codemod script if we expect more rounds.

**Ship as:** one PR. Commit message should cite the design system readme
section on iconography.

**Done when:** `grep -r 'weight="duotone"' src` returns zero, or only
intentional cases commented as such.

---

## Stage 4 — Reading surface (RichTextEditor) uses the reading tokens

**Problem.** The design system spec is specific about the writing surface:
Newsreader serif, 18–20px, 1.7 line-height, max 68ch column. The current
`RichTextEditor.css` uses `--color-*` aliases (so colors are correct) but
font family / size / line-height / max-width are probably still the old
UI sans defaults.

**Work.**
1. Audit `src/editor/RichTextEditor.css` and `src/features/stories/views/
   StoryEditor.css` against the spec:
   - `.editor-content` (or equivalent) → `font-family: var(--font-display)`,
     `font-size: var(--fs-md)` (17px) or 18–20px literal, `line-height:
     var(--lh-reading)` (1.7), `max-width: 68ch` (the spec also says
     `--layout-reading-w: 720px` — use whichever reads tighter).
   - Chrome (toolbar, status chip) stays in `var(--font-body)` (Geist) —
     the contrast between reading serif and UI sans is intentional.
2. Verify selection color uses `var(--selection)` (marigold-tinted) — this
   is the moment where the accent actually shows up for the writer.
3. Test in both themes.

**Risk.** Low-medium. Writers will feel this change immediately; worth a
round of feedback after it lands.

**Ship as:** one PR with screenshots (dark + light). Include a note that
the change is driven by the design spec section "Type → Writers compose
in a reading serif inside the editor."

**Done when:** the editor renders in Newsreader at 17–20px / 1.7 / ~68ch,
visually distinct from the UI chrome.

---

## Stage 5 — Retire the alias layer (the long game)

**Problem.** `--color-primary`, `--typography-body-font`, `--color-indigo-700`,
etc. are all aliases. They made the big swap painless, but they're debt:
new developers will copy the old names from existing files and the
native-vs-alias layering will stay murky forever.

**Work (incremental).**
1. **Don't rip out the alias layer.** It's load-bearing for 46 files.
2. **Freeze the aliases** — add a comment to `ink-and-paper.css`:
   > "These `--color-*` tokens are legacy aliases. New code should use the
   > native tokens (`--fg1`, `--accent`, `--bg`, `--surface`, etc.). Do not
   > add new `--color-*` tokens here."
3. **Migrate file-by-file** as features are touched for other reasons —
   opportunistically swap `--color-text-primary` → `--fg1`, etc. One file
   at a time, in the same PR as whatever work brought you there. Never as
   a dedicated "rename" PR — those produce giant unreviewable diffs.
4. **Add a lint rule** (Stylelint `declaration-property-value-disallowed-list`
   or a custom rule) that warns on `--color-*` / `--typography-*` usage in
   new files under `src/features/**`. Keep it as warn, not error, so it
   doesn't block work.
5. **Track progress.** Count remaining `--color-*` references every quarter;
   when near zero, delete the aliases and the lint rule.

**Risk.** None per-change (each migration is one file). High cumulatively
if done as a mass rename — don't.

**Ship as:** folded into other PRs. No dedicated tracker issue.

**Done when:** `grep -r "var(--color-" src/features src/shared src/editor`
is near zero, then the alias block in `ink-and-paper.css` can be deleted
and the file shrinks by ~120 lines.

---

## Stage 6 — Update CLAUDE.md and the design system doc

**Problem.** `CLAUDE.md` still describes the old palette ("Modern Indigo
— professional blue/indigo with warm amber accents"), old typography
("Playfair Display + system sans"), old button radius (4px), and old
card style (elevated shadow with 2px lift on hover). Any future Claude
session reading this will get the wrong mental model.

**Work.**
1. Rewrite the `## Design System` section of `CLAUDE.md` to describe
   Ink & Paper: warm ink dark + marigold accent, Newsreader + Geist +
   JetBrains Mono, 8/12/16 radii, flat cards with hairline borders,
   no hover transform, paper-grain background.
2. Refresh `docs/design-system.md` with the same content — expand it
   with the full token reference so it can be the authoritative doc.
3. Add a short section to both documents explaining the **alias layer**
   — what `--color-*` tokens are, why they exist, and that they're
   being phased out (see Stage 5).
4. Link the original design package README into `docs/design-system.md`
   as the source of truth for voice/casing/punctuation rules.

**Risk.** None.

**Ship as:** one PR alongside whichever stage lands first — probably
Stage 1 (stories need the new names too).

**Done when:** `grep -i "modern indigo\|classic serif\|playfair" CLAUDE.md
docs/` returns nothing except historical references in decision records.

---

## Suggested ordering

If you want to do these opportunistically, pick **Stage 6 first** (doc
fix — under an hour, prevents future confusion) then **Stage 3** (Phosphor
weight — mechanical, reviewable in one sitting).

If you want a clean sprint, run **1 → 2 → 3 → 4** as four focused PRs
over a few days, and keep **Stage 5** as background work. Stage 5 never
"finishes" on its own calendar — it just retires.

---

## Out of scope

- AI integration, voice dictation, new features — unaffected by this plan.
- Storybook tooling upgrades.
- Offline font embedding (the design system readme mentions this as a
  user choice — defer until someone actually asks for offline builds).
