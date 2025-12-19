---
id: task-82
title: Implement Leaf Protection Validation (PREVENT Approach)
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - backend
  - validation
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Prevent adding child containers to leaf containers that already have stories. This validation keeps git repo structure simple and avoids complex migrations. The PREVENT approach rejects invalid operations with clear error messages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Validation added to container repository create method
- [ ] #2 When creating child container: check if parent has stories
- [ ] #3 If parent has stories: reject with error 'Cannot add child container to a container that already has stories'
- [ ] #4 Adding child container to empty container: allowed (becomes non-leaf)
- [ ] #5 Container losing all child containers: remains non-leaf (no automatic git repo creation)
- [ ] #6 Error messages clearly explain why operation was blocked
- [ ] #7 Unit tests verify validation blocks invalid nesting
- [ ] #8 Unit tests verify allowed operations work correctly
<!-- AC:END -->
