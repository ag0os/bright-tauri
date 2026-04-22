---
id: TASK-027
title: Stage 5 final — Delete alias block from token files + add rg CI guard
status: To Do
priority: high
labels:
  - frontend
  - devops
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-019
  - TASK-020
  - TASK-021
  - TASK-022
  - TASK-023
  - TASK-024
  - TASK-025
  - TASK-026
createdAt: '2026-04-22T20:31:05.315Z'
updatedAt: '2026-04-22T20:31:05.315Z'
---

## Description

Once all modules are migrated and the global grep returns zero, remove the alias sections from the token files and add a CI guard so aliases can never be reintroduced.

**This task must not start until TASK-019 through TASK-026 are all Done and `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src` returns zero.**

**Files touched:**
- `src/design-system/tokens/colors/ink-and-paper.css` (delete alias block)
- `src/design-system/tokens/typography/newsreader-geist.css` (delete alias block)
- `package.json` (add `lint:tokens` script or extend `lint`)

**Work:**
1. Pre-flight: run `rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src` — must return zero. Do not proceed if it doesn't.
2. Remove the alias sections from `ink-and-paper.css` and `newsreader-geist.css` (the blocks marked with the freeze comment from Stage 5 prep).
3. Add a CI guard to `package.json` `lint` script (or a new `lint:tokens` entry):
   `! rg -q 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src`
   This causes the lint step to fail if anyone reintroduces an aliased token.
4. Verify the app still renders correctly after alias removal — the tokens they mapped to must have been present as native tokens all along.
5. Full validation checklist on the post-deletion state.

**Risk:** This is the only high-stakes step. Do it in its own commit. Include full dark + light screenshots.

<!-- AC:BEGIN -->
- [ ] #1 rg 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src returns zero across the entire codebase
- [ ] #2 Alias blocks removed from ink-and-paper.css and newsreader-geist.css
- [ ] #3 package.json lint or lint:tokens script includes the rg guard that fails on any reintroduced alias
- [ ] #4 App renders correctly in both dark and light themes after alias removal
- [ ] #5 npm run lint, npm run test:run, and npm run build all pass on the post-deletion state
<!-- AC:END -->
