---
id: TASK-003
title: >-
  Mechanical sweep: button types + trivial a11y fixes in Storybook/design-system
  code
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:22:41.285Z'
updatedAt: '2026-04-21T21:02:32.311Z'
---

## Description

Mechanical pass over Storybook stories and design-system demo components. Changes are deterministic and behavioral-impact-free:
- Add `type="button"` to all buttons lacking an explicit type.
- Replace invalid `href="#"` anchors in `Dashboard.tsx` with semantically correct alternatives (native buttons or meaningful hrefs).
- Add `<title>` elements to bare SVGs in `src/stories/Header.tsx` and `src/stories/Page.tsx`.
- Replace array-index keys in `Dashboard.tsx` with stable identifiers where a data field is available.
- Replace `[key: string]: any` in `Button.test.tsx` with explicit typed button props.

**Files in scope**: `src/design-system/templates/dashboard/Dashboard.tsx`, `src/design-system/organisms/navigation/Navigation.tsx`, `src/design-system/stories/ButtonTokens.stories.tsx`, `src/design-system/stories/CardTokens.stories.tsx`, `src/design-system/stories/ColorTokens.stories.tsx`, `src/design-system/stories/IconTokens.stories.tsx`, `src/design-system/stories/InputTokens.stories.tsx`, `src/design-system/stories/TypographyTokens.stories.tsx`, `src/design-system/tokens/atoms/button/Button.test.tsx`, `src/stories/Header.tsx`, `src/stories/Page.tsx`.

<!-- AC:BEGIN -->
- [ ] #1 All <button> elements in the listed files have an explicit type attribute.
- [ ] #2 Invalid href="#" anchors in Dashboard.tsx are replaced with semantically correct alternatives (e.g., native buttons or real href values).
- [ ] #3 SVG elements in src/stories/Header.tsx and src/stories/Page.tsx include a <title> child element for accessibility.
- [ ] #4 Array-index keys in Dashboard.tsx are replaced with stable identifiers sourced from the rendered data.
- [ ] #5 Button.test.tsx no longer uses [key: string]: any for button prop typing; props are explicitly typed.
- [ ] #6 npm run lint:all reports zero violations in the listed files after the change.
<!-- AC:END -->

## Implementation Notes

Implemented the scoped mechanical changes in all listed files: explicit button types, Dashboard anchor/key fixes, SVG titles, and typed Button.test props. Verified with `npx biome check` on the 11 scoped files (passes), `npm run test:run -- src/design-system/tokens/atoms/button/Button.test.tsx` (passes), and `npx tsc` (passes/no diagnostics). Blocked on QC-001 because `npm run lint:all` still fails on pre-existing repo-wide issues outside this task’s scope (e.g. src/design-system/tokens/atoms/input/filled-background.css, src/editor/RichTextEditor.tsx, multiple container feature files, vite.config.ts, vitest.config.ts, and missions/sessions/lint-baseline-cleanup/manifest.json). I did not expand scope to fix those unrelated baseline violations.
