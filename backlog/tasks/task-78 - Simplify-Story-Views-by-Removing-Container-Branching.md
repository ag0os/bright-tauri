---
id: task-78
title: Simplify Story Views by Removing Container Branching
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - frontend
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update story views to remove conditional container/content logic. Stories always represent content and navigate to the editor, with no special handling for organizational structures (now handled by containers).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CONTAINER_TYPES arrays and checks removed from StoriesList.tsx
- [ ] #2 Conditional navigation logic removed (stories always go to editor)
- [ ] #3 StoryEditor.tsx simplified to only handle content editing
- [ ] #4 No container vs content branching in story UI components
- [ ] #5 Story card click always opens story editor
- [ ] #6 Views work correctly for both standalone and container-based stories
- [ ] #7 Application compiles and runs without errors
<!-- AC:END -->
