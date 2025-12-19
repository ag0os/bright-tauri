---
id: task-83
title: Remove Dead Code from Story-as-Container Model
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - cleanup
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Clean up all code related to the old model where stories could act as containers. This includes CONTAINER_TYPES arrays, conditional branching, unused components, and obsolete store state. Ensures codebase only contains the new clean Container/Story separation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CONTAINER_TYPES arrays removed from all files
- [ ] #2 Conditional container/content logic removed from story-related code
- [ ] #3 ChildStoryList component removed if replaced by container equivalent
- [ ] #4 Unused store state for story hierarchy removed
- [ ] #5 Dead utility functions for story-as-container removed
- [ ] #6 No references to old story-container model remain in codebase
- [ ] #7 Application compiles and runs without errors after cleanup
<!-- AC:END -->
