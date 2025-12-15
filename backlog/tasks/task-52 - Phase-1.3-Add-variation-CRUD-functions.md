---
id: task-52
title: 'Phase 1.3: Add variation CRUD functions'
status: In Progress
assignee:
  - '@claude'
created_date: '2025-12-15 17:08'
updated_date: '2025-12-15 17:36'
labels:
  - backend
  - versioning
dependencies:
  - task-50
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Rust functions for managing variation name mappings in metadata.json
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Add save_variation_mapping(repo_path, slug, display_name) function
- [x] #2 Add get_variation_display_name(repo_path, slug) -> Option<String> function
- [x] #3 Add list_variations(repo_path) -> Vec<VariationInfo> function returning slug, display_name, is_current, is_original
- [x] #4 Add remove_variation_mapping(repo_path, slug) function for branch deletion
- [x] #5 Create VariationInfo struct with ts-rs export

- [x] #6 Handle missing metadata: return empty Vec for list, return slug as display name if mapping missing, auto-create variations field if absent
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create VariationInfo struct with ts-rs export
2. Implement save_variation_mapping() to add/update variation in metadata.json
3. Implement get_variation_display_name() to retrieve display name from metadata
4. Implement list_variations() to list all variations with their info
5. Implement remove_variation_mapping() to remove variation from metadata
6. Add unit tests for all functions
7. Generate TypeScript types with cargo test --lib
8. Commit changes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented all variation CRUD functions in file_management.rs:

**VariationInfo Struct:**
- Created with slug, display_name, is_current, is_original fields
- Exported to TypeScript with ts-rs
- Located at src/types/VariationInfo.ts

**Functions Implemented:**
1. save_variation_mapping(repo_path, slug, display_name) - Adds/updates variation in metadata.json and commits to Git
2. get_variation_display_name(repo_path, slug) -> String - Returns display name or slug as fallback
3. list_variations(repo_path) -> Vec<VariationInfo> - Lists all branches with metadata, handles missing metadata gracefully
4. remove_variation_mapping(repo_path, slug) - Removes variation from metadata.json and commits

**Key Design Decisions:**
- All functions handle missing metadata gracefully (list_variations returns empty HashMap)
- Display name fallback: if mapping not found, return slug itself
- is_original checks for both "original" AND "main" for backward compatibility
- All mutations commit changes to Git with descriptive messages
- Tests account for Git init_repo renaming initial branch to "original"

**Testing:**
- 16 comprehensive unit tests covering all functions and edge cases
- All 143 tests pass (38 in file_management module)
- TypeScript types generated successfully
<!-- SECTION:NOTES:END -->
