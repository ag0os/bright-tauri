---
id: task-35
title: 'Task 3.3: Create App Router/Navigation Structure'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:27'
updated_date: '2025-11-05 19:42'
labels:
  - layout
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up routing or navigation system to switch between Stories and Universe sections.

Options to consider:
- React Router (if using client-side routing)
- Simple state-based navigation (simpler, might be sufficient)

Navigation states needed:
- Stories section (default)
- Universe section
- Story Editor (when editing a story)
- Element Detail (when viewing an element)

Depends on: Tasks 1.2, 3.1, 3.2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Can navigate between Stories List and Universe List
- [x] #2 URL or state reflects current screen
- [x] #3 Back navigation works correctly
- [x] #4 Navigation is clean and performant
- [x] #5 No broken navigation states
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze navigation requirements: Stories List, Universe List, Story Editor, Element Detail
2. Choose navigation approach: state-based for simplicity in desktop app
3. Create navigation state management (using Zustand for consistency)
4. Update App.tsx to implement routing logic
5. Create placeholder view components for each screen
6. Test navigation flow between screens
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented state-based navigation system for desktop app:

Navigation Store (Zustand):
- Created useNavigationStore with route management
- Routes: universe-selection, stories-list, universe-list, story-editor, element-detail
- Back navigation with history stack
- Clean state management without URL complexity

App Router:
- Updated App.tsx with switch-based routing
- Renders appropriate view based on current route
- Placeholder implementations for future views (story-editor, element-detail)

View Components:
- StoriesList: Stories section with PageLayout integration
- UniverseList: Universe elements section with PageLayout integration
- Both views support tab navigation between Stories/Universe

Integration:
- Updated UniverseSelection to use stores and navigate on universe selection
- Exported navigation store and types from stores/index.ts
- Navigation flows properly between all screens

Decision: State-based navigation over React Router
Rationale: Simpler for desktop app, no URL management needed, cleaner state management

Files created:
- src/stores/useNavigationStore.ts - Navigation state management
- src/views/StoriesList.tsx - Stories list view placeholder
- src/views/UniverseList.tsx - Universe list view placeholder

Files modified:
- src/App.tsx - Routing logic
- src/views/UniverseSelection.tsx - Store integration and navigation
- src/stores/index.ts - Export navigation store
<!-- SECTION:NOTES:END -->
