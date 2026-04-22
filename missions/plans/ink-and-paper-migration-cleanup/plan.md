---
title: Ink & Paper migration cleanup
status: active
createdAt: '2026-04-22T20:27:03.154Z'
updatedAt: '2026-04-22T20:27:03.154Z'
---

Finish the Modern Indigo → Ink & Paper design system migration. Retire the alias layer entirely (not keep it long-term), sync Storybook / docs / contributor guidance, fix the editor reading surface, and split agent guidance into a loadable skill.

**Status:** Stage 0 complete (design reference vendored at `docs/design-reference/`, AGENTS.md Key docs updated — commits `a37659a`, `84a6cfb`). Stages 1–6 remain.

**Full plan doc:** `docs/plans/ink-and-paper-migration-cleanup.md` — read this top to bottom before breaking down tasks. It contains locked decisions, current-state analysis, per-stage work lists, validation checklist, and suggested ordering.

## Locked decisions
1. Aliases retired (not kept). Stage 5 migrates every call site then deletes the alias block.
2. Design package lives in-repo at `docs/design-reference/` (already done).
3. Three-doc split: `docs/design-reference/` (exported source), `docs/design-system.md` (canonical prose), `.claude/skills/ink-and-paper/SKILL.md` (on-demand agent guidance), `AGENTS.md` (short blurb + skill pointer).
4. Editor reading surface uses canonical package values: `var(--font-display)` / `var(--fs-md)` / `var(--lh-reading)` / `var(--layout-reading-w)`.
5. Delete `docs/ideas/roadmap.md`; keep `docs/ui-navigation.md` but sync its design-system references.
6. No new lint tooling — enforcement is a one-line `rg` guard in Stage 5.

## Stages (remaining)
- Stage 1: Storybook rewrite (token stories, landing story, native-token stories)
- Stage 2: Rename `modern-indigo.css` → `ink-and-paper.css`, `classic-serif.css` → `newsreader-geist.css`; delete `purple-gradient.css`; update all CSS `@import` and TS/TSX imports.
- Stage 3: Purge `weight="duotone"` across 30 files (~94 occurrences).
- Stage 4: Fix editor reading surface — replaces undefined tokens, uses native reading tokens, adds `.editor-reading-column` wrapper if needed.
- Stage 5: Freeze aliases → build alias→native map at `docs/design-reference/alias-map.md` → migrate module-by-module → delete alias block → add `rg` CI guard.
- Stage 6: Write `.claude/skills/ink-and-paper/SKILL.md`, trim AGENTS.md design section, rewrite `docs/design-system.md`, sync `docs/ui-navigation.md`, delete `docs/ideas/roadmap.md`.

## Suggested ordering
Stage 6 (docs-only portion) → Stage 3 → Stage 2 → Stage 1 → Stage 4 → Stage 5. See the full plan doc for rationale.

## Validation per stage
Every executable stage must pass: `npm run lint`, `npm run test:run`, `npm run build`, plus Storybook smoke for token/story work and manual dark+light QA for visual changes.
