---
id: task-53
title: 'Phase 1.4: Update branch Tauri commands for variation abstraction'
status: To Do
assignee: []
created_date: '2025-12-15 17:08'
updated_date: '2025-12-15 17:15'
labels:
  - backend
  - versioning
dependencies:
  - task-51
  - task-52
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify existing git_* Tauri commands to work with variation display names instead of raw branch names
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Update git_create_branch to accept display_name, generate slug, save mapping, create branch
- [ ] #2 Update git_list_branches to return Vec<VariationInfo> with display names from metadata
- [ ] #3 Update git_get_current_branch to return VariationInfo instead of just branch name
- [ ] #4 Update git_merge_branches to work with slugs and return user-friendly messages
- [ ] #5 Generate TypeScript types with cargo test --lib

- [ ] #6 Update git_checkout_branch to accept slug; frontend always passes slug (looked up from VariationInfo)
<!-- AC:END -->
