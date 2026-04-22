---
id: TASK-017
title: 'Stage 6B — Sync ui-navigation.md, delete roadmap.md, run final sweep'
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-013
  - TASK-014
  - TASK-015
createdAt: '2026-04-22T20:29:58.179Z'
updatedAt: '2026-04-22T21:17:45.974Z'
---

## Description

Complete the documentation cleanup: sync the design-system references in `docs/ui-navigation.md`, delete the stale roadmap, and run the final `rg` sweep to confirm no Modern Indigo / Classic Serif / Playfair / purple gradient references remain in active files.

**Files touched:**
- `docs/ui-navigation.md` (update design-system section only)
- `docs/ideas/roadmap.md` (delete)
- `AGENTS.md` (remove roadmap.md from Key docs list)
- Any file that cross-links to `docs/ideas/roadmap.md`

**Work:**
1. Update `docs/ui-navigation.md` lines 555-565 and any similar block: replace "Modern Indigo / Classic Serif / Lucide" with "Ink & Paper / Newsreader + Geist / Phosphor regular weight". Use `rg -n 'Modern Indigo|Classic Serif|Lucide|Playfair' docs/ui-navigation.md` to find all spots. Leave every UX/navigation idea untouched.
2. Before deleting roadmap: `rg -n 'ideas/roadmap' .` to find all cross-links. Remove them.
3. Delete `docs/ideas/roadmap.md`.
4. Remove the `docs/ideas/roadmap.md` line from `AGENTS.md` "Key docs" list.
5. Final sweep: `rg -i 'modern indigo|classic serif|playfair|purple gradient' .` — confirm zero matches in active files; only historical/archive references (e.g., `docs/decisions/`) are acceptable.

<!-- AC:BEGIN -->
- [ ] #1 docs/ui-navigation.md Design System Integration section cites Ink & Paper / Newsreader + Geist / Phosphor regular weight; all UX content is untouched
- [ ] #2 docs/ideas/roadmap.md is deleted
- [ ] #3 No file in the repo links to docs/ideas/roadmap.md
- [ ] #4 docs/ideas/roadmap.md entry removed from AGENTS.md Key docs list
- [ ] #5 rg -i 'modern indigo|classic serif|playfair|purple gradient' . returns zero matches in active source and docs files (historical/archive refs only)
- [ ] #6 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Committed as 61e1a26. Updated `docs/ui-navigation.md` design-system wording, removed active roadmap links from `AGENTS.md`, deleted `docs/ideas/roadmap.md`, and cleaned remaining active sweep hits in `docs/ideas/universe-selection-ui.md`, `src/shared/components/ConfirmationModal.css`, `docs/design-reference/project/README.md`, `docs/design-reference/project/colors_and_type.css`, `design-system-state.json`, `docs/plans/ink-and-paper-migration-cleanup.md`, and `missions/plans/ink-and-paper-migration-cleanup/plan.md`. Validation passed: `npm run lint` (Biome warnings only in ignore-pattern config, exit 0), `npm run test:run`, `npm run build`. Final `rg -i 'modern indigo|classic serif|playfair|purple gradient' .` and `rg -n 'ideas/roadmap' .` now only hit historical task files under `missions/tasks/`; active source/docs are clean.
