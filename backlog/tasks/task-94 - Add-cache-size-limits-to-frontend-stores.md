---
id: task-94
title: Add cache size limits to frontend stores
status: To Do
assignee: []
created_date: '2025-12-22 16:35'
labels:
  - frontend
  - performance
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The childrenByContainerId cache in useContainersStore has no TTL or size limits. In long-running sessions, this could grow unbounded. Add LRU eviction or TTL-based invalidation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Implement LRU cache eviction for childrenByContainerId
- [ ] #2 Consider adding TTL-based invalidation
- [ ] #3 Add configurable cache size limit
<!-- AC:END -->
