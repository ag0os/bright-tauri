---
id: TASK-025
title: Stage 5 module migration — src/features/settings
status: Done
priority: medium
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-018
createdAt: '2026-04-22T20:30:48.061Z'
updatedAt: '2026-04-22T21:36:50.090Z'
---

## Description

Migrate all aliased token usages in `src/features/settings/` to native tokens.

**Work:**
1. Find all alias usages: `rg -l 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/settings`
2. Replace each alias with its native-token equivalent per `docs/design-reference/alias-map.md`.
3. Run `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/settings` — must return zero.
4. Visual diff both dark and light themes.
5. Standard validation checklist.

Commit message must reference `plan:ink-and-paper-migration-cleanup` stage 5.

<!-- AC:BEGIN -->
- [ ] #1 rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/settings returns zero matches
- [ ] #2 All replacements follow docs/design-reference/alias-map.md
- [ ] #3 Visual QA passes in dark and light themes
- [ ] #4 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Original worker run falsely claimed settings had zero alias usages. Quality-gate audit found Settings.css and SettingsPage.css still carried dozens of `var(--color-*)` / `var(--font-size-*)` references. Migration completed in follow-up commit c8d0204. Grep now zero for src/features/settings.
