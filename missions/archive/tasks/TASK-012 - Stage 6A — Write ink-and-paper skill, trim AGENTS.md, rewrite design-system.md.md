---
id: TASK-012
title: 'Stage 6A — Write ink-and-paper skill, trim AGENTS.md, rewrite design-system.md'
status: Done
priority: high
assignee: worker
labels:
  - frontend
  - 'plan:ink-and-paper-migration-cleanup'
dependencies: []
createdAt: '2026-04-22T20:28:55.815Z'
updatedAt: '2026-04-22T20:39:25.835Z'
---

## Description

Write the on-demand agent skill, trim the AGENTS.md design section to a short blurb + pointer, and rewrite `docs/design-system.md` as the canonical Ink & Paper prose reference.

**Files touched:**
- `.claude/skills/ink-and-paper/SKILL.md` (create)
- `AGENTS.md` (trim design section)
- `docs/design-system.md` (rewrite)

**Work:**
1. Create `.claude/skills/ink-and-paper/SKILL.md` following `.claude/skills/backlog-manager/SKILL.md` shape (YAML frontmatter with `name`, `description`, `allowed-tools`). The `description`/triggers must fire on UI/CSS/component work and not over-trigger on backend sessions. Body must include: native token table (`--fg1`, `--fg2`, `--bg`, `--surface`, `--accent`, `--selection`, `--fs-*`, `--lh-*`, `--radius-*`) sourced from `docs/design-reference/project/colors_and_type.css`; theme modes + how to test both; typography (UI chrome → `var(--font-body)` Geist, reading surface → `var(--font-display)` Newsreader at `--fs-md` / 1.7 / `--layout-reading-w`); iconography (Phosphor regular weight; `weight="fill"` only for active/selected; no `weight="duotone"`); component patterns (flat cards, hairline borders, no hover transform, 8/12/16 radii, paper-grain bg); voice/tone rules (cite `docs/design-reference/README.md`); alias-retirement status living section (start at "aliases frozen, migration in progress — do not introduce `var(--color-*)` etc."); pointers to `docs/design-system.md` and `docs/design-reference/`.
2. Trim `AGENTS.md` `### Design system` section to the short blurb + pointer described in the plan. Remove the `var(--color-primary)` example entirely.
3. Rewrite `docs/design-system.md` around Ink & Paper: full native-token table, theme modes, typography scale (UI vs reading), radii/shadows, short alias-retirement note pointing at Stage 5, link to the skill, link to `docs/design-reference/`.

<!-- AC:BEGIN -->
- [ ] #1 .claude/skills/ink-and-paper/SKILL.md exists with YAML frontmatter (name, description, allowed-tools) and body covering native token table, theme modes, typography (UI vs reading surface), iconography policy (no duotone, fill for active only), component patterns, voice/tone, and alias-retirement status
- [ ] #2 Skill description field reliably triggers on UI/CSS/component/token work without over-triggering on backend-only sessions
- [ ] #3 AGENTS.md design section is a short blurb + skill pointer only; no var(--color-primary) example or verbose token guidance remains
- [ ] #4 docs/design-system.md is rewritten around Ink & Paper with full native-token table, theme modes, typography scale, radii/shadows, alias-retirement note, and links to the skill and docs/design-reference/
- [ ] #5 npm run lint, npm run test:run, and npm run build all pass
<!-- AC:END -->

## Implementation Notes

All three deliverables complete: .claude/skills/ink-and-paper/SKILL.md created, AGENTS.md trimmed, docs/design-system.md rewritten. AC #1–#4 fully satisfied. AC #5 lint caveat: same pre-existing Biome errors in read-only docs/design-reference/project/preview/ HTML files as seen in TASK-013 — not introduced by this task. Tests and build pass.
