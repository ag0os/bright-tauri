---
id: TASK-007
title: >-
  Composite surfaces a11y: keyboard roles for ContainerCard, StoryCard,
  ElementCard, container child rows
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - a11y
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:23:22.058Z'
updatedAt: '2026-04-21T21:02:32.311Z'
---

## Description

Add keyboard accessibility to composite interactive surfaces that contain nested action buttons. Converting the wrapper to a native `<button>` would produce invalid nested-button markup (D-002), so instead add `role`, `tabIndex`, and `onKeyDown`/`onKeyUp` handlers to the existing div wrapper.

Surfaces to fix:
- `ContainerCard.tsx` — wrapper div + nested action buttons at `:97`
- `StoryCard.tsx` — wrapper div + nested action buttons at `:122`
- `ElementCard.tsx` — wrapper div + nested action buttons at `:121`; replace any array-index keys with stable identifiers
- `ContainerView.tsx` / `ContainerChildrenView.tsx` — clickable row semantics; remove redundant click-stopper wrappers superseded by child-button event propagation stops
- `ElementDetailPage.tsx` — replace array-index keys with stable identifiers; add missing explicit button types

**Files in scope**: `src/features/containers/components/ContainerCard.tsx`, `src/features/stories/components/StoryCard.tsx`, `src/features/elements/components/ElementCard.tsx`, `src/features/containers/views/ContainerView.tsx`, `src/features/containers/views/ContainerChildrenView.tsx`, `src/features/elements/views/ElementDetailPage.tsx`.

<!-- AC:BEGIN -->
- [ ] #1 ContainerCard, StoryCard, and ElementCard wrapper elements are keyboard-reachable (tabIndex=0, appropriate role, onKeyDown Enter/Space activation) without a <button> nested inside another <button> (QC-005).
- [ ] #2 Existing nested action buttons within each card remain native <button> elements with explicit type attributes and are independently focusable and operable.
- [ ] #3 Clickable row elements in ContainerView and ContainerChildrenView have equivalent keyboard semantics; redundant click-stopper wrapper divs superseded by child-button event.stopPropagation() are removed.
- [ ] #4 Array-index keys in ElementCard and ElementDetailPage are replaced with stable identifiers from the rendered data.
- [ ] #5 All <button> elements in ElementDetailPage have explicit type attributes.
- [ ] #6 npm run lint:all reports no a11y, key-index, or button-type violations in the listed files.
- [ ] #7 npm run test:run passes with no regressions.
<!-- AC:END -->

## Implementation Notes

Implemented the requested card/row accessibility changes in scope and verified the six scoped files pass `npx biome check`: `src/features/containers/components/ContainerCard.tsx`, `src/features/stories/components/StoryCard.tsx`, `src/features/elements/components/ElementCard.tsx`, `src/features/containers/views/ContainerView.tsx`, `src/features/containers/views/ContainerChildrenView.tsx`, and `src/features/elements/views/ElementDetailPage.tsx`.

`npm run test:run` passes (244/244).

`npm run lint:all` still fails due pre-existing out-of-scope frontend lint issues elsewhere in the repo before Rust lint runs, including: `src/design-system/tokens/atoms/input/filled-background.css`, `src/features/containers/components/CreateContainerModal.tsx`, `src/features/elements/components/CreateElementModal.tsx`, `src/features/elements/components/EditElementModal.tsx`, `src/features/stories/components/CreateStoryModal.tsx`, `src/features/stories/views/StoriesList.tsx`, `src/features/stories/views/StoryEditor.tsx`, `src/features/stories/views/StoryVersions.tsx`, `src/features/stories/hooks/useAutoSave.ts`, `src/features/stories/hooks/useAutoSave.test.ts`, `vite.config.ts`, `vitest.config.ts`, and `missions/sessions/lint-baseline-cleanup/manifest.json`.

No commit was created because QC-001 (`npm run lint:all`) could not be satisfied within this task's scope.
