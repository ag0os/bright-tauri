---
id: task-69
title: Update Story Repository for Container-Based Organization
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - backend
  - rust
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor story repository to use container_id instead of parent_story_id, removing container hierarchy logic. Stories are now organized by containers, with queries simplified to fetch stories within a container or standalone stories at universe level.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 list_children query replaced with list_by_container using container_id
- [ ] #2 get_with_children method removed (containers handle hierarchy now)
- [ ] #3 reorder operation updated to work within container_id context
- [ ] #4 Query for standalone stories (container_id IS NULL) works correctly
- [ ] #5 All container-related logic removed from story repository
- [ ] #6 Unit tests verify stories can be listed by container_id
- [ ] #7 Unit tests verify standalone stories query works correctly
<!-- AC:END -->
