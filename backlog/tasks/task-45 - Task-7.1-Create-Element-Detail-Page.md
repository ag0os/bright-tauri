---
id: task-45
title: 'Task 7.1: Create Element Detail Page'
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
Build full-screen view of a single universe element with all details and relationships.

Component location: src/pages/ElementDetailPage.tsx

Features:
- Back button to Universe List
- Display element name, type, icon, description
- Display all attributes (template + custom)
- Display relationships (with labels)
- Display tags
- 'Appears In' section showing linked stories (read-only in Phase 1)
- Edit button (navigates to edit mode or opens modal)
- Delete button (with confirmation)

Data flow:
- Reads element from useElementsStore (by ID from route/nav)
- Displays all element properties
- Edit/Delete actions call store methods

Depends on: Tasks 2.3, 3.2, 3.3, 6.1, 6.2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Page displays element information correctly (name, type, icon, description)
- [ ] #2 All attributes shown (template + custom)
- [ ] #3 Relationships displayed with labels
- [ ] #4 Tags displayed properly
- [ ] #5 'Appears In' section shows linked stories (read-only)
- [ ] #6 Back button works (returns to Universe List)
- [ ] #7 Edit button works
- [ ] #8 Delete button works with confirmation dialog
- [ ] #9 Clean, readable layout
<!-- AC:END -->
