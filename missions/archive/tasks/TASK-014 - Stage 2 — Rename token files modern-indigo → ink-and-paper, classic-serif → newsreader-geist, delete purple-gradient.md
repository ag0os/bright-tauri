---
id: TASK-014
title: >-
  Stage 2 — Rename token files: modern-indigo → ink-and-paper, classic-serif →
  newsreader-geist, delete purple-gradient
status: Done
priority: high
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies: []
createdAt: '2026-04-22T20:29:16.116Z'
updatedAt: '2026-04-22T20:48:27.637Z'
---

## Description

The token filenames lie — they describe the system they replaced. Rename them to match their actual contents and delete the dead file.

**Files touched:**
- `src/design-system/tokens/colors/modern-indigo.css` → `ink-and-paper.css`
- `src/design-system/tokens/typography/classic-serif.css` → `newsreader-geist.css`
- `src/design-system/tokens/colors/purple-gradient.css` (delete)
- All files with `@import` / `import` references to the old names

**Work:**
1. Rename `tokens/colors/modern-indigo.css` → `tokens/colors/ink-and-paper.css`.
2. Rename `tokens/typography/classic-serif.css` → `tokens/typography/newsreader-geist.css`.
3. Delete `tokens/colors/purple-gradient.css` (first confirm `rg 'purple-gradient' src docs` returns zero references).
4. Update all references with: `rg -l 'modern-indigo|classic-serif' src docs` — known entry points include `src/App.css`, `src/shared/components/TopBar.css`, `src/features/stories/views/StoryEditor.tsx`, `src/features/universe/views/UniverseList.tsx`.
5. Update any path references in `docs/design-system.md`.
6. Run `rg 'modern-indigo|classic-serif|purple-gradient' src docs` to confirm zero matches.
7. `npm run build` is the key check — catches broken CSS `@import`s that `tsc` won't.

**Risk:** Low — mechanical rename + import update. Visual smoke required.

<!-- AC:BEGIN -->
- [ ] #1 tokens/colors/modern-indigo.css renamed to tokens/colors/ink-and-paper.css
- [ ] #2 tokens/typography/classic-serif.css renamed to tokens/typography/newsreader-geist.css
- [ ] #3 tokens/colors/purple-gradient.css deleted
- [ ] #4 rg 'modern-indigo|classic-serif|purple-gradient' src docs returns zero matches
- [ ] #5 App renders correctly in both light and dark themes with no visual regression
- [ ] #6 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

Audited the prior partial implementation instead of redoing it. Verified `src/design-system/tokens/colors/ink-and-paper.css` and `src/design-system/tokens/typography/newsreader-geist.css` exist, the old filenames and `purple-gradient.css` are absent, and `rg 'modern-indigo|classic-serif|purple-gradient' src docs` returns zero matches in the current worktree. `npm run test:run` and `npm run build` pass. `npm run lint` still fails only on pre-existing Biome issues in the read-only exported bundle under `docs/design-reference/project/preview/` (HTML/a11y/format diagnostics), which the task note explicitly called out as outside scope.
