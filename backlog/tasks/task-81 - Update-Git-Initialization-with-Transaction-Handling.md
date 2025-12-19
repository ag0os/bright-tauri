---
id: task-81
title: Update Git Initialization with Transaction Handling
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - backend
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update git repository initialization to create repos for leaf containers and standalone stories, with atomic transaction handling. Git repo creation must be atomic with database operations, rolling back DB changes if git initialization fails.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Leaf containers (containing only stories) get git repos initialized
- [ ] #2 Standalone stories (no container_id) get own git repos initialized
- [ ] #3 Non-leaf containers (with child containers) do not get git repos
- [ ] #4 Child stories (with container_id) do not get git repos
- [ ] #5 Transaction sequence: 1) Insert DB, 2) Init git, 3) Update git_repo_path
- [ ] #6 On git init failure: DB insert rolled back, error returned to user
- [ ] #7 On path update failure: git repo directory deleted, DB rolled back, error returned
- [ ] #8 Unit tests verify correct entities receive git repos
- [ ] #9 Unit tests verify rollback behavior on failures
<!-- AC:END -->
