---
id: task-66
title: Simplify Story Model to Content-Only Entity
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 19:10'
labels:
  - container-refactor
  - backend
  - rust
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove container-related logic from the Story struct so it purely represents written content. Stories will either be standalone (with own git repo) or belong to a container (sharing parent's repo). This eliminates conditional container/content branching throughout the codebase.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 parent_story_id field removed from Story struct
- [x] #2 container_id field added as Option<String>
- [x] #3 story_type remains as optional label for categorization
- [x] #4 should_have_git_repo() simplified to check only if container_id is None
- [x] #5 Container-related methods and logic removed from Story
- [x] #6 Unit tests verify standalone stories identified correctly (container_id is None)
- [x] #7 Unit tests verify child stories identified correctly (container_id is Some)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Remove parent_story_id field from Story struct and related tests
2. Add container_id: Option<String> field
3. Simplify should_have_git_repo() to only check container_id.is_none()
4. Remove StoryType enum container variants (Novel, Series, Screenplay, Collection)
5. Update CreateStoryInput and UpdateStoryInput to use container_id
6. Update all tests to use container_id instead of parent_story_id
7. Add new tests for standalone vs child story identification
8. Run cargo build and cargo test to verify changes
9. Generate TypeScript types with cargo test --lib
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully simplified Story model to content-only entity:

Changes Made:
1. Removed parent_story_id field from Story struct
2. Added container_id: Option<String> field to link stories to containers
3. Simplified should_have_git_repo() to check only container_id.is_none()
4. Removed container StoryType variants (Novel, Series, Screenplay, Collection)
5. Updated StoryType to include only content types: Chapter, ShortStory, Scene, Episode, Poem, Outline, Treatment
6. Updated CreateStoryInput to use container_id instead of parent_story_id
7. Fixed all Story model unit tests (7 tests passing)
8. Updated file_management.rs test helper to use new model
9. Updated story repository tests (some failing due to DB schema mismatch - expected, will be fixed in task-63)
10. Generated TypeScript types with containerId field

Files Modified:
- src-tauri/src/models/story.rs - Core model changes
- src-tauri/src/repositories/story.rs - Repository layer updates
- src-tauri/src/file_management.rs - Test helper updates
- src/types/Story.ts - Auto-generated TypeScript types
- src/types/StoryType.ts - Auto-generated enum

Test Results:
- Story model tests: 7/7 passing
- Repository tests: Some failing (expected - DB schema not yet migrated)
- Next step: Database migration in task-63
<!-- SECTION:NOTES:END -->
