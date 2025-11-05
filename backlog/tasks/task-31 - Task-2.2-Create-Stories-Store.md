---
id: task-31
title: 'Task 2.2: Create Stories Store'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:26'
updated_date: '2025-11-05 19:33'
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
- [x] #1 Store manages story list correctly
- [x] #2 Filters work (type, status, search query)
- [x] #3 Sorting works (last edited, title, word count)
- [x] #4 CRUD operations integrate with backend
- [x] #5 Loading and error states handled
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review Story type and related types (StoryStatus, StoryType)
2. Create src/stores/useStoriesStore.ts with TypeScript types
3. Implement Zustand store with immer middleware for easier updates
4. Add state: stories list, selectedStory, loading states, filters, sort preferences
5. Add actions: loadStories, selectStory, CRUD operations
6. Implement filtering logic: by type, status, search query
7. Implement sorting logic: last edited, title, word count
8. Integrate Tauri commands for story operations
9. Test the store can be imported without errors
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created useStoriesStore.ts with filtering, sorting, and full CRUD operations.

Implementation:
- Zustand store for managing stories in the current universe
- State: stories list, selectedStory, isLoading, error, filters, sortBy, sortOrder
- Actions: loadStories, selectStory, createStory, getStory, updateStory, deleteStory
- Filtering: by type (StoryType), status (StoryStatus), search query (title/description/notes)
- Sorting: by lastEdited, title, wordCount with asc/desc order
- Helper methods: setFilter, clearFilters, setSorting, getFilteredAndSortedStories
- Integrated Tauri commands: list_stories_by_universe, create_story, get_story, update_story, delete_story
- Proper error handling with loading states
- Type-safe with imported TypeScript types from @/types
- Follows Zustand best practices with immutable updates
<!-- SECTION:NOTES:END -->
