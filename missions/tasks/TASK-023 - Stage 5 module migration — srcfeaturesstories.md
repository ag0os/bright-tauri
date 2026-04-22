---
id: TASK-023
title: Stage 5 module migration — src/features/stories
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-018
createdAt: '2026-04-22T20:30:39.510Z'
updatedAt: '2026-04-22T21:36:50.091Z'
---

## Description

Migrate all aliased token usages in `src/features/stories/` to native tokens.

**Work:**
1. Find all alias usages: `rg -l 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/stories`
2. Replace each alias with its native-token equivalent per `docs/design-reference/alias-map.md`.
3. Run `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/stories` — must return zero.
4. Visual diff both dark and light themes.
5. Standard validation checklist.

Commit message must reference `plan:ink-and-paper-migration-cleanup` stage 5.

<!-- AC:BEGIN -->
- [ ] #1 rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/stories returns zero matches
- [ ] #2 All replacements follow docs/design-reference/alias-map.md
- [ ] #3 Visual QA passes in dark and light themes
- [ ] #4 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Landed in a613b49. Final quality-gate verified `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/stories` returns zero.
