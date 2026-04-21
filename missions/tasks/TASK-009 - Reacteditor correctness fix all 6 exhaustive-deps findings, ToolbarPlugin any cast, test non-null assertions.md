---
id: TASK-009
title: >-
  React/editor correctness: fix all 6 exhaustive-deps findings, ToolbarPlugin
  any cast, test non-null assertions
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - testing
  - 'plan:lint-baseline-cleanup'
dependencies:
  - TASK-002
  - TASK-008
createdAt: '2026-04-21T20:23:49.511Z'
updatedAt: '2026-04-21T21:02:32.310Z'
---

## Description

Review and fix all six `useExhaustiveDependencies` findings in the editor/story area. **This is the highest-risk frontend task** — blind dependency changes risk remount loops, stale closures, and duplicate snapshot writes.

The `StoryEditor` contract must be preserved throughout:
- `getStory` loads story data once per story/route change
- Loaded content is passed as `initialContent` to `RichTextEditor` (intentionally latched once; only remounts on `readOnly` changes per `src/editor/RichTextEditor.tsx:41-50`)
- `useAutoSave` provides debounced content writes
- `useAutoSnapshot` fires only when baseline/trigger rules are satisfied — NOT on every render

Use the existing tests at `StoryEditor.test.tsx`, `StoryVersions.test.tsx`, and `useAutoSnapshot.test.ts` as the regression harness. Extend them if the hook-dep changes require new assertions.

Also in scope: replace the `any` cast in `ToolbarPlugin.tsx:58` with proper Lexical types, and remove non-null assertions in `StoryEditor.test.tsx:309, :393`.

**Files in scope**: `src/features/stories/views/StoryEditor.tsx`, `src/editor/RichTextEditor.tsx`, `src/editor/plugins/ToolbarPlugin.tsx`, `src/features/stories/views/StoryEditor.test.tsx`, `src/features/stories/views/StoryVersions.test.tsx`, `src/features/stories/hooks/useAutoSnapshot.test.ts`.

<!-- AC:BEGIN -->
- [ ] #1 All six useExhaustiveDependencies findings in the editor/story files are resolved with no remaining Biome hook-dep violations.
- [ ] #2 The StoryEditor contract is preserved: story data loads once per story/route change; RichTextEditor does not remount on content changes; useAutoSnapshot does not fire on every render (QC-004).
- [ ] #3 ToolbarPlugin.tsx no longer uses any casts; Lexical-specific types are used instead.
- [ ] #4 Non-null assertions in StoryEditor.test.tsx are replaced with type-safe alternatives that keep the same test assertions.
- [ ] #5 npm run test:run -- StoryEditor.test.tsx StoryVersions.test.tsx useAutoSnapshot.test.ts passes (QC-004).
- [ ] #6 npm run lint:all reports no violations in the listed files (QC-001).
<!-- AC:END -->

## Implementation Notes

Implemented the scoped code/test changes: resolved remaining editor/story `useExhaustiveDependencies` findings in `src/editor/RichTextEditor.tsx`, `src/features/stories/views/StoryEditor.tsx`, `src/features/stories/hooks/useAutoSave.ts`, and `src/features/stories/views/StoryHistory.tsx`; replaced `ToolbarPlugin` any casts with Lexical type guards; removed the two non-null assertions in `src/features/stories/views/StoryEditor.test.tsx`; added regression coverage that StoryEditor loads once / does not remount on content changes and that `useAutoSnapshot` does not fire on rerenders without content growth. Verification passed: `npm run test:run -- src/features/stories/views/StoryEditor.test.tsx src/features/stories/views/StoryVersions.test.tsx src/features/stories/hooks/useAutoSnapshot.test.ts`, extra touched-file checks (`useAutoSave.test.ts`, `StoryHistory.test.tsx`), and full `npm run test:run`. Blocker: required `npm run lint:all` still fails on unrelated pre-existing repo issues outside TASK-009 scope: `src/design-system/tokens/atoms/input/filled-background.css` descending-specificity, `src/features/stories/hooks/useAutoSave.test.ts` non-null assertion, `src/features/stories/views/StoriesList.tsx` modal a11y violations, `vite.config.ts` / `vitest.config.ts` import ordering, and `missions/sessions/lint-baseline-cleanup/manifest.json` formatting. The TASK-009 files changed here are clean under targeted Biome checks, but QC-001 cannot be satisfied until those external baseline issues are cleared.
