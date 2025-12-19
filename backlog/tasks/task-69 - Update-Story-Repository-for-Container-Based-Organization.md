---
id: task-69
title: Update Story Repository for Container-Based Organization
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 19:23'
labels:
  - container-refactor
  - backend
  - rust
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor story repository to use container_id instead of parent_story_id, removing container hierarchy logic. Stories are now organized by containers, with queries simplified to fetch stories within a container or standalone stories at universe level.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 list_children query replaced with list_by_container using container_id
- [x] #2 get_with_children method removed (containers handle hierarchy now)
- [x] #3 reorder operation updated to work within container_id context
- [x] #4 Query for standalone stories (container_id IS NULL) works correctly
- [x] #5 All container-related logic removed from story repository
- [ ] #6 Unit tests verify stories can be listed by container_id
- [ ] #7 Unit tests verify standalone stories query works correctly
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Replace list_children with list_by_container(container_id)
2. Remove get_with_children method
3. Update reorder_children to reorder_by_container(container_id, story_ids)
4. Add list_standalone_stories (container_id IS NULL)
5. Update delete method to remove recursive logic (containers handle hierarchy)
6. Remove get_child_count method (no longer needed)
7. Update unit tests to work with container-based model
8. Run cargo build and cargo test to verify changes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Completed Changes

1. **Replaced list_children with list_by_container**
   - New method: `list_by_container(db, container_id)` - queries WHERE container_id = ?
   - Returns stories ordered by "order" ASC, created_at ASC

2. **Removed get_with_children**
   - Method removed from main implementation
   - Deprecated wrapper exists for backward compatibility until task-72

3. **Updated reorder to reorder_by_container**
   - New method: `reorder_by_container(db, container_id, story_ids)`
   - Validates stories belong to container using container_id column
   - Uses transaction for atomic updates

4. **Added list_standalone_stories**
   - Queries WHERE universe_id = ? AND container_id IS NULL
   - Returns stories without containers (standalone)

5. **Removed container hierarchy logic**
   - Simplified delete() to just delete single story (no recursion)
   - Removed get_child_count() - containers handle this now
   - Updated all SELECT queries to use container_id instead of parent_story_id

6. **Backward compatibility**
   - Added deprecated wrappers for old methods (task-72 will remove these)
   - Updated delete_story command to work with new signature

### Blockers

**AC#6 and AC#7 cannot be completed** - Story model/schema mismatch

The tests fail because:
- Story model still has old fields (status, word_count, variation fields, etc.)
- Database schema was simplified in task-63 (only has: id, universe_id, container_id, story_type, title, description, content, order, git_repo_path, current_branch, staged_changes, target_word_count, created_at, updated_at)
- Story create/insert statements try to use non-existent columns

Error: "table stories has no column named status"

**Dependency**: Task-66 must complete first to simplify Story model to match schema.

### Files Modified
- `/Users/cosmos/Projects/bright-tauri/src-tauri/src/repositories/story.rs` - Updated all repository methods
- `/Users/cosmos/Projects/bright-tauri/src-tauri/src/commands/story.rs` - Fixed delete_story command signature

### Build Status
- ✅ Compiles successfully
- ❌ Tests fail due to schema mismatch (blocked by task-66)
<!-- SECTION:NOTES:END -->
