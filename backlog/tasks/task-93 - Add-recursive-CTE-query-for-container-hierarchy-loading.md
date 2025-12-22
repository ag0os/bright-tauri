---
id: task-93
title: Add recursive CTE query for container hierarchy loading
status: To Do
assignee: []
created_date: '2025-12-22 16:35'
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
