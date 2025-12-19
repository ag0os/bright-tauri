---
id: task-67
title: Update StoryType Enum to Content Types Only
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
Remove organizational container types (novel, series, collection) from the StoryType enum, leaving only content types. Container types will be moved to a separate ContainerType enum. This completes the separation of organizational and content concerns at the type level.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Novel, Series, Collection variants removed from StoryType enum
- [ ] #2 Content types retained: chapter, scene, short-story, episode, poem, outline, treatment, screenplay
- [ ] #3 Screenplay remains as a content type (it represents written content)
- [ ] #4 Enum compiles without errors
- [ ] #5 TypeScript type generation updated to reflect new enum
<!-- AC:END -->
