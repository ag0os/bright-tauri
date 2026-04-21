---
id: TASK-005
title: Investigate and resolve Rust serde-attribute parse warnings in model layer
status: Done
priority: high
assignee: worker
labels:
  - backend
  - 'plan:lint-baseline-cleanup'
dependencies: []
createdAt: '2026-04-21T20:22:58.269Z'
updatedAt: '2026-04-21T20:50:30.759Z'
---

## Description

Determine whether the ~260 `failed to parse serde attribute` warnings emitted by `cargo clippy` on the Rust model layer are genuine source errors or a clippy/derive false positive. Apply the minimal correct remedy:
- If attributes are wrong: fix them in source.
- If confirmed false positive: add narrow attribute- or item-level `#[allow]` with an inline comment explaining why (not module-wide or crate-wide).

Document the finding and chosen remedy clearly in the PR so the Rust manual cleanup task (Phase 5) can trust the backend lint output.

**Files in scope**: `src-tauri/src/models/universe.rs`, `src-tauri/src/models/container.rs`, `src-tauri/src/models/story.rs`, `src-tauri/src/models/story_snapshot.rs`, `src-tauri/src/models/story_version.rs`, `src-tauri/src/models/element.rs`.

<!-- AC:BEGIN -->
- [ ] #1 cd src-tauri && cargo clippy --all-targets -- -D warnings produces zero "failed to parse serde attribute" warnings for all model files listed.
- [ ] #2 If suppression was required, each #[allow] is narrow (attribute- or item-level, not module/crate/repo-wide) and carries an inline comment explaining why the warning is a confirmed false positive (QC-007).
- [ ] #3 No crate-wide or repo-wide blanket #[allow(warnings)] or equivalent has been introduced.
- [ ] #4 cd src-tauri && cargo test --lib passes (QC-003).
- [ ] #5 No Tauri command surface or exported model shape has been changed as a side effect of this investigation.
<!-- AC:END -->

## Implementation Notes

Finding: the model-layer flood was a ts-rs false positive, not broken serde source. ts-rs 10's `serde-compat` parser only understands a limited serde subset and emits `failed to parse serde attribute` for valid `skip_serializing_if`, so the warning stream was masking real backend lint work.

Chosen remedy: removed ts-rs serde parsing entirely by setting `ts-rs = { default-features = false }` in `src-tauri/Cargo.toml`, then mirrored every exported casing contract with explicit `#[ts(rename_all = ...)]` in the scoped model files. Runtime serde behavior is preserved with existing serde attrs plus `serde_with::skip_serializing_none` on serializable structs; meaningless `skip_serializing_if` attrs were removed from Deserialize-only input structs.

Scope verified: `cargo clippy --all-targets -- -D warnings` now emits zero `failed to parse serde attribute` warnings; `cargo test --lib` passes; `git diff -- src/types` is empty, so exported TS shapes did not change; no Tauri command surface changed. Remaining clippy failures after this task are unrelated manual cleanup items (dead_code / format-args / iterator-last), so TASK-010 can trust the backend lint output with the serde-noise removed.

Commit: `eb601fe` (`TASK-005: Stop ts-rs serde parse warning flood`).
