---
id: task-55
title: 'Phase 2.2: Update navigation routes for variation terminology'
status: To Do
assignee: []
created_date: '2025-12-15 17:08'
labels:
  - frontend
  - versioning
dependencies:
  - task-53
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the navigation store routes to use variation/compare/combine terminology instead of Git terminology
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Rename route 'story-branches' to 'story-variations'
- [ ] #2 Rename route 'story-diff' to 'story-compare'
- [ ] #3 Rename route 'story-merge' to 'story-combine'
- [ ] #4 Update all navigate() calls throughout the codebase to use new route names
- [ ] #5 Update route type definitions in useNavigationStore.ts
<!-- AC:END -->
