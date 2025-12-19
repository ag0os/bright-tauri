---
id: task-66
title: Simplify Story Model to Content-Only Entity
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
Remove container-related logic from the Story struct so it purely represents written content. Stories will either be standalone (with own git repo) or belong to a container (sharing parent's repo). This eliminates conditional container/content branching throughout the codebase.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 parent_story_id field removed from Story struct
- [ ] #2 container_id field added as Option<String>
- [ ] #3 story_type remains as optional label for categorization
- [ ] #4 should_have_git_repo() simplified to check only if container_id is None
- [ ] #5 Container-related methods and logic removed from Story
- [ ] #6 Unit tests verify standalone stories identified correctly (container_id is None)
- [ ] #7 Unit tests verify child stories identified correctly (container_id is Some)
<!-- AC:END -->
