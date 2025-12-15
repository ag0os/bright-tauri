---
id: task-51
title: 'Phase 1.2: Update git_init_repo to use ''original'' branch'
status: Done
assignee:
  - '@claude'
created_date: '2025-12-15 17:08'
updated_date: '2025-12-15 17:31'
labels:
  - backend
  - versioning
dependencies:
  - task-50
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Change default branch from 'main' to 'original' for new story repos. Handle backward compatibility with existing repos.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Modify git_init_repo to create 'original' as default branch instead of 'main'
- [x] #2 Initialize variations mapping with 'original' -> 'Original' on repo creation
- [x] #3 Add migration detection: if 'main' exists and 'original' doesn't, treat 'main' as original
- [x] #4 Test new repo creation uses 'original' branch
- [x] #5 Test existing repos with 'main' still work correctly
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modify git_init_repo to create "original" branch instead of "main"
2. Update write_metadata_file to initialize variations mapping on first write
3. Add helper function to get canonical branch name (original or main fallback)
4. Update list_branches and get_current_branch for backward compatibility
5. Write comprehensive unit tests for new and existing repos
6. Run all tests to ensure no regressions
7. Commit changes with descriptive message
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented 'original' branch support and backward compatibility:

**Changes to git.rs:**
1. init_repo now renames the default branch to "original" after initial commit (lines 166-174)
2. Added get_original_branch() helper that returns "original" if it exists, else "main" for backward compatibility (lines 640-668)

**Changes to file_management.rs:**
1. write_metadata_file() initializes variations with "original" -> "Original" mapping on first creation (lines 293-296)

**Backward Compatibility:**
- Existing repos with "main" branch still work - get_original_branch() falls back to "main"
- list_variations() marks both "original" and "main" as is_original=true

All 143 tests pass.
<!-- SECTION:NOTES:END -->
