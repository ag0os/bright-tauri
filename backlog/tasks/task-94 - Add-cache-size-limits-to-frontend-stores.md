---
id: task-94
title: Add cache size limits to frontend stores
status: Done
assignee:
  - '@agent'
created_date: '2025-12-22 16:35'
updated_date: '2025-12-22 18:15'
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
- [x] #1 Implement LRU cache eviction for childrenByContainerId
- [x] #2 Consider adding TTL-based invalidation
- [x] #3 Add configurable cache size limit
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented LRU cache with configurable size limits and TTL for the childrenByContainerId cache in useContainersStore.

Implementation:
- Created LRUCache utility class in src/utils/LRUCache.ts
- Replaced Record-based childrenByContainerId with LRUCache instance
- Configured with maxSize: 100 entries and TTL: 5 minutes
- Updated all cache access methods (get, set, delete, iteration)
- Automatic eviction of least recently used entries when cache is full
- Automatic expiration of entries older than TTL

Testing:
- Created comprehensive test suite for LRUCache (21 tests)
- Updated useContainersStore tests to work with LRU cache (5 tests)
- All 26 tests passing

Benefits:
- Prevents unbounded memory growth in long-running sessions
- Automatic cache management without manual intervention
- Configurable limits allow easy tuning for different use cases
- TTL ensures stale data is automatically removed

Note: This work was completed as part of task-90 (optimistic UI updates) which required updating the cache structure to support rollback on errors.
<!-- SECTION:NOTES:END -->
