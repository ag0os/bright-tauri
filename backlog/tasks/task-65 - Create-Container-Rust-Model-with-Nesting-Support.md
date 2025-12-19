---
id: task-65
title: Create Container Rust Model with Nesting Support
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - backend
  - rust
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a new Container struct to represent organizational entities (novels, series, collections) that can nest and contain either child containers or stories. This separates organizational concerns from content, eliminating the current conflation in the Story model.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Container struct created in src-tauri/src/models/container.rs with all required fields
- [ ] #2 Fields include: id, universe_id, parent_container_id, container_type, title, description, order, git_repo_path, current_branch, staged_changes, timestamps
- [ ] #3 is_leaf() method correctly identifies containers containing only stories (no child containers)
- [ ] #4 should_have_git_repo() method returns true only for leaf containers
- [ ] #5 Container derives TS for TypeScript type generation
- [ ] #6 Unit tests verify is_leaf() logic works correctly
<!-- AC:END -->
