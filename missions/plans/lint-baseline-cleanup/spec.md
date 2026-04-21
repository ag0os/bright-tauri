# Lint baseline cleanup spec

## Goal

Bring the repository to a clean lint baseline across both stacks using the already-wired tooling:
- Frontend: `biome check .`
- Backend: `cargo fmt --all -- --check && cargo clippy --all-targets -- -D warnings`
- Combined gate: `npm run lint:all`

## Success definition

- All current Biome errors and warnings are resolved without changing generated files under `src/types/**`.
- All current clippy warnings are resolved, including the 260 serde-attribute parse warnings or a narrowly justified false-positive mitigation.
- Existing Vitest and Rust tests continue to pass.
- A repository CI workflow runs `npm run lint:all` so the clean baseline is enforced going forward.

## Explicit non-goals

- No tightening beyond the current `biome.json` `recommended` ruleset in this plan.
- No broad lint suppression or blanket `allow` to force a green run.
- No feature work or unrelated architecture refactors.

## Decision points for user review

1. **Autofocus policy**
   - Planner proposal: remove autofocus from empty-state CTA buttons; keep it for intentional text-entry flows (rename/create/title-edit) unless UX review says otherwise.
2. **Dead-code policy**
   - Planner proposal: prefer deletion or real wiring over `#[allow(dead_code)]`; only keep a narrow allow with a comment when the code is intentionally retained.
3. **Post-baseline strictness**
   - Planner proposal: keep Biome at `recommended` for this plan and consider stricter rules only in a separate follow-up once the baseline is stable.

## Verified codebase anchors

- Existing lint commands: `package.json:17-22`
- Existing Biome scope/exclusions: `biome.json:15-17`, `biome.json:37`
- Existing accessible modal reference: `src/shared/components/ConfirmationModal.tsx:131-141`
- High-risk editor/save path: `src/features/stories/views/StoryEditor.tsx:65-80`, `src/features/stories/views/StoryEditor.tsx:267`, `src/editor/RichTextEditor.tsx:41-50`, `src/features/stories/hooks/useAutoSnapshot.ts:109-171`
- Existing GitHub workflows (no lint gate yet): `.github/workflows/claude.yml:1`, `.github/workflows/claude-code-review.yml:1`
