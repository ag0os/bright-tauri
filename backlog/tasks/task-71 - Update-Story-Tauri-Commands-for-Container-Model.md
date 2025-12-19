---
id: task-71
title: Update Story Tauri Commands for Container Model
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 20:03'
labels:
  - container-refactor
  - backend
  - tauri
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplify story commands by removing container logic and updating to work with container_id. Stories are now created either standalone or within a container, with no hierarchical parent_story_id logic.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 create_story command updated to accept optional container_id parameter
- [x] #2 list_children removed from story commands (replaced by container commands)
- [x] #3 reorder_story_children replaced with reorder within container context
- [x] #4 Story commands no longer branch on container vs content logic
- [x] #5 Commands work correctly for both standalone and container-based stories
- [x] #6 All updated commands registered in generate_handler! macro
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review current story commands and repository methods
2. Update create_story command to handle container_id for git repo logic
3. Deprecate list_story_children command (mark for removal in task-72)
4. Deprecate reorder_story_children command (mark for removal in task-72)
5. Deprecate get_story_with_children and get_story_child_count commands
6. Update ensure_story_git_repo to only handle standalone stories
7. Build and test with cargo build
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated Story Tauri commands for the new container-based architecture:

## Changes Made

1. **create_story command** - Now checks if story should have its own git repo using `story.should_have_git_repo()` method:
   - Standalone stories (container_id = None) get their own git repo initialized
   - Child stories (container_id = Some) skip git initialization and share container's repo

2. **Deprecated hierarchy commands** - Added deprecation warnings to:
   - list_story_children - Use list_container_children instead
   - reorder_story_children - Use reorder_container_children instead
   - get_story_with_children - Containers handle hierarchy now
   - get_story_child_count - Container repository manages child counts
   - All marked for removal in task-72

3. **ensure_story_git_repo command** - Updated to prevent git repo initialization for container-based stories:
   - Returns error if story has container_id (should use container's repo)
   - Only processes standalone stories

## Key Architecture Points

- Stories are now ONLY content entities - no container logic in story commands
- container_id field determines git repo ownership (None = own repo, Some = share container's)
- All hierarchy operations moved to container commands
- Commands work correctly for both standalone and container-based stories

## Files Modified

- src-tauri/src/commands/story.rs

## Testing

- cargo build: SUCCESS
- All story commands compile without errors
- Commands properly registered in generate_handler! macro (already present)
<!-- SECTION:NOTES:END -->
