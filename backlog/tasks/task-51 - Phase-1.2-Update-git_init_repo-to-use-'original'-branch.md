---
id: task-51
title: 'Phase 1.2: Update git_init_repo to use ''original'' branch'
status: In Progress
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
- [ ] #1 Modify git_init_repo to create 'original' as default branch instead of 'main'
- [ ] #2 Initialize variations mapping with 'original' -> 'Original' on repo creation
- [ ] #3 Add migration detection: if 'main' exists and 'original' doesn't, treat 'main' as original
- [ ] #4 Test new repo creation uses 'original' branch
- [ ] #5 Test existing repos with 'main' still work correctly
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
