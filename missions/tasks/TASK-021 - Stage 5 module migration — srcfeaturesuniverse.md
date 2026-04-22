---
id: TASK-021
title: Stage 5 module migration — src/features/universe
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-018
createdAt: '2026-04-22T20:30:31.235Z'
updatedAt: '2026-04-22T21:25:22.615Z'
---

## Description

Migrate all aliased token usages in `src/features/universe/` to native tokens.

**Work:**
1. Find all alias usages: `rg -l 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/universe`
2. Replace each alias with its native-token equivalent per `docs/design-reference/alias-map.md`.
3. Run `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/universe` — must return zero.
4. Visual diff both dark and light themes.
5. Standard validation checklist.

Commit message must reference `plan:ink-and-paper-migration-cleanup` stage 5.

<!-- AC:BEGIN -->
- [ ] #1 rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/universe returns zero matches
- [ ] #2 All replacements follow docs/design-reference/alias-map.md
- [ ] #3 Visual QA passes in dark and light themes
- [ ] #4 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Migrated `src/features/universe` Stage 5 alias-token usages to native Ink & Paper tokens in `src/features/universe/views/UniverseList.tsx`, `src/features/universe/views/UniverseSelection.css`, `src/features/universe/components/UniverseCard.css`, and `src/features/universe/components/CreateUniverseModal.css`.

Validation:
- `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/features/universe` → zero matches
- Dark/light visual QA passed via Playwright screenshots from `/tmp/task021-universe-qa.html`
- `npm run lint` ✅
- `npm run test:run` ✅
- `npm run build` ✅

Commit: `0733644` (`TASK-021: Stage 5 module migration — features/universe (plan:ink-and-paper-migration-cleanup)`)
