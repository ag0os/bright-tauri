---
id: TASK-019
title: Stage 5 module migration — src/shared + src/App.css + src/editor
status: To Do
priority: medium
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-018
createdAt: '2026-04-22T20:30:20.202Z'
updatedAt: '2026-04-22T20:30:20.202Z'
---

## Description

Migrate all aliased token usages in `src/shared/`, `src/App.css`, and `src/editor/` to native tokens. `src/editor/` was already partially cleaned in Stage 4 (undefined tokens removed); this task finishes any remaining alias usages.

**Work:**
1. Find all alias usages: `rg -l 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/shared src/App.css src/editor`
2. Replace each alias with its native-token equivalent per `docs/design-reference/alias-map.md`.
3. Run `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/shared src/App.css src/editor` — must return zero.
4. Visual diff both dark and light themes before committing.
5. Standard validation checklist.

Commit message must reference `plan:ink-and-paper-migration-cleanup` stage 5 and list the directories migrated.

<!-- AC:BEGIN -->
- [ ] #1 rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/shared src/App.css src/editor returns zero matches
- [ ] #2 All replacements follow docs/design-reference/alias-map.md — no native token invented outside the map
- [ ] #3 App renders correctly in both dark and light themes with no visual regression
- [ ] #4 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->
