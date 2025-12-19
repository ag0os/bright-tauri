---
id: task-68
title: Create Container Repository with Nesting and Leaf Protection
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
Implement CRUD operations for containers with support for hierarchical nesting, filesystem cleanup on deletion, and leaf protection validation. Leaf containers (containing stories) cannot have child containers added to prevent breaking the git repo structure.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Container repository created in src-tauri/src/repositories/container.rs
- [ ] #2 CRUD operations implemented: create, find_by_id, list_by_universe, list_children, update, delete
- [ ] #3 reorder_children operation allows reordering child containers by order field
- [ ] #4 Leaf protection validation: create rejects adding child container to parent that has stories with clear error message
- [ ] #5 Delete operation removes git repo directory from filesystem if git_repo_path is set
- [ ] #6 Cascading delete removes all child containers when parent is deleted
- [ ] #7 Unit tests verify nested container queries return correct hierarchies
- [ ] #8 Unit tests verify leaf protection validation blocks invalid nesting
- [ ] #9 Unit tests verify filesystem cleanup on deletion
<!-- AC:END -->
