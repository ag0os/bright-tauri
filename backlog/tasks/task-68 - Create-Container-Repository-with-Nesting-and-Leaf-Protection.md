---
id: task-68
title: Create Container Repository with Nesting and Leaf Protection
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 19:17'
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
- [x] #1 Container repository created in src-tauri/src/repositories/container.rs
- [x] #2 CRUD operations implemented: create, find_by_id, list_by_universe, list_children, update, delete
- [x] #3 reorder_children operation allows reordering child containers by order field
- [x] #4 Leaf protection validation: create rejects adding child container to parent that has stories with clear error message
- [x] #5 Delete operation removes git repo directory from filesystem if git_repo_path is set
- [x] #6 Cascading delete removes all child containers when parent is deleted
- [x] #7 Unit tests verify nested container queries return correct hierarchies
- [x] #8 Unit tests verify leaf protection validation blocks invalid nesting
- [x] #9 Unit tests verify filesystem cleanup on deletion
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Examine existing repository patterns from story.rs
2. Review Container model and database schema
3. Create container.rs with ContainerRepository struct
4. Implement CRUD operations: create, find_by_id, list_by_universe, list_children, update, delete
5. Implement reorder_children with transaction support
6. Implement leaf protection validation in create method
7. Implement filesystem cleanup in delete method using std::fs::remove_dir_all
8. Add map_row_to_container helper function
9. Write comprehensive unit tests for all operations
10. Test with cargo build and cargo test
11. Update mod.rs to export ContainerRepository
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully implemented ContainerRepository with comprehensive CRUD operations and special features:

**Key Implementation Details:**
- Created container.rs following StoryRepository patterns for consistency
- Implemented all CRUD operations: create, find_by_id, list_by_universe, list_children, update, delete
- Implemented reorder_children with transaction support and parent validation
- Added leaf protection in create method that checks story count before allowing child containers
- Implemented recursive delete with filesystem cleanup using std::fs::remove_dir_all for git repos
- Added helper methods: get_story_count (private), set_git_repo_path, set_current_branch, map_row_to_container
- Used proper error handling with InvalidParameterName for leaf protection violations
- Added comprehensive test suite with 14 tests covering all functionality

**Files Modified:**
- Created: src-tauri/src/repositories/container.rs (650+ lines)
- Modified: src-tauri/src/repositories/mod.rs (added container module export)

**Test Results:**
- All 14 tests pass successfully
- Tests cover: basic CRUD, nested hierarchies, leaf protection, reorder, cascading delete, filesystem cleanup

**Leaf Protection (PREVENT Approach):**
- When creating a container with parent_container_id, checks if parent has stories
- Returns clear error message if stories exist: "Cannot add child container to a container that already has stories"
- Prevents breaking existing git repo structure

**Delete with Filesystem Cleanup:**
- Recursively deletes all child containers
- Checks for git_repo_path and removes directory from filesystem if it exists
- Continues even if filesystem cleanup fails (logs warning)
- Returns list of all deleted container IDs

**Ready for Task-70:** Container Tauri commands can now be implemented using this repository layer.
<!-- SECTION:NOTES:END -->
