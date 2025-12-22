---
id: task-90
title: Add optimistic UI updates for container reordering
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-22 16:30'
updated_date: '2025-12-22 18:08'
labels:
  - frontend
  - ux
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ContainerView reorder handlers send requests to backend but don't optimistically update the UI, making it feel sluggish. Should add optimistic updates with rollback on error.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implement optimistic update in handleMoveContainerUp/Down
- [ ] #2 Revert optimistic change on backend error
- [ ] #3 Show user-friendly error message on failure
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add optimistic reorder function to useContainersStore
2. Update ContainerView handlers to use optimistic updates
3. Implement error handling with rollback
4. Add user-friendly error notifications
5. Write tests for optimistic update and rollback
6. Test the implementation manually
<!-- SECTION:PLAN:END -->
