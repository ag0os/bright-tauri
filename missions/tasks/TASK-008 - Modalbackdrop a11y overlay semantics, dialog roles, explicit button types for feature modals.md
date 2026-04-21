---
id: TASK-008
title: >-
  Modal/backdrop a11y: overlay semantics, dialog roles, explicit button types
  for feature modals
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - a11y
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:23:35.764Z'
updatedAt: '2026-04-21T21:02:32.311Z'
---

## Description

Align feature modals with the accessible dialog pattern already established in `src/shared/components/ConfirmationModal.tsx:131-141` (D-003). Do NOT introduce a new shared modal abstraction — follow the existing pattern in each modal independently.

Changes per file:
- **ConfirmDeleteModal.tsx**: add dialog semantics, align overlay with target-check pattern, add explicit button types.
- **CreateUniverseModal.tsx** (`:68-69`): overlay target-check pattern, explicit button types; name-input autoFocus retained.
- **CreateStoryModal.tsx**: overlay target-check, explicit button types.
- **CreateContainerModal.tsx**: overlay target-check, explicit button types.
- **CreateElementModal.tsx** (`:48`): replace `any` cast with explicit element-type prop typing; overlay semantics; explicit button types.
- **EditElementModal.tsx** (`:48`): replace `any` cast with explicit typing; overlay semantics; explicit button types.
- **StoryVersions.tsx** (`:256-257`): fix modal overlay semantics; rename/create name-input fields retain autoFocus per approved policy.

**Files in scope**: `src/shared/components/ConfirmDeleteModal.tsx`, `src/features/universe/components/CreateUniverseModal.tsx`, `src/features/stories/components/CreateStoryModal.tsx`, `src/features/containers/components/CreateContainerModal.tsx`, `src/features/elements/components/CreateElementModal.tsx`, `src/features/elements/components/EditElementModal.tsx`, `src/features/stories/views/StoryVersions.tsx`, `src/shared/components/ConfirmationModal.tsx` (adjust only if needed).

<!-- AC:BEGIN -->
- [ ] #1 Each modal uses an overlay target-check pattern so clicking outside modal content dismisses it and clicking inside does not, replacing bare static-element click-stopper handlers.
- [ ] #2 Each modal has appropriate dialog semantics (role="dialog" with accessible label, or native <dialog>) consistent with the ConfirmationModal.tsx:131-141 reference pattern.
- [ ] #3 All <button> elements in the listed files have explicit type attributes.
- [ ] #4 CreateElementModal and EditElementModal no longer use any casts for element-type props; explicit TypeScript types are used instead.
- [ ] #5 Rename/create name-input fields in StoryVersions.tsx retain autoFocus; no new autoFocus is added to non-text-entry buttons or surfaces (QC-006).
- [ ] #6 No new shared modal abstraction is introduced; each modal aligns with the ConfirmationModal pattern independently (D-003).
- [ ] #7 npm run lint:all reports no violations in the listed files and npm run test:run passes including StoryVersions.test.tsx.
<!-- AC:END -->

## Implementation Notes

Implemented the scoped modal/backdrop changes: target-check backdrop dismissal, dialog semantics, explicit button types, ConfirmationModal pattern alignment, and explicit ElementType-based typing in Create/EditElementModal. Verified the touched files with `npx biome check` and `npm run test:run -- src/shared/components/ConfirmationModal.test.tsx src/features/stories/views/StoryVersions.test.tsx`; full `npm run test:run` also passes. Blocking on QC-001 because `npm run lint:all` still fails on unrelated pre-existing baseline issues outside this task’s scope: `src/design-system/tokens/atoms/input/filled-background.css:191`, `src/features/stories/hooks/useAutoSave.test.ts:172`, `src/features/stories/views/StoriesList.tsx:470`, `src/features/stories/views/StoryEditor.tsx:240`, `vite.config.ts:1`, `vitest.config.ts:1`, and `missions/sessions/lint-baseline-cleanup/manifest.json` formatting.
