---
id: TASK-004
title: Fix LRUCache iterable-return warning and CSS descending-specificity violation
status: Done
priority: low
assignee: worker
labels:
  - frontend
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:22:47.517Z'
updatedAt: '2026-04-21T21:02:32.311Z'
---

## Description

Two isolated, deterministic mechanical fixes with no behavioral impact:
1. Fix the iterable callback return warning in `src/shared/utils/LRUCache.ts:178` — the fix is in-place (not suppressed).
2. Fix the `noDescendingSpecificity` CSS rule violation in `src/editor/RichTextEditor.css` — rewrite the conflicting selectors so specificity is non-descending rather than silencing the rule.

**Files in scope**: `src/shared/utils/LRUCache.ts`, `src/editor/RichTextEditor.css`.

<!-- AC:BEGIN -->
- [ ] #1 LRUCache.ts no longer triggers a Biome iterable-callback-return (or equivalent) lint warning; the fix is a code change, not a suppression.
- [ ] #2 RichTextEditor.css no longer triggers a noDescendingSpecificity lint error; the fix is a selector rewrite in-place, not a suppression.
- [ ] #3 npm run lint:all reports no violations for either file.
- [ ] #4 npm run test:run passes with no regressions.
<!-- AC:END -->

## Implementation Notes

Implemented the requested in-scope fixes: src/shared/utils/LRUCache.ts:178 now uses a block-bodied forEach callback so it no longer returns the result of Map.delete(), and src/editor/RichTextEditor.css now relies on the existing .editor-content[contenteditable="false"] rule by removing the redundant .rich-text-editor.read-only .editor-content selector. Verification: `npx biome check src/shared/utils/LRUCache.ts src/editor/RichTextEditor.css` passes and `npm run test:run` passes. Blocked on QC-001 / AC#3 because `npm run lint:all` does not exit 0 due unrelated existing repo violations outside this task’s scope, including button-type errors in src/design-system/stories/ButtonTokens.stories.tsx and src/design-system/stories/ColorTokens.stories.tsx plus organizeImports in vite.config.ts and vitest.config.ts.
