---
id: TASK-018
title: >-
  Stage 5 prep — Freeze alias comments + build alias→native map at
  docs/design-reference/alias-map.md
status: To Do
priority: high
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-016
createdAt: '2026-04-22T20:30:12.422Z'
updatedAt: '2026-04-22T20:30:12.422Z'
---

## Description

Before migrating call sites, freeze the alias layer with prominent comments and document the complete alias→native mapping so every module migration task has a single authoritative reference.

**Files touched:**
- `src/design-system/tokens/colors/ink-and-paper.css` (add freeze comment to alias block)
- `src/design-system/tokens/typography/newsreader-geist.css` (add freeze comment to alias block)
- `docs/design-reference/alias-map.md` (create)

**Work:**
1. Add a comment block at the top of the alias section in each file:
   > "These tokens are legacy aliases being retired in Stage 5 of the Ink & Paper cleanup. Do not add new --color-* / --typography-* / --font-size-* tokens. New code uses native tokens (--fg1, --accent, --fs-md, etc.)."
2. Build `docs/design-reference/alias-map.md`: document every `--color-*`, `--typography-*`, `--font-family-*`, `--font-size-*`, `--line-height-*`, `--font-weight-*` alias and its native-token replacement. Sources: `src/design-system/tokens/colors/ink-and-paper.css` alias block (formerly lines 170-230 of modern-indigo.css) and `src/design-system/tokens/typography/newsreader-geist.css` alias block (formerly lines 55-95 of classic-serif.css). Also note the spacing token decision (migrate for consistency per the plan).
3. No source behavior changes in this task — comments and documentation only.

This task must complete before any module migration begins. Workers for module tasks must reference `docs/design-reference/alias-map.md` for every swap.

<!-- AC:BEGIN -->
- [ ] #1 Alias sections in ink-and-paper.css and newsreader-geist.css carry a prominent 'legacy alias — do not add new entries' comment block
- [ ] #2 docs/design-reference/alias-map.md exists and documents every --color-*, --typography-*, --font-family-*, --font-size-*, --line-height-*, --font-weight-* alias with its native-token replacement
- [ ] #3 alias-map.md includes the spacing token decision (migrate for consistency)
- [ ] #4 No source behavior or visual change introduced in this task
- [ ] #5 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->
