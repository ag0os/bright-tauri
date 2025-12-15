---
id: task-51
title: 'Phase 1.2: Update git_init_repo to use ''original'' branch'
status: To Do
assignee: []
created_date: '2025-12-15 17:08'
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
