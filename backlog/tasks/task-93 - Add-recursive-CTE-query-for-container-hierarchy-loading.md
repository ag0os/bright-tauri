---
id: task-93
title: Add recursive CTE query for container hierarchy loading
status: Done
assignee:
  - '@agent'
created_date: '2025-12-22 16:35'
updated_date: '2025-12-22 18:10'
labels:
  - backend
  - performance
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Loading container hierarchies requires separate DB queries per level, causing N+1 query problem for deep hierarchies. Add optional recursive CTE query to load full subtree in single query.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Implement recursive CTE query for loading full container subtree
- [x] #2 Add repository method for bulk hierarchy loading
- [x] #3 Benchmark performance improvement vs current approach
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add get_subtree() method using recursive CTE query
2. Add optional depth limit parameter to prevent unbounded recursion
3. Write comprehensive tests comparing performance
4. Document performance benefits and usage examples
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented recursive CTE query for efficient container hierarchy loading.

Implementation Details:
- Added ContainerRepository::get_subtree(container_id, max_depth) method
- Uses SQL recursive CTE to load entire subtree in single query
- Supports optional depth limiting parameter
- Returns containers ordered by hierarchy level and order field

Recursive CTE Query:
```sql
WITH RECURSIVE subtree AS (
  SELECT * FROM containers WHERE id = ?
  UNION ALL
  SELECT c.* FROM containers c
  JOIN subtree s ON c.parent_container_id = s.id
)
SELECT * FROM subtree ORDER BY "order" ASC
```

Performance Benchmark (15-container hierarchy, 4 levels deep):
- Single CTE query: 126.792µs
- Multiple queries (N+1): 423.75µs
- Performance improvement: 3.34x faster
- Query reduction: 1 query vs 15 queries

Test Coverage:
- Single container (no children)
- Two-level hierarchy
- Three-level hierarchy
- Complex multi-branch hierarchy
- Depth limiting (0, 1, 2 levels)
- Non-existent container handling
- Performance comparison benchmark

All 224 library tests pass including 7 new tests for get_subtree.
<!-- SECTION:NOTES:END -->
