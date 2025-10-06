---
id: task-2
title: Add should_have_git_repo logic to Story model
status: Done
assignee: []
created_date: '2025-10-03 19:23'
updated_date: '2025-10-06 16:00'
labels:
  - backend
  - story-hierarchy
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the should_have_git_repo() method on Story that determines if a story should have its own Git repository based on story type and parent relationship. Containers and standalone stories get repos, children and Series do not.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Method correctly identifies container types (Novel, Screenplay, Collection) as needing repos
- [ ] #2 Method correctly identifies standalone content (ShortStory, Episode, Poem with no parent) as needing repos
- [ ] #3 Method correctly identifies children (Chapter, Scene) as not needing repos
- [ ] #4 Method correctly identifies Series as not needing repos
- [ ] #5 Planning docs (Outline, Treatment) follow parent logic
- [ ] #6 Unit tests cover all story type scenarios
<!-- AC:END -->
