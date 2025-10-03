---
id: task-15
title: Add Tauri commands for Git operations
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
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
- [ ] #1 git_init_repo command wraps GitService::init_repo
- [ ] #2 git_commit_file and git_commit_all commands wrap commit methods
- [ ] #3 git_create_branch and git_checkout_branch commands wrap branch operations
- [ ] #4 git_diff_branches and git_merge_branches commands wrap diff/merge
- [ ] #5 git_get_history and git_restore_commit commands wrap history methods
- [ ] #6 All commands have proper error handling and return Result types
- [ ] #7 Commands are registered in Tauri generate_handler
- [ ] #8 TypeScript types are generated for all commands
<!-- AC:END -->
