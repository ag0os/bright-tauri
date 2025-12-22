---
id: task-88
title: Handle empty non-leaf container edge case
status: To Do
assignee: []
created_date: '2025-12-22 16:30'
labels:
  - backend
  - architecture
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Edge case identified in PR review: If a container has child containers (becomes non-leaf, no git repo), then all children are deleted, the container is left in limbo - can't have stories without git initialization. Consider adding a command to convert container to leaf by initializing git repo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Detect containers that are non-leaf but have no children
- [ ] #2 Add command or automatic handling to initialize git repo for empty containers
- [ ] #3 Add UI prompt or automatic conversion when applicable
<!-- AC:END -->
