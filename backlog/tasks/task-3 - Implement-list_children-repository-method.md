---
id: task-3
title: Implement list_children repository method
status: Done
assignee: []
created_date: '2025-10-03 19:23'
updated_date: '2025-10-06 16:00'
labels:
  - backend
  - story-hierarchy
  - database
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add list_children() method to StoryRepository that retrieves all child stories of a parent story, ordered by the order field. This enables querying story hierarchies like chapters in a novel or scenes in a screenplay.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Method accepts database connection and parent_id as parameters
- [ ] #2 Returns Vec<Story> ordered by story_order field
- [ ] #3 Returns empty vector if parent has no children
- [ ] #4 Query filters by parent_story_id correctly
- [ ] #5 Unit tests verify ordering behavior
<!-- AC:END -->
