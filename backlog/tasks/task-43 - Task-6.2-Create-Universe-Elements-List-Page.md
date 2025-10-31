---
id: task-43
title: 'Task 6.2: Create Universe Elements List Page'
status: To Do
assignee: []
created_date: '2025-10-31 19:28'
labels:
  - universe-ui
  - page
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build main page showing all universe elements in grid view with toolbar and filtering.

Component location: src/pages/UniverseListPage.tsx

Features:
- Toolbar: Search, Filter (by type), Sort, View toggle (grid only in Phase 1)
- [+ New Element] button
- Grid of ElementCard components
- Empty state when no elements
- Loading state while fetching

Data flow:
- Reads elements from useElementsStore
- Filters by type and search query
- Sorts elements (name, recently updated, type)

Depends on: Tasks 2.3, 3.2, 3.3, 6.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Page displays elements correctly in grid view
- [ ] #2 Search works (filters by name/description)
- [ ] #3 Filter by type works (Character, Location, Vehicle, etc.)
- [ ] #4 Sort works (name, recently updated, type)
- [ ] #5 Create button triggers element creation
- [ ] #6 Clicking element card navigates to detail screen
- [ ] #7 Empty state displays when no elements
- [ ] #8 Loading state shows while fetching
<!-- AC:END -->
