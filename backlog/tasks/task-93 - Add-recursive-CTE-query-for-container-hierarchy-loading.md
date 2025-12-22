---
id: task-93
title: Add recursive CTE query for container hierarchy loading
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-22 16:35'
updated_date: '2025-12-22 18:08'
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
- [ ] #1 Implement recursive CTE query for loading full container subtree
- [ ] #2 Add repository method for bulk hierarchy loading
- [ ] #3 Benchmark performance improvement vs current approach
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add get_subtree() method using recursive CTE query
2. Add optional depth limit parameter to prevent unbounded recursion
3. Write comprehensive tests comparing performance
4. Document performance benefits and usage examples
<!-- SECTION:PLAN:END -->
