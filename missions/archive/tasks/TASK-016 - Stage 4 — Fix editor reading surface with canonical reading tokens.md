---
id: TASK-016
title: Stage 4 — Fix editor reading surface with canonical reading tokens
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-015
createdAt: '2026-04-22T20:29:46.726Z'
updatedAt: '2026-04-22T21:18:45.814Z'
---

## Description

The editor is broken in two ways: (1) it references undefined tokens (`--font-family-body`, `--line-height-body`, `--font-family-heading`, `--line-height-heading`) that don't exist in the design system — the editor silently falls back to UA defaults; (2) even the tokens it does use route through the UI chrome scale, not the reading scale.

**Files touched:**
- `src/editor/RichTextEditor.css`
- `src/features/stories/views/StoryEditor.css` (audit for conflicting overrides)
- `src/editor/RichTextEditor.tsx` (may need a wrapper element)

**Work:**
1. Replace all unsupported token names with canonical native tokens per `docs/design-reference/project/colors_and_type.css:132,144,173-174,251,375-378`:
   - Reading content area (`.editor-content`): `font-family: var(--font-display)`, `font-size: var(--fs-md)` (17px), `line-height: var(--lh-reading)` (1.7), `max-width: var(--layout-reading-w)` (720px), `width: 100%`, `margin: 0 auto`.
   - Headings (`.editor-heading-h1/h2/h3`): `font-family: var(--font-display)`, `line-height: var(--lh-tight)`.
   - Chrome (toolbar, status bar): keep on `var(--font-body)` (Geist).
2. If `.editor-content` is the Lexical `contenteditable` host (`RichTextEditor.tsx:83-94`) and can't be centered directly, introduce a `.editor-reading-column` wrapper inside `.editor-container` and apply `max-width` + `margin: 0 auto` there.
3. Swap `::selection` to use `var(--selection)` directly (not through alias).
4. Audit `src/features/stories/views/StoryEditor.css` for conflicting overrides and resolve them.
5. Include dark + light screenshots in the PR.

Commit message should cite `docs/design-reference/project/colors_and_type.css:132,144,173-174,251` and `plan:ink-and-paper-migration-cleanup` stage 4.

<!-- AC:BEGIN -->
- [ ] #1 rg -n '--font-family-body|--font-family-heading|--line-height-body|--line-height-heading' src returns zero matches
- [ ] #2 Editor reading surface renders in Newsreader at 17px / line-height 1.7 / centered 720px column
- [ ] #3 Editor headings use var(--font-display) + var(--lh-tight)
- [ ] #4 UI chrome (toolbar, status bar) stays on var(--font-body) (Geist)
- [ ] #5 ::selection uses var(--selection) directly
- [ ] #6 Editor renders correctly in both dark and light themes
- [ ] #7 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Implemented Stage 4 in `src/editor/RichTextEditor.tsx`, `src/editor/RichTextEditor.css`, and `src/features/stories/views/StoryEditor.css`. Added `.editor-reading-column` so the Lexical host and placeholder share a centered 720px reading column; moved the reading surface to `var(--font-display)` / `var(--fs-md)` / `var(--lh-reading)`; moved editor headings to `var(--font-display)` + `var(--lh-tight)`; kept chrome on `var(--font-body)`; and changed editor selection to `var(--selection)` directly. Verified dark/light visually with a temporary static harness screenshot at `/tmp/task-016-visual-check.png` plus computed-style checks for both themes. Validation run: `npm run lint` (passes with pre-existing Biome ignore-folder warnings in `biome.json`), `npm run test:run`, and `npm run build`. Commit: `7f82496`.
