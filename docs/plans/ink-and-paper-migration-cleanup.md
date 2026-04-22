# Ink & Paper — migration cleanup plan

The design system swap (Modern Indigo → Ink & Paper) landed as an **alias
layer**: the old `--color-*` / `--typography-*` token names still exist
but now resolve to the new warm-ink / marigold / Newsreader palette.
That kept ~46 feature files rendering untouched, but it leaves debt. This
document is the punch list to pay it down **and finish the migration** —
aliases are being retired entirely, not kept long-term.

The stages are ordered by **risk of confusing a future developer** —
earlier stages remove landmines, later stages finish the job.

---

## Current state (2026-04-22)

- **Applied:** new palette, new type scale, new radii/shadows, topbar,
  button/input/card atoms, paper-grain background.
- **Aliased:** old token names (`--color-primary`, `--typography-body-font`,
  `--font-size-base`, `--color-border-strong`, `--color-selection`, etc.)
  still resolve — all feature CSS keeps rendering.
- **Undefined & rendering from browser defaults:**
  `--font-family-body`, `--font-family-heading`, `--line-height-body`,
  `--line-height-heading` are referenced by `src/editor/RichTextEditor.css`
  but are **not defined** anywhere in `src/design-system/tokens/` — the
  editor has been silently falling back to UA defaults. Confirm with
  `rg -n '\-\-font-family-body|--font-family-heading|--line-height-body|--line-height-heading' src/design-system/tokens` → no matches.
- **Untouched:** Storybook stories, `design-system/templates/dashboard/`,
  old token filenames (`modern-indigo.css`, `classic-serif.css`,
  `purple-gradient.css`), Phosphor `weight="duotone"` across 30 files
  (~94 occurrences), editor reading surface.
- **Stale / contradictory docs:**
  - `AGENTS.md:89-94` still tells contributors to use `var(--color-primary)`.
  - `docs/design-system.md` still describes "Modern Indigo" / "Classic Serif".
  - `docs/ui-navigation.md:555-565` still references the old palette.
  - `docs/ideas/roadmap.md` is stale.
- **Not an issue:** element-templates.json never contained emoji; element
  icons already use the Phosphor names from the design system readme
  (`User`, `MapPin`, `Car`, `Package`, `Buildings`, `Bird`, `Calendar`,
  `Lightbulb`) — see `ElementCard.tsx:getElementIcon`. Only the
  `weight="duotone"` there needs to change, which folds into Stage 3.

---

## Decisions (locked for this plan)

1. **Aliases are retired, not kept.** Stage 5 migrates every call site and
   then deletes the alias block. New code must use native tokens.
2. **Design package lives in the repo** at `docs/design-reference/`
   (moved out of `~/Downloads/` — this repo is now the authoritative
   location). Every stage cites paths under `docs/design-reference/`.
3. **Editor reading surface uses the package's canonical values:**
   `font-family: var(--font-display)` (Newsreader),
   `font-size: var(--fs-md)` (17px),
   `line-height: var(--lh-reading)` (1.7),
   `max-width: var(--layout-reading-w)` (720px).
   Source: `docs/design-reference/project/colors_and_type.css:132,144,173-174,251,375-378`.
4. **`docs/ideas/roadmap.md` is deleted** (stale, no replacement in scope).
   **`docs/ui-navigation.md` is kept** — its UX ideas are still the design
   intent — but design-system-specific references are synced to Ink & Paper.
5. **No new lint tooling.** Biome does not enforce CSS custom-property
   names and the project has no Stylelint. Enforcement comes from Stage 5
   eliminating the aliases and a simple `rg` guard described there.

---

## Per-stage validation checklist

Every executable stage ends with:

- `npm run lint` — Biome lint + format
- `npm run test:run` — Vitest once
- `npm run build` — tsc + Vite (catches missing CSS imports)
- `npm run storybook` — manual smoke if the stage touches stories or tokens
- Manual dark + light QA if the stage has visual output

List any stage-specific checks under **Done when**.

---

## Stage 0 — Commit the design reference to the repo

**Problem.** The rest of the plan needs a stable, reviewable source of
truth for Ink & Paper values, preview HTML, and voice/tone rules.

**Status.** The package has already been moved from `~/Downloads/` to
`docs/design-reference/` (tree: `README.md`, `project/README.md`,
`project/SKILL.md`, `project/colors_and_type.css`, `project/assets/`,
`project/preview/`, `project/ui_kits/`). This stage just finalizes it.

**Work.**
1. Commit `docs/design-reference/` to git as-is.
2. Add a short note at the top of `docs/design-reference/README.md`
   stating: "Source of truth for Ink & Paper tokens, preview HTML,
   icon weights, and voice. Do not edit — regenerate by re-exporting
   from Claude Design."
3. Add `docs/design-reference/` to "Key docs" in `AGENTS.md`
   (folds into Stage 6 doc sync, but can land here if it's convenient).
4. Confirm nothing under `docs/design-reference/project/` is imported by
   `src/`: `rg -l 'design-reference' src` returns zero. This tree is
   reference-only — production CSS lives in `src/design-system/tokens/`.

**Risk.** None — already on disk, just needs committing.

**Ship as:** one PR (can be the first commit of Stage 6's doc sync).

**Done when:** `docs/design-reference/` is tracked in git;
`rg -l 'design-reference' src` returns zero;
`docs/design-reference/README.md` carries the "do not edit" note.

---

## Stage 1 — Stop the lie in Storybook

**Problem.** Every token story in `src/design-system/stories/` is titled
against the *old* system: "Modern Indigo", "Classic Serif", "Minimal
Squared", etc. A developer opening Storybook will see Ink & Paper colors
rendered under headings that describe the system it replaced.

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
   + Geist", "Marigold buttons"), descriptions, and any example text
   that references indigo / Playfair / 4px radius.
2. Add a landing story at `src/design-system/stories/Introduction.mdx`
   explaining: the system is **Ink & Paper**, the two theme modes, the
   token layering (native tokens are authoritative; aliases exist during
   migration and are being retired — see Stage 5), and link to
   `docs/design-system.md` + `docs/design-reference/`.
3. Add stories that exercise the **native** tokens (`--fg1`, `--accent`,
   `--bg`, `--fs-*`, `--lh-reading`, `--radius-*`) alongside existing
   aliased stories — makes the two layers visible side by side.
4. Compare each story card against `docs/design-reference/project/preview/`
   HTML (now repo-local thanks to Stage 0).

**Ship as:** one PR per story group (colors, type, components, nav/dashboard).

**Done when:** every story's copy matches the rendered visuals; no mention
of "Modern Indigo" / "Classic Serif" / "Playfair" / 4px radius in any
story; standard validation checklist passes;
`rg -i 'modern indigo|classic serif|playfair' src/design-system` returns
zero matches.

---

## Stage 2 — Rename the token files

**Problem.** The filenames lie: `modern-indigo.css` now contains Ink & Paper,
`classic-serif.css` contains Newsreader + Geist. `purple-gradient.css` is
dead (unreferenced). Future `grep indigo` returns the warm-ink palette.

**Work.**
1. Rename:
   - `tokens/colors/modern-indigo.css` → `tokens/colors/ink-and-paper.css`
   - `tokens/typography/classic-serif.css` → `tokens/typography/newsreader-geist.css`
2. Delete `tokens/colors/purple-gradient.css` after
   `rg 'purple-gradient' src docs` returns zero.
3. Update **all** references to these filenames — both `@import` in CSS
   and `import "..."` in TS/TSX. Find them with:
   `rg -l 'modern-indigo|classic-serif' src docs`.
   Known entry points: `src/App.css`, `src/shared/components/TopBar.css`,
   `src/features/stories/views/StoryEditor.tsx`,
   `src/features/universe/views/UniverseList.tsx`.
4. Update path references in `docs/design-system.md`.

**Risk.** Low. Mechanical rename + import update. `tsc` won't catch broken
CSS `@import`s — rely on `npm run build` + visual smoke.

**Ship as:** one PR.

**Done when:** `rg 'modern-indigo|classic-serif|purple-gradient' src docs`
returns zero; standard validation checklist passes; app renders in both
themes.

---

## Stage 3 — Migrate Phosphor `weight="duotone"` → regular

**Problem.** `docs/design-reference/README.md` and the Ink & Paper spec
call for **flat/regular** weight icons, no duotone. TopBar is fixed;
30 other files still pass `weight="duotone"` (~94 occurrences).

**Work.**
1. Drop `weight="duotone"` wherever it's a default-state icon. Phosphor's
   default weight is `regular`, so just remove the prop.
2. Keep `weight="fill"` only on selected/active-state icons per the
   design system (favorites, completed checkmarks).
3. Confirm empty-state hero icons (the one exception that may be flat at
   48px/40% opacity per the readme) aren't using duotone.

**Risk.** Trivial — prop deletion, no type changes.

**Approach.** One scripted sweep with `rg` + `sed`, then visual diff review.

**Ship as:** one PR. Commit message cites the design reference iconography
section.

**Done when:** `rg 'weight="duotone"' src` returns zero (or only
explicitly-commented exceptions); standard validation checklist passes.

---

## Stage 4 — Reading surface uses the reading tokens

**Problem.** The editor is off-spec in two ways:

1. `src/editor/RichTextEditor.css` references tokens that **don't exist**:
   `--font-family-body` (lines 79), `--line-height-body` (line 81),
   `--font-family-heading` (lines 122, 133, 143),
   `--line-height-heading` (lines 125, 136, 146). Verify:
   `rg -n '\-\-font-family-body|--font-family-heading|--line-height-body|--line-height-heading' src/design-system/tokens` → no matches.
   The editor is currently rendering with UA defaults for font-family
   and line-height.
2. Even the defined tokens it uses (`--font-size-base`) route through the
   UI chrome scale, not the reading scale the design package specifies.

**Work.**
1. Replace the unsupported token names with the canonical native tokens:
   - Reading surface (`.editor-content`):
     `font-family: var(--font-display)`,
     `font-size: var(--fs-md)` (17px),
     `line-height: var(--lh-reading)` (1.7),
     `max-width: var(--layout-reading-w)` (720px),
     `width: 100%`, `margin: 0 auto`.
   - Headings (`.editor-heading-h1/h2/h3`):
     `font-family: var(--font-display)`,
     `line-height: var(--lh-tight)`.
   - Chrome (toolbar, status): keep on `var(--font-body)` (Geist).
2. If `.editor-content` can't be centered directly (it's the Lexical
   `contenteditable` host — see `src/editor/RichTextEditor.tsx:83-94`),
   introduce a `.editor-reading-column` wrapper inside `.editor-container`
   and put `max-width` + `margin: 0 auto` there instead.
3. Verify `::selection` uses `var(--selection)` (already correct via alias,
   but native is `var(--selection)` directly — swap while you're in there).
4. Audit `src/features/stories/views/StoryEditor.css` for any conflicting
   overrides.

**Risk.** Low-medium. Writers will feel this change immediately — include
dark + light screenshots in the PR.

**Ship as:** one PR. Commit message cites
`docs/design-reference/project/colors_and_type.css:132,144,173-174,251`.

**Done when:**
- `rg -n '\-\-font-family-body|--font-family-heading|--line-height-body|--line-height-heading' src` returns zero.
- Editor renders in Newsreader at 17px / 1.7 line-height / centered 720px column.
- UI chrome stays in Geist.
- Standard validation checklist passes.

---

## Stage 5 — Retire the alias layer

**Problem.** `--color-primary`, `--typography-body-font`, `--font-size-base`,
`--color-border-strong`, `--color-selection`, etc. are aliases — load-bearing
for the ~1500 call sites across `src/`. The decision (per user) is to
**finish the migration**, not leave the alias layer in place.

**Scope.** All `var(--color-*)`, `var(--typography-*)`, `var(--font-family-*)`,
`var(--font-size-*)`, `var(--line-height-*)`, `var(--font-weight-*)`
usages under `src/`. Spacing tokens (`--spacing-*`) are **also aliases**
(see `src/design-system/tokens/spacing.css:14-19`) but match the native
scale 1:1 — decide in the first batch whether to migrate them or leave
them as the one permanent alias family. Default: migrate for consistency.

**Work (incremental, finite).**
1. **Freeze the aliases first.** Add a comment block at the top of the
   alias section in `ink-and-paper.css` and `newsreader-geist.css`:
   > "These tokens are legacy aliases being retired in Stage 5 of the
   > Ink & Paper cleanup. Do not add new `--color-*` / `--typography-*` /
   > `--font-size-*` tokens. New code uses native tokens
   > (`--fg1`, `--accent`, `--fs-md`, etc.)."
2. **Build a migration map** (one commit, no behavior change) — document
   each alias → native mapping in `docs/design-reference/alias-map.md`.
   Source: the alias blocks themselves
   (`src/design-system/tokens/colors/modern-indigo.css:170-230`,
   `src/design-system/tokens/typography/classic-serif.css:55-95`).
3. **Migrate by module, one PR per module:**
   - `src/shared/` + `src/App.css` + `src/editor/` (already touched in Stage 4)
   - `src/design-system/templates/` + `src/design-system/organisms/`
   - `src/features/universe/`
   - `src/features/containers/`
   - `src/features/stories/`
   - `src/features/elements/`
   - `src/features/settings/`
   - `src/pages/`
   Each PR: `rg -l 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' <dir>`,
   swap to native using the alias map, run the validation checklist,
   visual diff both themes.
4. **Delete the alias block.** Once
   `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src` returns zero,
   remove the alias sections from `ink-and-paper.css` and
   `newsreader-geist.css`.
5. **Add a CI guard.** Extend the `lint` script (or add a `lint:tokens`
   script) with:
   `! rg -q 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src`
   — this fails the build if anyone reintroduces an alias.
6. **Update `AGENTS.md`** (folds into Stage 6) to remove any guidance
   mentioning `var(--color-primary)` and point contributors at the native
   tokens + `docs/design-system.md`.

**Risk.** Per-PR risk is low (one module at a time, visual diff). Dropping
the alias block at the end is the only high-stakes step — do it in its own
PR after step 4's grep is clean.

**Ship as:** a module-at-a-time sequence of PRs, then the deletion PR.

**Done when:**
- `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src` returns zero.
- Alias blocks removed from token files.
- CI guard in place.
- Standard validation checklist passes on the deletion PR.

---

## Stage 6 — Sync the docs and contributor guide

**Problem.** Contributor-facing docs still describe the old system and
tell people to use aliases:

- `AGENTS.md:89-94` — prescribes `var(--color-primary)` and
  `className="btn btn-primary btn-base"`.
- `AGENTS.md:124-129` — "Key docs" list is out of date.
- `docs/design-system.md` — still describes "Modern Indigo / Classic Serif".
- `docs/ui-navigation.md:555-565` — still references the old palette
  under "Design System Integration".
- `docs/ideas/roadmap.md` — stale (user: can be removed).
- `CLAUDE.md` — just `@AGENTS.md`, so no separate edit needed.

**Work.**
1. **Update `AGENTS.md`:**
   - Replace the `var(--color-primary)` guidance with native tokens
     (`var(--fg1)`, `var(--accent)`, `var(--bg)`, etc.); cite
     `docs/design-system.md` as the full reference.
   - Describe Ink & Paper in a short blurb: warm ink dark + marigold,
     Newsreader + Geist + JetBrains Mono, 8/12/16 radii, flat cards with
     hairline borders, paper-grain background.
   - Add `docs/design-reference/` to "Key docs".
   - Remove `docs/ideas/roadmap.md` from "Key docs".
2. **Rewrite `docs/design-system.md`** as the authoritative token reference:
   full native-token table, theme modes, typography scale (with canonical
   values for UI vs reading), radii/shadows, the temporary alias-retirement
   note (link Stage 5), link to `docs/design-reference/`.
3. **Update `docs/ui-navigation.md`** — keep every UX/navigation idea
   untouched, but in the "Design System Integration" section
   (lines 555-565 and any similar block) replace "Modern Indigo /
   Classic Serif / Lucide" with "Ink & Paper / Newsreader + Geist /
   Phosphor regular weight". A `rg -n 'Modern Indigo|Classic Serif|Lucide|Playfair'
   docs/ui-navigation.md` sweep will find the spots.
4. **Delete `docs/ideas/roadmap.md`** and remove any cross-links
   (`rg -n 'ideas/roadmap' .` before deleting).
5. **Final sweep:**
   `rg -i 'modern indigo|classic serif|playfair|purple gradient' .`
   returns nothing except historical references in
   `docs/decisions/` and archived plans.

**Risk.** None — documentation-only.

**Ship as:** one PR, landed alongside or just after Stage 1 (Storybook
and docs should match).

**Done when:** the final sweep is clean; `AGENTS.md` points contributors
at native tokens; `docs/ideas/roadmap.md` is gone;
`docs/ui-navigation.md` still holds its UX content but cites Ink & Paper.

---

## Suggested ordering

Recommended sequence for one tight migration sprint:

1. **Stage 0** — vendor the reference (unblocks everything else).
2. **Stage 6 (docs only)** — AGENTS.md + design-system.md + delete roadmap.
   Cheap, stops future confusion immediately. Leave the
   `docs/ui-navigation.md` sweep and the native-tokens guidance update
   for now so they can land together with Stage 1.
3. **Stage 3** — Phosphor duotone purge. Mechanical, one PR.
4. **Stage 2** — token filename renames.
5. **Stage 1** — Storybook rewrite + remaining Stage 6 doc items.
6. **Stage 4** — editor reading surface (also first Stage 5 migration).
7. **Stage 5** — module-by-module alias retirement, then delete aliases,
   then add CI guard.

If capacity is tight, Stage 0 + Stage 6 doc fix + Stage 3 alone remove
the most acute "future developer lands here and is confused" footguns.

---

## Out of scope

- AI integration, voice dictation, new features — unaffected by this plan.
- Storybook tooling upgrades.
- Offline font embedding (the design reference mentions this as a
  user choice — defer until someone asks for offline builds).
- Adding Stylelint or any new CSS lint tooling — Stage 5 ends with a
  single-line `rg` guard in the existing `lint` script instead.
