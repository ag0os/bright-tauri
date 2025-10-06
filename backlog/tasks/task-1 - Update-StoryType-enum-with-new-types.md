---
id: task-1
title: Update StoryType enum with new types
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:23'
updated_date: '2025-10-06 16:00'
labels:
  - backend
  - story-hierarchy
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expand the StoryType enum in the models to include all story types defined in the design doc: Novel, Series, Screenplay, Collection, Chapter, ShortStory, Scene, Episode, Poem, Outline, Treatment
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 StoryType enum includes all container types (Novel, Series, Screenplay, Collection)
- [ ] #2 StoryType enum includes all independent content types (Chapter, ShortStory, Scene, Episode, Poem)
- [ ] #3 StoryType enum includes planning doc types (Outline, Treatment)
- [ ] #4 TypeScript types are generated and match Rust enum
<!-- AC:END -->
