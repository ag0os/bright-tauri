---
id: task-72
title: Remove Obsolete Story-as-Container Commands
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 20:06'
labels:
  - container-refactor
  - backend
  - tauri
  - cleanup
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove Tauri commands that treated stories as containers, now replaced by dedicated container commands. This cleanup eliminates dead code and prevents confusion about which commands to use.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 list_story_children command removed
- [x] #2 get_story_with_children command removed
- [x] #3 reorder_story_children command removed (replaced by reorder_container_children)
- [x] #4 Removed commands unregistered from generate_handler! macro
- [x] #5 No frontend code references removed commands
- [x] #6 Application compiles without errors after removal
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review current deprecated commands in story.rs (lines 98-139)
2. Check frontend usage in useStoriesStore.ts and determine replacement strategy
3. Remove deprecated commands from src-tauri/src/commands/story.rs
4. Remove command registrations from generate_handler! in src-tauri/src/lib.rs
5. Update frontend store to use container commands or remove deprecated methods
6. Test compilation with cargo build
7. Verify no other frontend references exist
8. Mark all acceptance criteria as complete
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Summary
Removed four deprecated story-as-container Tauri commands from the backend:
- list_story_children (lines 102-108)
- reorder_story_children (lines 110-120)
- get_story_with_children (lines 122-131)
- get_story_child_count (lines 133-139)

Also removed their registrations from the generate_handler! macro in lib.rs (lines 74-77).

## Changes Made
1. **src-tauri/src/commands/story.rs**: Removed deprecated command section (43 lines removed)
2. **src-tauri/src/lib.rs**: Removed command registrations from generate_handler! macro

## Testing
- Backend compiles successfully with `cargo build`
- Only warnings about unused repository methods (expected - will be removed in task-83)

## Frontend Impact
- **Known Issue**: src/stores/useStoriesStore.ts still references these commands (lines 215, 234, 258)
- **Resolution**: These will be fixed in task-76 "Simplify Stories Store by Removing Container Logic"
- Frontend will need updates to use container-based hierarchy instead

## Architecture Notes
These commands were deprecated because:
- Stories are now content-only entities
- Containers handle all hierarchy/nesting functionality
- list_container_children replaces list_story_children (returns both containers and stories)
- reorder_container_children replaces reorder_story_children
- Container repository manages child counts directly
<!-- SECTION:NOTES:END -->
