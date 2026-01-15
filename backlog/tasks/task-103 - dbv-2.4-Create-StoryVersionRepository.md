---
id: task-103
title: 'dbv-2.4: Create StoryVersionRepository'
status: To Do
assignee: []
created_date: '2026-01-15 13:36'
labels:
  - dbv
  - backend
  - rust
dependencies:
  - task-100
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement repository for story_versions table with CRUD operations and version count validation for deletion.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 create() method: inserts new version record
- [ ] #2 get() method: retrieves version by id
- [ ] #3 list_by_story() method: returns all versions for a story
- [ ] #4 rename() method: updates version name
- [ ] #5 delete() method: removes version (with last-version check)
- [ ] #6 count_by_story() method: returns version count for deletion validation
- [ ] #7 Unit tests for all repository methods
<!-- AC:END -->
