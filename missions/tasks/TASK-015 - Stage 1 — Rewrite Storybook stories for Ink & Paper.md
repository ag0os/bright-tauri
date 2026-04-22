---
id: TASK-015
title: Stage 1 — Rewrite Storybook stories for Ink & Paper
status: Done
priority: medium
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies:
  - TASK-012
  - TASK-014
createdAt: '2026-04-22T20:29:31.197Z'
updatedAt: '2026-04-22T21:09:13.872Z'
---

## Description

Every token story is titled against Modern Indigo / Classic Serif. Rewrite copy, add a landing story, and add native-token stories so Storybook reflects the actual system.

**Files touched:**
- `src/design-system/stories/ColorTokens.stories.tsx`
- `src/design-system/stories/TypographyTokens.stories.tsx`
- `src/design-system/stories/ButtonTokens.stories.tsx`
- `src/design-system/stories/InputTokens.stories.tsx`
- `src/design-system/stories/CardTokens.stories.tsx`
- `src/design-system/stories/IconTokens.stories.tsx`
- `src/design-system/organisms/navigation/Navigation.stories.tsx`
- `src/design-system/templates/dashboard/Dashboard.tsx`, `Dashboard.stories.tsx`, `stats-grid.css`
- `src/design-system/stories/Introduction.mdx` (create)

**Work:**
1. Rewrite copy in each story: titles ("Ink & Paper colors", "Newsreader + Geist", "Marigold buttons"), descriptions, and any example text referencing indigo / Playfair / 4px radius.
2. Add a landing story at `src/design-system/stories/Introduction.mdx` covering: the system is Ink & Paper, two theme modes, token layering (native tokens authoritative; aliases exist during migration and are being retired — see Stage 5), links to `docs/design-system.md` and `docs/design-reference/`.
3. Add stories exercising native tokens (`--fg1`, `--accent`, `--bg`, `--surface`, `--fs-*`, `--lh-reading`, `--radius-*`) alongside existing aliased stories — makes the two layers visible side by side.
4. Compare each story card against `docs/design-reference/project/preview/` HTML.
5. Run `rg -i 'modern indigo|classic serif|playfair' src/design-system` to confirm zero matches.

This task also picks up the remaining Stage 6 doc item: native-token guidance that was deferred from Stage 6A to land here per the plan's suggested ordering.

Acceptance Criteria:
  [x] #1 Every token story (ColorTokens, TypographyTokens, ButtonTokens, InputTokens, CardTokens, IconTokens) title and copy reference Ink & Paper, not Modern Indigo or Classic Serif
  [x] #2 src/design-system/stories/Introduction.mdx exists explaining the Ink & Paper system, two theme modes, token layering, alias-retirement status, and links to docs/design-system.md and docs/design-reference/
  [x] #3 Native token stories exist demonstrating --fg1, --accent, --bg, --fs-*, --lh-reading, and --radius-* alongside existing stories
  [x] #4 rg -i 'modern indigo|classic serif|playfair' src/design-system returns zero matches
  [x] #5 npm run lint, npm run test:run, npm run build, and Storybook manual smoke all pass

<!-- AC:BEGIN -->
- [ ] #1 Every token story (ColorTokens, TypographyTokens, ButtonTokens, InputTokens, CardTokens, IconTokens) title and copy reference Ink & Paper, not Modern Indigo or Classic Serif
- [ ] #2 src/design-system/stories/Introduction.mdx exists explaining the Ink & Paper system, two theme modes, token layering, alias-retirement status, and links to docs/design-system.md and docs/design-reference/
- [ ] #3 Native token stories exist demonstrating --fg1, --accent, --bg, --fs-*, --lh-reading, and --radius-* alongside existing stories
- [ ] #4 rg -i 'modern indigo|classic serif|playfair' src/design-system returns zero matches
- [ ] #5 npm run lint, npm run test:run, npm run build, and Storybook manual smoke all pass
<!-- AC:END -->

## Implementation Notes

Verified TASK-015 is already implemented in HEAD at commit 5f9c54d ("TASK-015: Rewrite Ink & Paper Storybook stories"); no additional code diff was needed. Confirmed: Introduction.mdx exists; token stories and Navigation/Dashboard docs use Ink & Paper copy; native token stories are present; rg -i 'modern indigo|classic serif|playfair' src/design-system returns zero matches; npm run lint exits 0 (Biome emits 5 warnings for ignore-pattern style in biome.json but no errors); npm run test:run passes; npm run build passes; npx storybook dev -p 6006 --smoke-test exits 0. Acceptance criteria #1-#5 are satisfied in the current tree.
