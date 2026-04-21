---
title: Reach a clean Biome + clippy lint baseline
status: active
createdAt: '2026-04-21T20:00:08.075Z'
updatedAt: '2026-04-21T20:00:08.075Z'
---

## Summary

Drive the repository to a passing `npm run lint:all` baseline without weakening the current ruleset, changing generated files, or regressing the existing frontend/editor and Rust test suites. The plan front-loads low-risk bulk cleanup, isolates the high-risk React/editor and Rust warning triage into smaller focused tasks, and ends by adding a repository-level lint gate.

## Scope

Included:
- Resolve the remaining frontend Biome issues under the current `recommended` ruleset in `biome.json:37` while continuing to ignore generated output in `biome.json:15-17`.
- Resolve backend `cargo clippy --all-targets -- -D warnings` issues exposed by `package.json:20-22`, including the 260 `failed to parse serde attribute` warnings, `uninlined_format_args`, `Iterator::last` on double-ended iterators, and remaining `dead_code` warnings.
- Add a CI lint gate that reuses the existing scripts rather than introducing parallel lint commands.

Excluded:
- Tightening Biome beyond the current `recommended` baseline unless explicitly approved after the cleanup lands.
- Hand edits under `src/types/**` (generated via ts-rs and already excluded from Biome).
- Unrelated UI refactors, design-system redesigns, or backend feature work.

Assumptions:
- “Clean baseline” means `npm run lint:all` passes with no frontend errors/warnings and no clippy warnings.
- The single remaining CSS `noDescendingSpecificity` issue will be fixed in place rather than suppressed.
- Any lint suppression added during implementation must be narrow, justified, and documented inline; no repo-wide disable is acceptable.
- User-approved (2026-04-21): keep `biome.json` at `recommended` for this plan; stricter rules are an explicit follow-up, not part of this scope.
- User-approved (2026-04-21): split autofocus policy — remove empty-state CTA autofocus; keep autofocus on intentional text-entry flows (rename/create modals, inline title edit).
- User-approved (2026-04-21): delete truly orphaned Rust code; do not introduce `#[allow(dead_code)]` to paper over it. If a specific item has a documented near-term consumer, that exception must be called out in the task for review before merge.

## Decision Log

- **D-001 — Bulk button-type cleanup uses a default-to-button sweep**
  - Decision: Apply a one-off bulk edit that adds `type="button"` to non-form buttons first, then audit known form surfaces for the smaller set of real submit buttons.
  - Alternatives: Hand-edit every button individually; add a persistent codemod script to the repo.
  - Why: The repo has many plain trigger buttons (`src/shared/components/TopBar.tsx:74`, `src/features/universe/views/UniverseList.tsx:337`, `src/design-system/templates/dashboard/Dashboard.tsx:143`), so a default-to-button sweep gives the fastest safe reduction. Forms already identify true submits in place (`src/features/stories/components/CreateStoryModal.tsx:390`, `src/features/containers/components/CreateContainerModal.tsx:290`, `src/features/elements/components/CreateElementModal.tsx:506`).
  - Decided by: planner-proposed

- **D-002 — Composite clickable surfaces stay composite; simple controls become native buttons**
  - Decision: Convert simple card-like controls with no nested interactive descendants to native buttons (for example `src/features/universe/components/UniverseCard.tsx:27`), but keep composite cards/rows that contain nested action buttons as non-button containers with explicit keyboard semantics instead of introducing invalid nested buttons.
  - Alternatives: Convert every clickable surface to a `<button>`; leave div-click patterns in place and only silence lints.
  - Why: `ContainerCard`, `StoryCard`, and `ElementCard` all have nested action buttons (`src/features/containers/components/ContainerCard.tsx:97`, `src/features/stories/components/StoryCard.tsx:122`, `src/features/elements/components/ElementCard.tsx:121`). A blanket native-button conversion would create invalid nested controls.
  - Decided by: planner-proposed

- **D-003 — Modal/backdrop fixes follow the existing accessible dialog pattern**
  - Decision: Align feature modals and delete confirmations with the semantics already used in `src/shared/components/ConfirmationModal.tsx:131-141`, and prefer backdrop target checks over extra click-stopper wrappers where possible.
  - Alternatives: Introduce a new shared modal abstraction purely for lint cleanup; keep all existing backdrop div click handlers as-is.
  - Why: The codebase already has an accessible confirmation modal pattern, while several form modals still use bare overlay/content div click handlers (`src/features/universe/components/CreateUniverseModal.tsx:68-69`, `src/features/stories/views/StoryVersions.tsx:256-257`, `src/shared/components/ConfirmDeleteModal.tsx:44-55`). Reusing the existing pattern reduces drift without a cross-cutting refactor.
  - Decided by: planner-proposed

- **D-004 — React hook dependency fixes are isolated into one high-risk task**
  - Decision: Treat the six `useExhaustiveDependencies` findings as a single focused task gated by existing editor/version tests.
  - Alternatives: Fold them into nearby a11y/TS cleanup tasks; use autofix blindly.
  - Why: `StoryEditor` already sits on top of a delicate editor/autosave/snapshot boundary (`src/features/stories/views/StoryEditor.tsx:65-80`, `src/features/stories/views/StoryEditor.tsx:267`, `src/editor/RichTextEditor.tsx:41-50`, `src/features/stories/hooks/useAutoSnapshot.ts:109-171`). Blind dependency edits risk remount loops, stale closures, and duplicate snapshot writes.
  - Decided by: planner-proposed

- **D-005 — Rust serde warnings are investigated before the rest of clippy cleanup**
  - Decision: Start backend cleanup by determining whether the 260 serde warnings are real attribute problems or a clippy/derive false positive concentrated in the model layer.
  - Alternatives: Ignore the warnings and fix only the smaller manual findings; add a broad `allow` immediately.
  - Why: The warnings are concentrated around model serde attributes such as `src-tauri/src/models/universe.rs:10`, `src-tauri/src/models/element.rs:12`, and `src-tauri/src/models/story.rs:19`. Until their provenance is clear, backend lint output cannot be trusted.
  - Decided by: planner-proposed

- **D-006 — Regression prevention is enforced in CI via GitHub Actions, not Husky**
  - Decision: Add a dedicated GitHub Actions lint workflow that runs the existing scripts from `package.json:17-22`.
  - Alternatives: Add Husky/lint-staged; piggyback on the existing Claude workflows only.
  - Why: The repo already has GitHub Actions but no local hook toolchain (`.github/workflows/claude.yml:1`, `.github/workflows/claude-code-review.yml:1`). A workflow gives consistent enforcement for all contributors without introducing new npm dependencies.
  - Decided by: planner-proposed

## Design

### Module structure

This plan does not introduce new runtime modules. It cleans lint issues in place across these existing boundaries:

- **Frontend feature modules** — `src/features/{universe,stories,containers,elements,settings}/**` own feature-specific controls, forms, and list rows.
- **Shared UI modules** — `src/shared/components/**` own reusable modals, toasts, error handling, and top-level chrome.
- **Editor modules** — `src/editor/**` own Lexical editor setup and typing-sensitive behavior.
- **Design-system and Storybook modules** — `src/design-system/**` and `src/stories/**` own demo-only buttons, anchors, SVGs, and sample interactive surfaces that still count toward the lint baseline.
- **Rust model/service layers** — `src-tauri/src/models/**`, `src-tauri/src/services/**`, `src-tauri/src/db/**`, and selected repositories/commands own the remaining backend lint issues.
- **CI configuration** — add one workflow under `.github/workflows/` whose only job is enforcing the clean baseline via the existing scripts.

### Dependency graph

- `.github/workflows/lint.yml` depends on the existing npm scripts in `package.json`; no new script entrypoints are required.
- Frontend feature and shared-component fixes stay inside their current feature-first boundaries; no feature module should start importing from Storybook or design-system story files.
- Editor fixes remain `StoryEditor -> RichTextEditor -> ContentChangePlugin/ToolbarPlugin -> snapshot/save APIs`; no lint cleanup should invert that flow.
- Rust cleanup stays inside the existing `commands -> services -> repositories -> models/db` direction registered in `src-tauri/src/lib.rs:48-86`; no lint task should change the public Tauri command surface.

### Key contracts

Workers must preserve these existing contracts while fixing lint issues:

```ts
// src/features/stories/stores/useStoriesStore.ts
getStory: (id: string) => Promise<StoryDetail>;
updateStory: (id: string, input: StoryUpdate) => Promise<void>;
```

```ts
// src/editor/RichTextEditor.tsx
interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}
```

```ts
// src/features/stories/hooks/useAutoSnapshot.ts
interface UseAutoSnapshotProps {
  storyId: string;
  content: string;
  wordCount?: number;
  enabled: boolean;
  trigger: SnapshotTrigger;
  characterThreshold?: number;
  maxSnapshots?: number;
}
```

```rust
// src-tauri/src/services/story_version_service.rs
pub fn delete_story_version(db: &Database, version_id: &str) -> Result<(), String>
pub fn switch_story_version(db: &Database, story_id: &str, version_id: &str) -> Result<Story, String>
```

Implementation rules tied to those contracts:
- `StoryEditor` must continue to load story data once per route/story change and pass the loaded snapshot JSON into `RichTextEditor` without causing edit-loop remounts.
- `useAutoSnapshot` must continue to create snapshots only when baseline/trigger rules are satisfied; dependency fixes must not turn its cleanup/create behavior into “run on every render”.
- Backend clippy cleanup must not rename/remove Tauri commands or alter the shape of exported Rust models unless required to fix a real serde issue.

### Integration seams

- **Lint entrypoints**: `package.json:17-22` already define `lint`, `lint:rust`, and `lint:all`. The CI gate must invoke those exact scripts instead of duplicating command logic.
- **Biome boundary**: `biome.json:15-17` excludes generated output and `biome.json:37` enables `recommended`. Cleanup should target source files only and leave generated type exclusions intact.
- **Editor load/save flow**: `src/features/stories/views/StoryEditor.tsx:65-80` loads a `StoryDetail` via `getStory`; `src/features/stories/views/StoryEditor.tsx:267` passes `content` as `initialContent`; `src/editor/RichTextEditor.tsx:41-50` intentionally latches initial content once and only remounts on `readOnly` changes. Hook-dependency edits must respect that contract.
- **Snapshot side effects**: `src/features/stories/api/snapshots.ts:10` and `src/features/stories/api/snapshots.ts:22` are the write paths used by `useAutoSnapshot` and `useAutoSave`; tests already assert those calls in `src/features/stories/views/StoryEditor.test.tsx:111` and `src/features/stories/hooks/useAutoSnapshot.test.ts:60`.
- **Accessible modal precedent**: `src/shared/components/ConfirmationModal.tsx:131-141` already provides dialog semantics, cancel behavior, and explicit button types. Feature modals/backdrops should align with that pattern rather than inventing a second modal behavior model.
- **Composite clickable cards**: `src/features/containers/components/ContainerCard.tsx:97`, `src/features/stories/components/StoryCard.tsx:122`, and `src/features/elements/components/ElementCard.tsx:121` mix a clickable surface with nested action buttons; fixes must preserve nested button behavior while adding keyboard accessibility.
- **Problem hotspots already identified by code**:
  - Empty-state autofocus + create flow: `src/features/universe/views/UniverseSelection.tsx:145`, `src/features/universe/components/CreateUniverseModal.tsx:21-24`
  - Invalid storybook anchors and index keys: `src/design-system/templates/dashboard/Dashboard.tsx:64`, `src/design-system/templates/dashboard/Dashboard.tsx:95`
  - SVG title omissions: `src/stories/Header.tsx:19`, `src/stories/Page.tsx:59`
  - Unused `any` casts: `src/editor/plugins/ToolbarPlugin.tsx:58`, `src/features/elements/components/CreateElementModal.tsx:48`, `src/features/elements/components/EditElementModal.tsx:48`
  - Non-null assertions in tests: `src/features/stories/views/StoryEditor.test.tsx:309`, `src/features/stories/views/StoryEditor.test.tsx:393`
  - Remaining Rust warning seams: `src-tauri/src/services/story_version_service.rs:50`, `src-tauri/src/file_naming.rs:22`, `src-tauri/src/db/connection.rs:47`, `src-tauri/src/models/element.rs:144`

### Seams for change

- **Focus policy seam**: keep the implementation localized so autofocus behavior can be revisited after UX review without reopening the entire cleanup. Inputs/rename flows and empty-state CTA buttons are treated separately.
- **Rust serde-warning seam**: the investigation task must isolate whether the remedy lives in source attributes, in a narrow lint allow, or in toolchain configuration. That decision stays localized to the model/lint boundary, not the service/repository layer.
- **CI enforcement seam**: workflow configuration should be isolated in one new file so future teams can extend enforcement (tests, typecheck, release gating) without touching runtime code.

## Approach

1. **Shrink obvious noise first**
   - Run a mechanical, non-committed sweep to add missing button types across app code and Storybook/demo surfaces, defaulting to `type="button"` except where the file already contains a form submit path.
   - Fix trivial frontend warnings with deterministic outcomes while in the touched files: invalid `href="#"` anchors in `src/design-system/templates/dashboard/Dashboard.tsx:64`, SVG titles in `src/stories/Header.tsx:19` / `src/stories/Page.tsx:59`, array-index keys where a stable field already exists, and the iterable callback return in `src/shared/utils/LRUCache.ts:178`.

2. **Batch semantic a11y by interaction pattern, not by lint rule**
   - **Simple controls**: use native buttons where there are no nested interactive descendants (`UniverseCard`, top-bar buttons, storybook demo buttons).
   - **Composite cards/rows**: add keyboard support and semantic roles to the existing surface instead of nesting buttons inside buttons; remove container-level click-stopper div handlers where child button handlers already stop propagation.
   - **Modals/backdrops**: use overlay target checks plus dialog semantics so backdrop-dismiss behavior remains intact without scattered static-element click handlers.

3. **Treat React/editor fixes as a correctness pass, not lint cosmetics**
   - Review each exhaustive-deps finding in surrounding component context before changing it.
   - Preserve the current StoryEditor contract: initial story load via `getStory`, content handoff to Lexical, debounced save via `useAutoSave`, and snapshot creation via `useAutoSnapshot`.
   - Use the existing tests around StoryEditor and auto-snapshot as the regression harness instead of rewriting behavior around the linter.

4. **Treat backend clippy in two waves**
   - **Wave A — provenance**: confirm whether the serde warnings are source errors or tool noise in the model layer.
   - **Wave B — cleanup**: after provenance is known, apply `clippy --fix` for format-arg inlining, replace `.last()` with `.next_back()` where appropriate, and resolve remaining dead code according to the approved policy.

5. **Protect the baseline**
   - Once the branch is clean, add a GitHub Actions workflow that runs `npm run lint:all` on pull requests and pushes to the main development branch.
   - Do not add Husky/lint-staged in this plan; introducing new local tooling would expand scope and duplicate the CI gate.

### Task batching rules

- **Batched tasks**: button-type sweep (split into app code vs storybook/design-system), semantic a11y cleanup (split by interaction pattern/feature area), Rust auto-fixable cleanup after serde investigation.
- **Atomic tasks**: exhaustive-deps pass, serde-warning investigation, CI gate.
- **User-review checkpoints**: autofocus policy, dead-code policy, and whether post-baseline stricter Biome rules should be a follow-up plan.

## Files to Change

Expected frontend source files:
- `src/shared/components/TopBar.tsx` — add explicit button types.
- `src/shared/components/Toast.tsx` — add explicit button type to dismiss control.
- `src/shared/components/ErrorBoundary.tsx` — add explicit button type to retry action.
- `src/shared/components/ConfirmationModal.tsx` — keep as the accessible dialog reference; adjust only if needed to align other modals.
- `src/shared/components/ConfirmDeleteModal.tsx` — add explicit button types and align overlay semantics with the shared confirmation pattern.
- `src/editor/RichTextEditor.tsx` — review `useExhaustiveDependencies` finding around editor remount behavior.
- `src/editor/plugins/ToolbarPlugin.tsx` — replace `any` casts with proper Lexical typing.
- `src/shared/utils/LRUCache.ts` — fix iterable callback return warning.
- `src/features/universe/views/UniverseSelection.tsx` — remove or justify CTA autofocus; fix keyboard-effect deps around `handleSelectUniverse` / `handleOpenCreateModal`.
- `src/features/universe/views/UniverseList.tsx` — add explicit button types.
- `src/features/universe/components/UniverseCard.tsx` — replace role-based faux button with a native button or equivalent semantic fix.
- `src/features/universe/components/CreateUniverseModal.tsx` — add missing button types and align overlay click semantics.
- `src/features/settings/views/Settings.tsx` — resolve the unassociated `Snapshot trigger` label and add explicit button types.
- `src/features/stories/views/StoryEditor.tsx` — review exhaustive deps, title-edit interaction, and button types.
- `src/features/stories/views/StoryVersions.tsx` — keep rename/create autofocus decision explicit; fix modal overlay semantics and missing button types.
- `src/features/stories/views/StoryHistory.tsx` — add explicit button types.
- `src/features/stories/views/StoryCompare.tsx` — add explicit button type.
- `src/features/stories/views/StoriesList.tsx` — add explicit button types and remove static click-stopper wrappers if flagged.
- `src/features/stories/views/StorySettings.tsx` — add explicit button types where missing.
- `src/features/stories/components/CreateStoryModal.tsx` — add missing button types and align overlay click semantics.
- `src/features/stories/components/StoryCard.tsx` — add keyboard semantics without creating nested buttons.
- `src/features/containers/components/CreateContainerModal.tsx` — add missing button types and align overlay click semantics.
- `src/features/containers/components/ContainerCard.tsx` — add keyboard semantics without creating nested buttons.
- `src/features/containers/views/ContainerView.tsx` — fix clickable row semantics and remove redundant click-stopper wrappers.
- `src/features/containers/views/ContainerChildrenView.tsx` — fix clickable row semantics and remove redundant click-stopper wrappers.
- `src/features/containers/views/ContainerSettings.tsx` — add explicit button types.
- `src/features/elements/components/CreateElementModal.tsx` — replace `any` cast, add missing button types, align overlay click semantics.
- `src/features/elements/components/EditElementModal.tsx` — replace `any` cast, add missing button types, align overlay click semantics.
- `src/features/elements/components/ElementCard.tsx` — replace index key and add keyboard semantics without creating nested buttons.
- `src/features/elements/views/ElementDetailPage.tsx` — replace index keys and add explicit button types where missing.
- `src/design-system/organisms/navigation/Navigation.tsx` — add explicit button types to demo navigation controls.
- `src/design-system/templates/dashboard/Dashboard.tsx` — replace invalid anchors, add explicit button types, and replace index keys.
- `src/design-system/stories/ButtonTokens.stories.tsx` — add explicit button types.
- `src/design-system/stories/CardTokens.stories.tsx` — add explicit button types.
- `src/design-system/stories/ColorTokens.stories.tsx` — add explicit button types.
- `src/design-system/stories/IconTokens.stories.tsx` — add explicit button types.
- `src/design-system/stories/InputTokens.stories.tsx` — add explicit button types if missing and verify label/control associations.
- `src/design-system/stories/TypographyTokens.stories.tsx` — add explicit button types.
- `src/design-system/tokens/atoms/button/Button.test.tsx` — replace `[key: string]: any` with typed button props.
- `src/stories/Header.tsx` — add SVG title.
- `src/stories/Page.tsx` — add SVG title.
- `src/editor/RichTextEditor.css` — fix the remaining `noDescendingSpecificity` rule in place.
- `src/features/stories/views/StoryEditor.test.tsx` — remove non-null assertions and keep editor/save behavior covered after hook-deps changes.
- `src/features/stories/views/StoryVersions.test.tsx` — extend if needed to lock rename/create behavior after the exhaustive-deps pass.
- `src/features/stories/hooks/useAutoSnapshot.test.ts` — extend if needed to confirm snapshot behavior remains stable.

Expected backend source files:
- `src-tauri/src/models/universe.rs` — investigate serde attribute warnings.
- `src-tauri/src/models/container.rs` — investigate serde attribute warnings.
- `src-tauri/src/models/story.rs` — investigate serde attribute warnings.
- `src-tauri/src/models/story_snapshot.rs` — investigate serde attribute warnings.
- `src-tauri/src/models/story_version.rs` — investigate serde attribute warnings.
- `src-tauri/src/models/element.rs` — investigate serde attribute warnings and resolve local `dead_code` allow if no longer justified.
- `src-tauri/src/services/story_version_service.rs` — replace `.last()` with `.next_back()` or equivalent.
- `src-tauri/src/file_naming.rs` — resolve remaining `dead_code` items and any trivial format-arg cleanup if retained.
- `src-tauri/src/db/connection.rs` — resolve remaining `dead_code` item(s) if unused.
- `src-tauri/src/db/migrations.rs` — resolve remaining `dead_code` item(s) if unused.
- `src-tauri/src/repositories/universe.rs` — accept `clippy --fix` format-arg cleanup if touched.
- `src-tauri/src/repositories/story.rs` — accept `clippy --fix` format-arg cleanup if touched.
- `src-tauri/src/repositories/element.rs` — accept `clippy --fix` format-arg cleanup if touched.
- `src-tauri/src/commands/container.rs` — accept `clippy --fix` format-arg cleanup if touched.
- `src-tauri/src/lib.rs` — accept `clippy --fix` format-arg cleanup only; command registration order/surface stays unchanged.

New CI file:
- `.github/workflows/lint.yml` — run `npm ci`, `npm run lint:all`, and cache npm/cargo as appropriate for a PR-safe lint gate.

## Risks

- **High-risk React hook dependency edits can change editor save/snapshot behavior**
  - Blast radius: story loading, autosave, title editing, version switching, snapshot history, and the tests that rely on `update_snapshot_content` / `create_story_snapshot` behavior.
  - Classification: Must fix.
  - Countermeasure: isolate all six findings into one task, validate against `src/features/stories/views/StoryEditor.test.tsx`, `src/features/stories/hooks/useAutoSnapshot.test.ts`, and `src/features/stories/views/StoryVersions.test.tsx` before merge.

- **Naive semantic-element fixes can create nested-button invalid markup**
  - Blast radius: story/container/element/universe navigation, hover action buttons, keyboard access, and pointer behavior on cards and list rows.
  - Classification: Mitigated.
  - Countermeasure: distinguish simple controls from composite interactive surfaces; use native buttons only where there are no nested controls, otherwise add role/tabIndex/keyboard semantics to the existing surface.

- **Serde warning provenance may be a tool false positive, and a broad suppression would hide real backend issues**
  - Blast radius: every Rust model exported to TypeScript, clippy credibility in CI, and future backend refactors.
  - Classification: Must fix.
  - Countermeasure: do an investigation task first; if suppression is required, keep it narrow to the proven false-positive boundary and document why.

- **Autofocus cleanup has a UX trade-off**
  - Blast radius: first-use universe creation, version rename/create flows, and inline title editing.
  - Classification: Mitigated.
  - Countermeasure: separate empty-state CTA autofocus from data-entry autofocus and require an explicit policy choice before implementation finalizes those lines.

- **Dead-code removal may conflict with expected near-term reuse of old Git-era helpers**
  - Blast radius: backend utility modules and any dormant tests or roadmap carryover that still expect those functions to exist.
  - Classification: Accepted only with review.
  - Countermeasure: review each dead-code item against current DBV architecture and roadmap context before deletion; if retained, add a narrow comment-backed allow rather than a blanket file/module allow.

## Quality Contract

- id: QC-001
  category: integration
  criterion: "`npm run lint:all` passes using the existing scripts in package.json with no repo-wide lint disables added."
  verification: verifier
  command: "npm run lint:all"

- id: QC-002
  category: correctness
  criterion: "Frontend cleanup does not regress the existing Vitest suite."
  verification: verifier
  command: "npm run test:run"

- id: QC-003
  category: correctness
  criterion: "Backend cleanup does not regress the existing Rust library tests that also regenerate exported TS types."
  verification: verifier
  command: "cd src-tauri && cargo test --lib"

- id: QC-004
  category: behavior
  criterion: "Story editor and version-management fixes preserve the existing autosave/snapshot/version behaviors covered by StoryEditor, StoryVersions, and useAutoSnapshot tests."
  verification: verifier
  command: "npm run test:run -- src/features/stories/views/StoryEditor.test.tsx src/features/stories/views/StoryVersions.test.tsx src/features/stories/hooks/useAutoSnapshot.test.ts"

- id: QC-005
  category: architecture
  criterion: "Composite clickable cards/rows do not introduce nested buttons; simple standalone controls use native interactive elements with explicit button types."
  verification: reviewer

- id: QC-006
  category: behavior
  criterion: "Any retained autofocus is limited to intentional text-entry flows, while empty-state CTA buttons no longer steal initial focus unless explicitly approved."
  verification: reviewer

- id: QC-007
  category: architecture
  criterion: "Any suppression added for serde/dead_code findings is narrow, justified inline, and avoids crate-wide or repo-wide blanket allows."
  verification: reviewer

## Implementation Order

1. **Frontend bulk mechanical sweep** — add missing `type` attributes across app and story/demo code, plus trivial anchor/SVG/index-key/iterable-return fixes where the correct replacement is already clear. This lands first to cut the error count quickly.
2. **Backend warning provenance pass** — investigate the serde warning flood in the Rust model layer and decide the minimal correct remedy before broader clippy cleanup proceeds.
3. **Semantic a11y cleanup by interaction pattern** — first simple controls (`UniverseCard`, top bars, demo buttons), then composite cards/rows (`ContainerCard`, `StoryCard`, `ElementCard`, container child lists), then modal/backdrop flows and label association fixes.
4. **High-risk React/editor correctness pass** — resolve exhaustive-deps findings and remaining TS-quality warnings, using targeted story/editor tests as the guardrail.
5. **Rust manual cleanup pass** — apply `clippy --fix` format-arg updates, replace `.last()` with `.next_back()`, and resolve dead-code items per the approved policy.
6. **Regression gate** — once the branch is clean, add `.github/workflows/lint.yml` to run `npm run lint:all` on PRs/pushes so the baseline stays clean.
