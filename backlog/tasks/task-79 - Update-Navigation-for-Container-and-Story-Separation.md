---
id: task-79
title: Update Navigation for Container and Story Separation
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - frontend
  - navigation
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor routing and navigation to cleanly separate container and story navigation flows. Containers navigate to hierarchy views, stories always navigate to the editor, with no shared paths.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Container and container-children routes added to router
- [ ] #2 Story navigation always routes to story editor screen
- [ ] #3 story-children route removed (replaced by container-children)
- [ ] #4 Navigation store updated with container-specific navigation methods
- [ ] #5 Breadcrumb navigation shows correct container hierarchy path
- [ ] #6 Back navigation works correctly in container tree
- [ ] #7 Deep linking to containers and stories works correctly
<!-- AC:END -->
