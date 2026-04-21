---
id: TASK-002
title: 'Button-type sweep: add explicit `type` attributes to non-modal app buttons'
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:22:31.907Z'
updatedAt: '2026-04-21T21:02:32.311Z'
---

## Description

Mechanical pass over non-modal, non-card app components to add `type="button"` to every `<button>` that lacks an explicit type attribute. Form submit buttons already identified in the codebase (CreateStoryModal, CreateContainerModal, CreateElementModal) keep `type="submit"`. No semantic, behavioral, or hook changes in this task — that is scope for later tasks.

**Files in scope**: `src/shared/components/TopBar.tsx`, `src/shared/components/Toast.tsx`, `src/shared/components/ErrorBoundary.tsx`, `src/features/universe/views/UniverseList.tsx`, `src/features/stories/views/StoryHistory.tsx`, `src/features/stories/views/StoryCompare.tsx`, `src/features/stories/views/StoriesList.tsx`, `src/features/stories/views/StorySettings.tsx`, `src/features/containers/views/ContainerSettings.tsx`, `src/features/stories/views/StoryEditor.tsx` (button-type attributes only — no hook or semantic changes).

<!-- AC:BEGIN -->
- [ ] #1 Every <button> element in the listed files has an explicit type attribute ("button" or "submit"); no button is left without one.
- [ ] #2 Existing form submit buttons (type="submit") are not changed to type="button".
- [ ] #3 npm run lint:all reports zero useButtonType (or equivalent Biome) violations in the listed files.
- [ ] #4 npm run test:run passes with no regressions.
- [ ] #5 No semantic, a11y, or hook-dependency changes are made in this task — only type attribute additions.
<!-- AC:END -->

## Implementation Notes

Added explicit type="button" across the scoped files only and preserved existing type="submit" form actions. Verification: `npx biome check --only=lint/a11y/useButtonType <scoped files>` passes cleanly, and `npm run test:run` passes (242 tests). Blocker: required `npm run lint:all` does not pass because of pre-existing out-of-scope baseline errors in design-system files (for example `src/design-system/organisms/navigation/Navigation.tsx`, `src/design-system/stories/ButtonTokens.stories.tsx`, `src/design-system/stories/ColorTokens.stories.tsx`) plus existing non-button lint findings already present in scoped files (`src/features/stories/views/StoriesList.tsx` static-element modal interactions, `src/features/stories/views/StoryEditor.tsx` autofocus/exhaustive-deps, `src/features/stories/views/StoryHistory.tsx` exhaustive-deps). Those changes are outside TASK-002's mechanical button-type-only scope.
