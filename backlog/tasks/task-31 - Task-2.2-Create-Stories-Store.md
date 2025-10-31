---
id: task-31
title: 'Task 2.2: Create Stories Store'
status: To Do
assignee: []
created_date: '2025-10-31 19:26'
labels:
  - state-management
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement Zustand store for managing stories state with filtering, sorting, and CRUD operations.

Store location: src/stores/useStoriesStore.ts

State to manage:
- List of stories in current universe
- Currently selected story
- Loading states
- Filter/sort preferences
- Actions: loadStories, selectStory, createStory, updateStory, deleteStory

Features:
- Filter stories by type, status, search query
- Sort stories by various criteria (last edited, title, word count)
- Integrate with Tauri commands (invoke 'list_stories_by_universe', 'get_story', etc.)

Depends on: Tasks 1.1, 1.2, 1.3, 2.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Store manages story list correctly
- [ ] #2 Filters work (type, status, search query)
- [ ] #3 Sorting works (last edited, title, word count)
- [ ] #4 CRUD operations integrate with backend
- [ ] #5 Loading and error states handled
<!-- AC:END -->
