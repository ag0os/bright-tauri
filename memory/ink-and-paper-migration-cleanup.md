---
source: archive
plan: ink-and-paper-migration-cleanup
distilledAt: 2026-04-22
---

# Ink & Paper migration cleanup

## What Was Built

Finished the half-done Modern Indigo → Ink & Paper design-system swap. The legacy `--color-*` / `--typography-*` / `--font-*` alias layer is gone (not frozen — deleted), all ~1500 call sites migrated to native Ink & Paper tokens (`--fg1`, `--accent`, `--bg`, `--fs-*`, `--lh-*`, `--radius-*`, etc.), a `lint:tokens` CI guard prevents alias reintroduction, and design-system guidance now lives in a loadable agent skill (`.claude/skills/ink-and-paper/SKILL.md`) rather than bloating every session's AGENTS.md. The Lexical editor now actually renders in Newsreader at the spec's reading values (previously it referenced undefined tokens and silently fell back to UA defaults).

## Key Decisions

- **Retire the alias layer, don't keep it.** Keeping aliases long-term guarantees new code copies old names from existing files and the two-layer token system stays murky forever. One bounded migration is cheaper than permanent confusion.
- **Design package lives in `docs/design-reference/`, not `~/Downloads/`.** Every migration stage needed a stable repo-local reference to cite. The exported Claude Design bundle is treated as read-only source material.
- **Three-doc split + one skill for design guidance.** `docs/design-reference/` = exported source, `docs/design-system.md` = canonical prose for humans, `.claude/skills/ink-and-paper/SKILL.md` = on-demand agent guidance with triggers, `AGENTS.md` = short blurb + skill pointer. Keeps AGENTS.md small so non-UI sessions don't pay the token cost, and puts rich detail where it only loads when relevant.
- **Skill's `description` field must be specific or it won't fire.** Listed concrete triggers (paths under `src/design-system/`, `src/editor/`, `src/features/**/*.css`; keywords like tokens, Newsreader, marigold, Phosphor, theme, radius) plus explicit negative triggers (Rust, Tauri commands, backend).
- **No new lint tooling.** Biome doesn't enforce CSS custom-property names and the project has no Stylelint. A one-line `rg` guard in `npm run lint:tokens` is enforcement enough after the aliases are deleted.
- **Editor reading values pinned to the design package.** `var(--font-display)` / `var(--fs-md)` (17px) / `var(--lh-reading)` (1.7) / `var(--layout-reading-w)` (720px). Pinned because "17px vs 19px, 68ch vs 720px" kept re-emerging during review.
- **Module-by-module migration, not a mega-PR.** Stage 5 split into 8 module tasks (`src/shared`, `src/design-system/templates+organisms`, `src/features/universe`, etc.) plus a prep task (alias→native map) and a final task (delete alias block + CI guard). Per-PR visual diffs were tractable; a single 1500-call-site diff would not have been.

## Patterns Established

- **Native tokens only** — `--fg1`, `--fg2`, `--bg`, `--surface`, `--surface-2`, `--accent`, `--selection`, `--fs-{xs,sm,base,md,lg,xl,2xl}`, `--lh-{tight,snug,normal,reading}`, `--radius-{sm,md,lg}`, `--shadow-*`. Full table in `.claude/skills/ink-and-paper/SKILL.md` and `docs/design-system.md`.
- **UI chrome uses `--font-body` (Geist); reading surface uses `--font-display` (Newsreader).** The contrast is intentional — don't collapse them.
- **Editor reading column** is a dedicated wrapper (`.editor-reading-column`) inside `.editor-container`, centered with `max-width: var(--layout-reading-w); margin: 0 auto`. The Lexical `contenteditable` host (`.editor-content`) can't carry the centering itself.
- **Phosphor icons default to regular weight.** Use `weight="fill"` only for active/selected states (favorites, completed checkmarks). Never `weight="duotone"`.
- **Design-system guidance loads on demand.** AGENTS.md carries a 5-line blurb and a pointer; the skill carries the detail. Follow the same pattern for future domain-specific guidance — resist growing AGENTS.md.
- **Alias-map commit before migrations.** `docs/design-reference/alias-map.md` documents every `--color-*` → native mapping; workers used it as a find-replace reference. Generating the map in its own commit made every subsequent migration PR a mechanical diff.

## Files Changed

- `src/design-system/tokens/colors/ink-and-paper.css` — renamed from `modern-indigo.css`, alias block deleted after migration.
- `src/design-system/tokens/typography/newsreader-geist.css` — renamed from `classic-serif.css`, alias block deleted.
- `src/design-system/tokens/colors/purple-gradient.css` — deleted (unreferenced).
- `src/design-system/stories/*.stories.tsx` — rewritten from "Modern Indigo / Classic Serif / Minimal Squared" to Ink & Paper titles and copy. Native-token stories added alongside.
- `src/editor/RichTextEditor.css` + `RichTextEditor.tsx` — replaced undefined token references (`--font-family-body`, `--line-height-heading`, etc.) with native reading tokens; added `.editor-reading-column` wrapper.
- `src/features/**/*.css` + `src/shared/**/*.css` + `src/App.css` + `src/pages/**` — all alias usages replaced with native tokens (~1500 call sites).
- `.claude/skills/ink-and-paper/SKILL.md` — new skill with native token table, iconography policy, editor reading values, theme-testing guidance.
- `AGENTS.md` — design section trimmed to short blurb + `/skill:ink-and-paper` pointer; no `var(--color-primary)` example.
- `docs/design-system.md` — rewritten as canonical prose reference (-526/+198 lines).
- `docs/design-reference/` — exported Claude Design package, read-only source of truth.
- `docs/design-reference/alias-map.md` — alias→native mapping table.
- `docs/ui-navigation.md` — "Design System Integration" section updated; UX content untouched.
- `docs/ideas/roadmap.md` — deleted (stale).
- `package.json` — new `lint:tokens` script (rg-based alias guard), wired into `npm run lint`.

## Gotchas & Lessons

- **The editor was silently off-spec before this plan.** `src/editor/RichTextEditor.css` referenced `--font-family-body`, `--font-family-heading`, `--line-height-body`, `--line-height-heading` — none of which are defined anywhere in `src/design-system/tokens/`. The browser fell back to UA defaults so nothing looked broken, but the editor wasn't rendering in Newsreader at all. Lesson: undefined CSS custom properties don't throw — do an `rg` audit against the token source when you suspect styles aren't applying.
- **`contenteditable` hosts can't be centered directly.** Lexical's `.editor-content` carries `contenteditable`; giving it `max-width + margin: 0 auto` interacts badly with selection and caret positioning. Wrap it in a `.editor-reading-column` inside the scroll container instead.
- **Spacing tokens (`--spacing-*`) are also aliases.** They map 1:1 to native scale, but they're still aliases — migrate them for consistency or you'll keep finding stragglers. The first Stage 5 task picked this up.
- **A single worker forgot to commit.** TASK-012 was marked Done with uncommitted changes. Subsequent chain runs explicitly instructed every worker to `git add && git commit` before marking Done. If running a coordinator chain again, put this in the prompt.
- **Coordinator timeouts are real on large plans.** The first chain (`task-manager → coordinator → quality-manager`) timed out after ~33 min with Stage 5 unstarted. Resuming with a second `coordinator → quality-manager` chain worked. For plans with 15+ tasks, expect to run the chain in two halves or split Stage 5-style sequences across chains.
- **Rename + delete + re-import churn is a build-smoke trap.** `tsc` doesn't catch broken CSS `@import`s; Biome doesn't catch broken TS/TSX CSS `import` statements either. Stage 2's verification relied on `npm run build` finding them. Always run the full build (not just lint + tests) on filename renames.
- **`rg` patterns for the token grep need escaping.** The CI guard uses `var\(--(color|typography|font-family|font-size|line-height|font-weight)-` — the parens and hyphen at the end are both significant. A looser pattern (`var\(--color-`) misses the typography/font family/etc. families.
- **Keep the skill's alias-retirement status in sync.** The living "aliases frozen / migrating / retired" line in the skill is easy to forget to update when the final alias-deletion task lands. After archive it was still saying "migration in progress" — fixed post-hoc.
