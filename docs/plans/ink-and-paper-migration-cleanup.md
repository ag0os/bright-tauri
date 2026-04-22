# Ink & Paper — migration cleanup plan

The design system swap (legacy theme → Ink & Paper) landed as an **alias
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
  legacy token filenames pending cleanup, Phosphor `weight="duotone"`
  across 30 files (~94 occurrences), editor reading surface.
- **Stale / contradictory docs:**
  - `AGENTS.md:89-94` still tells contributors to use `var(--color-primary)`.
  - `docs/design-system.md` still describes the legacy palette and typography names.
  - `docs/ui-navigation.md:555-565` still references the old palette.
  - the stale roadmap doc still exists.
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
3. **Three-doc split + one skill for design-system guidance** (see Stage 6):
   - `docs/design-reference/` — exported reference, read-only.
   - `docs/design-system.md` — canonical prose reference for humans.
   - `.claude/skills/ink-and-paper/SKILL.md` — on-demand agent guidance
     (tokens, voice, iconography, editor values, alias-retirement status).
   `AGENTS.md` keeps only a short blurb + a pointer to the skill, so
   non-UI sessions don't pay the token cost.
4. **Editor reading surface uses the package's canonical values:**
   `font-family: var(--font-display)` (Newsreader),
   `font-size: var(--fs-md)` (17px),
   `line-height: var(--lh-reading)` (1.7),
   `max-width: var(--layout-reading-w)` (720px).
   Source: `docs/design-reference/project/colors_and_type.css:132,144,173-174,251,375-378`.
5. **The stale roadmap doc is deleted** (no replacement in scope).
   **`docs/ui-navigation.md` is kept** — its UX ideas are still the design
   intent — but design-system-specific references are synced to Ink & Paper.
6. **No new lint tooling.** Biome does not enforce CSS custom-property
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
against the *old* system naming: legacy palette names, legacy typography names,
"Minimal Squared", etc. A developer opening Storybook will see Ink & Paper colors
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
   that references the legacy palette, the previous display serif, or 4px radius.
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
of the retired palette/type names or 4px radius remains in any story;
standard validation checklist passes; the verification sweep over
`src/design-system` returns zero matches.

---

## Stage 2 — Rename the token files

**Problem.** The filenames lie: the color token file now contains Ink & Paper,
the typography token file now contains Newsreader + Geist, and the unused
purple-only color file should be removed.

**Work.**
1. Rename the legacy token files to:
   - `tokens/colors/ink-and-paper.css`
   - `tokens/typography/newsreader-geist.css`
2. Delete the unused purple-only color token file once references are gone.
3. Update **all** references to these filenames — both `@import` in CSS
   and `import "..."` in TS/TSX.
4. Update path references in `docs/design-system.md`.

**Risk.** Low. Mechanical rename + import update. `tsc` won't catch broken
CSS `@import`s — rely on `npm run build` + visual smoke.

**Ship as:** one PR.

**Done when:** no source or docs files refer to the retired filenames; the
standard validation checklist passes; app renders in both themes.

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
   (`src/design-system/tokens/colors/ink-and-paper.css:170-230`,
   `src/design-system/tokens/typography/newsreader-geist.css:55-95`).
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
tell people to use aliases, and the most useful agent guidance — tokens,
voice, iconography, editor values — is either missing or scattered:

- `AGENTS.md:89-94` — prescribes `var(--color-primary)` and
  `className="btn btn-primary btn-base"`.
- `AGENTS.md:124-129` — "Key docs" list is out of date (Stage 0 partially
  fixed this by adding `docs/design-reference/`; still needs the
  stale roadmap removal).
- `docs/design-system.md` — still describes the legacy palette and typography names.
- `docs/ui-navigation.md:555-565` — still references the old palette
  under "Design System Integration".
- The stale roadmap doc still exists (user: can be removed).
- No on-demand agent guidance exists for UI work; the detail lives only
  in `docs/design-reference/`, which agents don't read by default.
- `CLAUDE.md` — just `@AGENTS.md`, so no separate edit needed.

**Design: three-doc split + one skill.**

| Artifact | Role | Audience |
| --- | --- | --- |
| `docs/design-reference/` | Exported source of truth (HTML/CSS). Read-only. | Humans + agents who need the raw package. |
| `docs/design-system.md` | Canonical prose reference: tokens, themes, patterns. | Humans reading the repo. |
| `.claude/skills/ink-and-paper/SKILL.md` | On-demand agent guidance with triggers. | Agents editing UI/CSS/components. |
| `AGENTS.md` | Short blurb + pointer to the skill. Universal, always loaded. | Every agent session. |

This keeps AGENTS.md small (no token cost on backend/Rust sessions),
puts rich detail in a skill that only loads when relevant, and leaves
one canonical human-readable doc.

**Work.**

1. **Write `.claude/skills/ink-and-paper/SKILL.md`** following the shape
   of `.claude/skills/backlog-manager/SKILL.md` (YAML frontmatter with
   `name`, `description`, `allowed-tools`; body in Markdown). Contents:
   - **Description/triggers:** "Use when editing CSS, building components,
     touching tokens, styling the editor, or any UI work. Triggers on
     mentions of tokens, colors, typography, Ink & Paper, Newsreader,
     marigold, Phosphor icons, or paths under `src/design-system/` /
     `src/features/**/*.css` / `src/editor/`."
   - Native token table (`--fg1`, `--fg2`, `--bg`, `--surface`,
     `--accent`, `--selection`, `--fs-*`, `--lh-*`, `--radius-*`, etc.)
     — sourced from `docs/design-reference/project/colors_and_type.css`.
   - Theme modes + how to test both.
   - Typography: UI chrome uses `var(--font-body)` (Geist); reading
     surface uses `var(--font-display)` (Newsreader) at `--fs-md` / 1.7 /
     `--layout-reading-w`.
   - Iconography: Phosphor regular weight; `weight="fill"` only for
     active/selected states; no `weight="duotone"`.
   - Component patterns: flat cards, hairline borders, no hover transform,
     8/12/16 radii, paper-grain background.
   - Voice/tone rules (cite `docs/design-reference/README.md` section).
   - **Alias-retirement status** (living section): updated as Stage 5
     progresses — "aliases frozen / N of M modules migrated / aliases
     deleted." Instruct agents never to introduce `var(--color-*)` etc.
   - Pointers to `docs/design-system.md` and `docs/design-reference/`.
2. **Trim `AGENTS.md` `### Design system` section** to a short blurb +
   a pointer:
   ```
   ### Design system

   - Token-first, CSS custom properties, WCAG AA. Do not introduce
     external component libraries.
   - The system is **Ink & Paper** (warm ink + marigold, Newsreader + Geist,
     Phosphor regular weight, flat cards with hairline borders).
   - **For any UI/CSS/component work, load `/skill:ink-and-paper` first** —
     it has the token table, iconography policy, editor reading values,
     and the current alias-retirement status.
   - Full human-readable reference: `docs/design-system.md`.
     Exported source of truth: `docs/design-reference/`.
   ```
   Do **not** keep the `var(--color-primary)` example — the skill carries
   the correct native-token examples.
3. **Rewrite `docs/design-system.md`** as the canonical prose reference:
   full native-token table, theme modes, typography scale (UI vs reading),
   radii/shadows, link to the skill for agent-specific guidance, link to
   `docs/design-reference/` for the exported package, short alias-retirement
   note pointing at Stage 5.
4. **Update `docs/ui-navigation.md`** — keep every UX/navigation idea
   untouched, but in the "Design System Integration" section
   (lines 555-565 and any similar block) replace the legacy design-system
   wording with the Ink & Paper / Newsreader + Geist / Phosphor regular-weight
   language. Use a targeted `rg` search over `docs/ui-navigation.md` to find
   the spots.
5. **Delete the stale roadmap doc** and remove any cross-links before
   deleting it. Also remove its line from `AGENTS.md` "Key docs".
6. **Final sweep:** run the retired-theme search and confirm only
   historical references remain in `docs/decisions/` and archived plans.

**Risk.** None — documentation + skill authoring only. Main thing to get
right is the skill's `description` field: it must fire on UI-flavored
tasks without over-triggering on backend work.

**Ship as:** can be split in two if convenient:
  - PR A: write the skill + trim AGENTS.md + rewrite `docs/design-system.md`.
  - PR B: `docs/ui-navigation.md` sync + delete the stale roadmap doc + final sweep.

**Done when:**
- `.claude/skills/ink-and-paper/SKILL.md` exists with a description that
  reliably fires on UI tasks.
- `AGENTS.md` design section is a short blurb + skill pointer; no
  `var(--color-primary)` example remains.
- `docs/design-system.md` is rewritten around Ink & Paper.
- `docs/ui-navigation.md` cites Ink & Paper in its design-system section;
  UX content untouched.
- The stale roadmap doc is gone and no active file links to it.
- The final `rg` sweep is clean.

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
