---
id: task-4
title: Implement reorder_children repository method
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
Add reorder_children() method to StoryRepository that updates the order field for multiple child stories. This enables users to reorder chapters, scenes, or other children within a parent story.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Method accepts database connection, parent_id, and Vec of story_ids in desired order
- [ ] #2 Updates order field for each story based on position in Vec
- [ ] #3 Validates that all story_ids belong to the specified parent
- [ ] #4 Transaction ensures atomic update of all order fields
- [ ] #5 Returns error if any story_id is invalid or doesn't belong to parent
- [ ] #6 Unit tests verify order updates and validation
<!-- AC:END -->
