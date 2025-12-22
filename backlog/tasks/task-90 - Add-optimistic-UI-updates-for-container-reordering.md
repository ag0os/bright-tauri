---
id: task-90
title: Add optimistic UI updates for container reordering
status: To Do
assignee: []
created_date: '2025-12-22 16:30'
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
