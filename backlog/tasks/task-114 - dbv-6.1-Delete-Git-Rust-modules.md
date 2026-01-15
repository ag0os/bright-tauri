---
id: task-114
title: 'dbv-6.1: Delete Git Rust modules'
status: To Do
assignee: []
created_date: '2026-01-15 13:39'
labels:
  - dbv
  - backend
  - rust
  - cleanup
dependencies:
  - task-108
  - task-109
  - task-110
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove all Git-related Rust code after Phase 4 editor is verified working. This includes git.rs, file_management.rs, and commands/git.rs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 src-tauri/src/git.rs deleted (~700 lines)
- [ ] #2 src-tauri/src/file_management.rs deleted
- [ ] #3 src-tauri/src/commands/git.rs deleted
- [ ] #4 Git modules removed from lib.rs imports
- [ ] #5 Git commands removed from invoke_handler registration
- [ ] #6 Code compiles without errors
<!-- AC:END -->
