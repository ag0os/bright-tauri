---
id: task-94
title: Add cache size limits to frontend stores
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-22 16:35'
updated_date: '2025-12-22 18:08'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create a generic LRUCache utility class in src/utils/
2. Add configurable cache size limit (default: 100 entries)
3. Implement LRU eviction using Map ordering (most recent at end)
4. Consider optional TTL tracking with timestamps
5. Update useContainersStore to use LRUCache for childrenByContainerId
6. Check useStoriesStore for similar caching patterns
7. Write tests for LRU eviction behavior
8. Commit changes
<!-- SECTION:PLAN:END -->
