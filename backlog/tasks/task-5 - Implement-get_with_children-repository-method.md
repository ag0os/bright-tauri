---
id: task-5
title: Implement get_with_children repository method
status: To Do
assignee: []
created_date: '2025-10-03 19:23'
labels:
  - backend
  - story-hierarchy
  - database
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add get_with_children() method to StoryRepository that retrieves a parent story along with all its children in a single query. This provides an efficient way to fetch complete hierarchies for display or processing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Method accepts database connection and story_id as parameters
- [ ] #2 Returns tuple of (Story, Vec<Story>) with parent and ordered children
- [ ] #3 Children are ordered by story_order field
- [ ] #4 Returns error if story_id not found
- [ ] #5 Returns empty children Vec if story has no children
- [ ] #6 Unit tests verify parent and children retrieval
<!-- AC:END -->
