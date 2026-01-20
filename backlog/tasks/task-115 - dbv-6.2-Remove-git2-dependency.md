---
id: task-115
title: 'dbv-6.2: Remove git2 dependency'
status: To Do
assignee: []
created_date: '2026-01-15 13:40'
labels:
  - dbv
  - backend
  - rust
  - cleanup
dependencies:
  - task-114
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove the git2 crate dependency from Cargo.toml after Git code is deleted.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 git2 line removed from src-tauri/Cargo.toml dependencies
- [x] #2 cargo build succeeds without git2
- [x] #3 Binary size reduced (git2 is a large dependency)
<!-- AC:END -->
