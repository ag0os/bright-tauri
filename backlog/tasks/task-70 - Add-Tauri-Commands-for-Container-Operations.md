---
id: task-70
title: Add Tauri Commands for Container Operations
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 19:48'
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
- [x] #1 create_container command exposed and callable from frontend
- [x] #2 get_container command retrieves container by ID
- [x] #3 list_containers command lists containers for a universe
- [x] #4 list_container_children command returns child containers and stories
- [x] #5 update_container command updates container fields
- [x] #6 delete_container command deletes container with cascade and filesystem cleanup
- [x] #7 reorder_container_children command reorders children by order field
- [x] #8 All commands registered in generate_handler! macro
- [x] #9 Commands return appropriate errors for invalid operations
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create input types in src-tauri/src/models/container.rs (CreateContainerInput, UpdateContainerInput, ContainerChildren)
2. Export input types from models/mod.rs
3. Create src-tauri/src/commands/container.rs with all 7 Tauri commands
4. Update commands/mod.rs to export container commands
5. Register commands in lib.rs generate_handler!
6. Test with cargo build
7. Generate TypeScript types with cargo test --lib
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Implementation Summary

## Files Created
- src-tauri/src/commands/container.rs - All 8 Tauri commands for container operations

## Files Modified
- src-tauri/src/models/container.rs - Added CreateContainerInput, UpdateContainerInput, and ContainerChildren types
- src-tauri/src/models/mod.rs - Exported new input types
- src-tauri/src/commands/mod.rs - Exported container commands
- src-tauri/src/lib.rs - Registered all 8 commands in generate_handler!

## Commands Implemented
1. create_container - Creates a new container with optional parent
2. get_container - Retrieves container by ID
3. list_containers - Lists all containers for a universe
4. list_container_children - Returns both child containers and stories in one call
5. update_container - Updates container fields (title, description, type, order)
6. delete_container - Deletes container with cascade and filesystem cleanup
7. reorder_container_children - Reorders children by updating order field
8. ensure_container_git_repo - Bonus command for lazy Git initialization (similar to ensure_story_git_repo)

## TypeScript Types Generated
- Container.ts (already existed)
- ContainerChildren.ts (new)
- CreateContainerInput.ts (new)
- UpdateContainerInput.ts (new)

## Error Handling
- All commands return Result<T, String> for proper error propagation
- Leaf protection validation handled in repository layer
- Git repo cleanup handled gracefully on deletion

## Testing
- cargo build ✅ (successful with warnings about unused methods)
- cargo test --lib ✅ (container tests pass, TypeScript types generated)
- All acceptance criteria met ✅
<!-- SECTION:NOTES:END -->
