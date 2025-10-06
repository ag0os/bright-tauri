---
id: task-18
title: Implement file reordering and renaming
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:50'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create functionality to rename child story files when reordering occurs. When chapters are reordered, update the order prefix in filenames (001- to 003-, etc.) and commit the renames to Git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Function accepts parent repo path and ordered list of stories
- [x] #2 Function generates new filenames based on new order
- [x] #3 Function uses Git mv operation to rename files
- [x] #4 Function updates story records with new file paths
- [x] #5 Function commits the reordering to Git with descriptive message
- [x] #6 Function handles errors if files don't exist or Git operation fails
- [x] #7 Unit tests verify file renaming and order updates
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add reorder_story_files function to file_management.rs
2. Function accepts repo_path and list of (current_filename, new_order, title) tuples
3. For each file, generate new filename based on new order
4. Use git2 Repository.rename to perform Git mv operation
5. Build commit message listing all renames
6. Commit the reordering with GitService::commit_all
7. Return Vec of (old_filename, new_filename) pairs
8. Add error handling for missing files and Git failures
9. Write comprehensive unit tests
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Extended file_management.rs with file reordering functionality:

New data structures:
- StoryFileToReorder struct: current_filename, new_order, title
- FileRename struct: old_filename, new_filename (PartialEq for testing)

reorder_story_files function:
- Signature: reorder_story_files(repo_path: &Path, stories: &[StoryFileToReorder]) -> FileManagementResult<Vec<FileRename>>
- Opens Git repository to verify it exists
- Determines which files need renaming by comparing current vs new filenames
- Returns early if no renames needed (empty Vec)
- Uses two-phase rename strategy to avoid conflicts:
  - Phase 1: Rename all files to temporary names (temp-{filename})
  - Phase 2: Rename from temporary names to final names
- This prevents conflicts when swapping files (e.g., 001 ↔ 003)
- Builds descriptive commit message listing all renames
- Uses GitService::commit_all to commit all changes
- Returns Vec of FileRename showing what changed

Error handling:
- Returns FileManagementError::Io(NotFound) if file doesn't exist\n- Propagates Git errors through error chain\n\nAdded 5 comprehensive unit tests:\n- Basic reordering (swap first and third)\n- No-op reordering (same positions)\n- Git commit verification\n- File not found error handling\n- Complex reordering (reverse 5 files)\n\nAll 11 file_management tests passing (6 create + 5 reorder).
<!-- SECTION:NOTES:END -->
