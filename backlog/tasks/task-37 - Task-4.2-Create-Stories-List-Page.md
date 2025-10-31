---
id: task-37
title: 'Task 4.2: Create Stories List Page'
status: To Do
assignee: []
created_date: '2025-10-31 19:27'
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
- [ ] #1 Page displays stories correctly in grouped view
- [ ] #2 Search filters stories in real-time
- [ ] #3 Filter by type/status works
- [ ] #4 Sort works (last edited, title, word count)
- [ ] #5 Create button triggers story creation
- [ ] #6 Clicking story card navigates appropriately (container to chapter manager, standalone to editor)
- [ ] #7 Empty state displays when no stories
- [ ] #8 Loading state shows while fetching
<!-- AC:END -->
