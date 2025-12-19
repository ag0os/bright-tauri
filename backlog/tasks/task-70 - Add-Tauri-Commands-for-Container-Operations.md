---
id: task-70
title: Add Tauri Commands for Container Operations
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - backend
  - tauri
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expose container CRUD operations to the frontend through Tauri commands. This enables the UI to create, view, update, delete, and reorder containers in the hierarchical structure.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 create_container command exposed and callable from frontend
- [ ] #2 get_container command retrieves container by ID
- [ ] #3 list_containers command lists containers for a universe
- [ ] #4 list_container_children command returns child containers and stories
- [ ] #5 update_container command updates container fields
- [ ] #6 delete_container command deletes container with cascade and filesystem cleanup
- [ ] #7 reorder_container_children command reorders children by order field
- [ ] #8 All commands registered in generate_handler! macro
- [ ] #9 Commands return appropriate errors for invalid operations
<!-- AC:END -->
