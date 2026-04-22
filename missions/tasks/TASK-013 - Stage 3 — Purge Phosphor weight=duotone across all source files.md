---
id: TASK-013
title: Stage 3 — Purge Phosphor weight="duotone" across all source files
status: Done
priority: high
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies: []
createdAt: '2026-04-22T20:29:06.096Z'
updatedAt: '2026-04-22T20:35:53.929Z'
---

## Description

The Ink & Paper spec requires flat/regular weight icons. TopBar is already fixed; ~30 files (~94 occurrences) still pass `weight="duotone"`. Remove them all in a single scripted sweep.

**Files touched:** ~30 files under `src/` containing `weight="duotone"`.

**Work:**
1. Find all occurrences: `rg -l 'weight="duotone"' src`
2. Strip the prop from all default-state icons — Phosphor's default weight is `regular` so just remove the prop.
3. Keep `weight="fill"` only on selected/active-state icons per the design system (favorites, completed checkmarks).
4. Confirm empty-state hero icons (48px / 40% opacity) are using flat weight, not duotone.
5. Run `rg 'weight="duotone"' src` to verify zero matches before committing.

**Approach:** one scripted sweep with `rg` + `sed`, then visual diff review.

Commit message should cite the design-reference iconography section and `plan:ink-and-paper-migration-cleanup` stage 3.

<!-- AC:BEGIN -->
- [ ] #1 rg 'weight="duotone"' src returns zero matches (or only explicitly-commented exceptions)
- [ ] #2 weight="fill" is preserved only on selected/active-state icons per the Ink & Paper iconography spec
- [ ] #3 Empty-state hero icons use flat/regular weight
- [ ] #4 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

All duotone removals complete (commit 3e60ada). AC #1–#3 fully satisfied. AC #4 lint caveat: pre-existing Biome errors in docs/design-reference/project/preview/ HTML files (outside src/ scope, not introduced by this task) prevent a clean lint run. tests and build pass. Pre-existing lint issue tracked separately.
