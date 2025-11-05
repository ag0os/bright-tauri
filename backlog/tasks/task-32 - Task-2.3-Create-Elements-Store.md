---
id: task-32
title: 'Task 2.3: Create Elements Store'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:26'
updated_date: '2025-11-05 19:35'
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
- [x] #1 Store manages element list correctly
- [x] #2 Filters work (by type, search)
- [x] #3 CRUD operations integrate with backend
- [x] #4 Loading and error states handled
- [x] #5 Store follows Zustand best practices
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review Element type and related types (ElementType)
2. Create src/stores/useElementsStore.ts with TypeScript types
3. Implement Zustand store similar to Stories store
4. Add state: elements list, selectedElement, loading states, filters
5. Add actions: loadElements, selectElement, CRUD operations
6. Implement filtering logic: by type, search by name/description
7. Integrate Tauri commands for element operations
8. Test the store can be imported without errors
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created useElementsStore.ts with filtering and full CRUD operations.

Implementation:
- Zustand store for managing elements in the current universe
- State: elements list, selectedElement, isLoading, error, filters
- Actions: loadElements, selectElement, createElement, getElement, updateElement, deleteElement
- Filtering: by type (ElementType), search query (name/description/details/customTypeName)
- Default sorting by name alphabetically
- Helper methods: setFilter, clearFilters, getFilteredElements
- Integrated Tauri commands: list_elements_by_universe, create_element, get_element, update_element, delete_element
- Proper error handling with loading states
- Type-safe with imported TypeScript types from @/types
- Follows Zustand best practices with immutable updates
<!-- SECTION:NOTES:END -->
