---
id: task-32
title: 'Task 2.3: Create Elements Store'
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
Implement Zustand store for managing universe elements state with filtering, search, and CRUD operations.

Store location: src/stores/useElementsStore.ts

State to manage:
- List of elements in current universe
- Currently selected element
- Loading states
- Filter/sort preferences
- Actions: loadElements, selectElement, createElement, updateElement, deleteElement

Features:
- Filter by element type (Character, Location, Vehicle, etc.)
- Search by name/description
- Integrate with Tauri commands (invoke 'list_elements_by_universe', 'get_element', etc.)

Depends on: Tasks 1.1, 1.2, 1.3, 2.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Store manages element list correctly
- [ ] #2 Filters work (by type, search)
- [ ] #3 CRUD operations integrate with backend
- [ ] #4 Loading and error states handled
- [ ] #5 Store follows Zustand best practices
<!-- AC:END -->
