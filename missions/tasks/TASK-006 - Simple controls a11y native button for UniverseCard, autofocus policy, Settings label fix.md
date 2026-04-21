---
id: TASK-006
title: >-
  Simple controls a11y: native button for UniverseCard, autofocus policy,
  Settings label fix
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - a11y
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:23:09.945Z'
updatedAt: '2026-04-21T21:02:32.310Z'
---

## Description

Three focused a11y fixes for simple controls (no nested interactive descendants):

1. **UniverseCard** (`src/features/universe/components/UniverseCard.tsx:27`): Convert from a div-based faux-button to a native `<button type="button">`. It has no nested action buttons so this is valid per D-002.

2. **UniverseSelection autofocus** (`src/features/universe/views/UniverseSelection.tsx:145`): Remove `autoFocus` from the empty-state "create universe" CTA button per the approved split autofocus policy. Verify that keyboard-event effect dependencies around `handleSelectUniverse`/`handleOpenCreateModal` remain stable after the change.

3. **Settings label** (`src/features/settings/views/Settings.tsx`): Programmatically associate the "Snapshot trigger" label with its control via `htmlFor`/`id`. Add any missing explicit `type` attributes to buttons in this file.

**Files in scope**: `src/features/universe/components/UniverseCard.tsx`, `src/features/universe/views/UniverseSelection.tsx`, `src/features/settings/views/Settings.tsx`.

<!-- AC:BEGIN -->
- [ ] #1 UniverseCard is implemented as a native <button type="button"> element; it is keyboard-focusable and activatable via Enter/Space without any role/tabIndex workaround.
- [ ] #2 The empty-state "create universe" CTA in UniverseSelection.tsx does not have autoFocus; the create-universe modal's name input field retains autoFocus for intentional text-entry (approved split policy, QC-006).
- [ ] #3 The "Snapshot trigger" label in Settings.tsx is programmatically associated with its control (htmlFor matches the control's id or equivalent).
- [ ] #4 All <button> elements in Settings.tsx have explicit type attributes.
- [ ] #5 npm run lint:all reports no a11y, button-type, or label-association violations in the listed files.
- [ ] #6 npm run test:run passes with no regressions.
<!-- AC:END -->

## Implementation Notes

Implemented AC #1-#4 in scope: UniverseCard now uses a native <button type="button">, UniverseSelection removed empty-state CTA autoFocus, added explicit button types, and stabilized the keyboard-navigation effect with useCallback dependencies; Settings now associates the Snapshot trigger group via aria-labelledby and all buttons there have explicit types. Verification: file-scoped Biome check passes for the 3 in-scope files; npm run test:run passed (242 tests); npx tsc passed. Blocker: QC-001 cannot be satisfied because npm run lint:all still fails on pre-existing out-of-scope repo issues, including frontend button-type/import-order errors in src/design-system/stories/ButtonTokens.stories.tsx, src/design-system/stories/CardTokens.stories.tsx, vite.config.ts, vitest.config.ts, plus many more diagnostics, and npm run lint:rust fails on existing ts-rs/clippy/dead_code findings in src-tauri (for example src/models/mod.rs, src/models/story_version.rs, src/services/story_version_service.rs, src/repositories/container.rs, src/repositories/story.rs, src/file_naming.rs). No commit created because the required full lint baseline is not currently achievable within this task’s scope.
