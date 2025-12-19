---
id: task-76
title: Simplify Stories Store by Removing Container Logic
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - frontend
  - state
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor the stories Zustand store to remove container-related state and logic. Stories are now organized by containers, with the store simplified to manage only story content and loading states.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 childrenByParentId state removed (moved to containers store)
- [ ] #2 loadStories action updated to filter by container_id
- [ ] #3 CONTAINER_TYPES checks removed from store logic
- [ ] #4 Container-related actions removed (moved to containers store)
- [ ] #5 Store only manages story content state (loading, creation, updates)
- [ ] #6 Story reordering works within container context
- [ ] #7 Store correctly handles both standalone and container-based stories
<!-- AC:END -->
