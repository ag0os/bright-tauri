---
id: task-21
title: Create chapter and child story management UI
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - frontend
  - story-hierarchy
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build frontend interface for managing child stories (chapters, scenes, etc.) within parent stories. Users should be able to create, edit, delete, and view children in the context of their parent.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 UI displays list of child stories for a parent story
- [ ] #2 UI shows child stories in order with visual indicators
- [ ] #3 UI provides button/form to create new child story
- [ ] #4 UI allows editing child story title and content
- [ ] #5 UI allows deleting child stories with confirmation
- [ ] #6 UI integrates with list_story_children Tauri command
- [ ] #7 UI integrates with reorder_story_children command for ordering
<!-- AC:END -->
