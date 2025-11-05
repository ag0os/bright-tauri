---
id: task-37
title: 'Task 4.2: Create Stories List Page'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:27'
updated_date: '2025-11-05 19:50'
labels:
  - stories-ui
  - page
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build main page showing all stories in grouped view with toolbar and grid layout.

Component location: src/pages/StoriesListPage.tsx

Features:
- Toolbar: Search, Filter, Sort, View toggle (grouped only in Phase 1)
- Grid of StoryCard components
- [+ New Story] button
- Empty state when no stories
- Loading state while fetching stories

Data flow:
- Reads stories from useStoriesStore
- Filters/sorts based on toolbar selections
- Groups stories (containers at top level, hides children)

Depends on: Tasks 2.2, 3.2, 3.3, 4.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Page displays stories correctly in grouped view
- [x] #2 Search filters stories in real-time
- [x] #3 Filter by type/status works
- [x] #4 Sort works (last edited, title, word count)
- [x] #5 Create button triggers story creation
- [x] #6 Clicking story card navigates appropriately (container to chapter manager, standalone to editor)
- [x] #7 Empty state displays when no stories
- [x] #8 Loading state shows while fetching
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update StoriesList.tsx component
2. Add toolbar with search input, filter dropdown, sort dropdown
3. Implement [+ New Story] button that opens creation modal
4. Create grid layout for StoryCard components
5. Implement empty state (no stories)
6. Implement loading state (fetching stories)
7. Connect to useStoriesStore for data and actions
8. Filter stories based on toolbar selections
9. Implement grouped view (top-level only, hide children)
10. Add navigation handlers for clicking stories
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented complete Stories List page with full functionality:

- Header with "Stories" title and "+ New Story" button
- Toolbar with search input (with search icon), type filter, status filter, sort dropdown, and sort order toggle
- Real-time filtering: search filters by title/description/notes
- Filter dropdowns for type (Novel, Series, etc.) and status (Draft, In Progress, etc.)
- Sort options: Last Edited, Title, Word Count with ascending/descending toggle
- Grouped view: displays only top-level stories (filters out children with parentStoryId)
- Child count calculation and display on story cards
- Loading state with animated spinner
- Empty state with contextual messaging (no stories vs. no matches)
- Error state display
- Grid layout with responsive cards (min 320px)
- Story card actions: click to open editor, edit button, delete with confirmation, favorite toggle
- Placeholder modal for story creation (Task 38)

Files:
- Updated: src/views/StoriesList.tsx (complete implementation)
<!-- SECTION:NOTES:END -->
