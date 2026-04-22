---
id: TASK-019
title: Stage 5 module migration — src/shared + src/App.css + src/editor
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-018
createdAt: '2026-04-22T20:30:20.202Z'
updatedAt: '2026-04-22T21:22:51.675Z'
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

## Implementation Notes

Completed alias migration in `src/shared`; `src/App.css` already had zero alias usages and `src/editor` is already native-token clean in this worktree. Verified `rg -n 'var\(--(color|typography|font-family|font-size|line-height|font-weight)-' src/shared src/App.css src/editor` returns zero matches. Replacements follow `docs/design-reference/alias-map.md` (notably `--color-*` → native color tokens, `--typography-*`/`--font-size-*`/`--font-weight-*` → `--font-*`, `--type-*`, `--fs-*`, `--fw-*`). Manual dark/light QA used Playwright previews for the editor surface, confirmation/delete modals, toasts, and ErrorBoundary fallback; surfaces, contrast, and semantic accent colors matched in both themes with no visible regression. Validation passed: `npm run lint`, `npm run test:run`, `npm run build`. Commit: `c567741` / `TASK-019: Stage 5 module migration — src/shared + src/App.css + src/editor (plan:ink-and-paper-migration-cleanup)`.
