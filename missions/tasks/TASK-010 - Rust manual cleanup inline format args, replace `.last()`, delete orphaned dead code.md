---
id: TASK-010
title: >-
  Rust manual cleanup: inline format args, replace `.last()`, delete orphaned
  dead code
status: Done
priority: medium
assignee: worker
labels:
  - backend
  - 'plan:lint-baseline-cleanup'
dependencies:
  - TASK-005
createdAt: '2026-04-21T20:24:02.643Z'
updatedAt: '2026-04-21T21:02:06.982Z'
---

## Description

After the serde investigation (TASK-005) is complete and backend lint output is trustworthy, apply the remaining Rust cleanup in two steps:

**Auto-fixable (cargo clippy --fix)**:
- `uninlined_format_args` across `repositories/universe.rs`, `repositories/story.rs`, `repositories/element.rs`, `commands/container.rs`, `lib.rs`.

**Manual**:
- Replace `.last()` with `.next_back()` in `src-tauri/src/services/story_version_service.rs:50`.
- Resolve dead-code items in `file_naming.rs`, `db/connection.rs`, `db/migrations.rs`, and `models/element.rs` per the approved policy: **delete** if truly unused. If a specific item has a documented near-term consumer, add a narrow `#[allow(dead_code)]` with an inline comment and **explicitly flag the item in the PR description for human review before merge** — do not silently allow.

**Files in scope**: `src-tauri/src/services/story_version_service.rs`, `src-tauri/src/file_naming.rs`, `src-tauri/src/db/connection.rs`, `src-tauri/src/db/migrations.rs`, `src-tauri/src/models/element.rs`, `src-tauri/src/repositories/universe.rs`, `src-tauri/src/repositories/story.rs`, `src-tauri/src/repositories/element.rs`, `src-tauri/src/commands/container.rs`, `src-tauri/src/lib.rs`.

<!-- AC:BEGIN -->
- [ ] #1 cd src-tauri && cargo clippy --all-targets -- -D warnings passes with no uninlined_format_args, iter_last (or equivalent .last()-on-double-ended-iterator), or dead_code warnings in the listed files.
- [ ] #2 .last() in story_version_service.rs is replaced with .next_back() or an equivalent that satisfies clippy.
- [ ] #3 Dead-code items are deleted if they have no current consumer; any retained item has a narrow #[allow(dead_code)] with an inline justification comment and is listed in the PR description for human review before merge (QC-007).
- [ ] #4 No crate-wide or repo-wide blanket #[allow] has been introduced.
- [ ] #5 cd src-tauri && cargo test --lib passes (QC-003).
<!-- AC:END -->

## Implementation Notes

Completed and committed as b412d73. cargo clippy --all-targets -- -D warnings passes in src-tauri, cargo test --lib passes (160/160), and npm run lint:rust passes. Kept the existing narrow #[allow(dead_code)] on src-tauri/src/models/element.rs:114 because related_story_ids is still part of the frontend update payload; no crate-wide or repo-wide allow was added. In-scope cleanup removed the orphaned file_naming module, deleted unused Database query helpers and standalone-story/reorder helpers, removed the unused schema version constant, inlined the container format arg, and replaced .last() with .next_back().
