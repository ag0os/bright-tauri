---
id: task-15
title: Add Tauri commands for Git operations
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:20'
labels:
  - backend
  - git
  - tauri
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Tauri commands that expose Git operations to the frontend: initializing repos, committing, branching, diffing, merging, and browsing history. These commands bridge GitService to the UI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 git_init_repo command wraps GitService::init_repo
- [x] #2 git_commit_file and git_commit_all commands wrap commit methods
- [x] #3 git_create_branch and git_checkout_branch commands wrap branch operations
- [x] #4 git_diff_branches and git_merge_branches commands wrap diff/merge
- [x] #5 git_get_history and git_restore_commit commands wrap history methods
- [x] #6 All commands have proper error handling and return Result types
- [x] #7 Commands are registered in Tauri generate_handler
- [x] #8 TypeScript types are generated for all commands
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create commands/git.rs with Tauri command wrappers for all GitService methods
2. Update commands/mod.rs to expose git module
3. Register all git commands in lib.rs invoke_handler
4. Generate TypeScript types using cargo test --lib
5. Verify compilation and test commands
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added Tauri command wrappers for all GitService methods in commands/git.rs:
- git_init_repo: Initialize repository for a story
- git_commit_file: Commit specific file with content
- git_commit_all: Commit all changes
- git_create_branch: Create new branch from parent
- git_checkout_branch: Switch to a branch
- git_diff_branches: Get diff between two branches
- git_merge_branches: Merge branches with conflict detection
- git_get_history: Get commit history
- git_restore_commit: Restore to specific commit

Updated git.rs data structures with Serialize, Deserialize, and TS derives:
- FileChange, ChangeStatus, DiffResult, MergeResult, CommitInfo

Registered all 9 Git commands in lib.rs invoke_handler.

Generated TypeScript types for all Git data structures in src/types/.

All commands follow error handling pattern: Result<T, String> with .map_err(|e| e.to_string()).

Compilation successful with 69 tests passing.
<!-- SECTION:NOTES:END -->
