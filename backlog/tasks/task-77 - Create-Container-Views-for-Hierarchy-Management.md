---
id: task-77
title: Create Container Views for Hierarchy Management
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:42'
updated_date: '2025-12-19 20:28'
labels:
  - container-refactor
  - frontend
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build new React views for viewing and managing the container hierarchy. Users need to view container details, navigate the tree structure, and manage child containers and stories.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ContainerView component created in src/views/ContainerView.tsx
- [x] #2 ContainerChildrenView component created for listing children
- [x] #3 View displays container details (title, description, type, git repo status)
- [x] #4 Child list shows both child containers and stories with clear visual distinction
- [x] #5 Navigation links allow drilling down into child containers or opening story editor
- [x] #6 Reordering UI allows drag-and-drop or up/down buttons for children
- [x] #7 View integrates with useContainersStore for state management
- [x] #8 Loading and error states handled gracefully
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Examine existing view patterns (StoriesList, StoryEditor, StoryChildren)
2. Review Container store and types
3. Create ContainerView.tsx - single container detail view
4. Create ContainerChildrenView.tsx - list of child containers and stories
5. Use Phosphor icons for visual distinction (FolderOpen for containers, FileText for stories)
6. Implement reorder UI with up/down arrow buttons
7. Integrate with useContainersStore for data
8. Handle loading and error states
9. Add navigation using useNavigationStore
10. Test with TypeScript compiler
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created container views for hierarchy management with the following implementation:

## Components Created

1. **ContainerView.tsx** - Full-featured view displaying single container details with children
   - Displays container title, description, type, and Git status
   - Shows both child containers and stories in separate sections
   - Visual distinction: FolderOpen icon (primary color) for containers, FileText icon (accent color) for stories
   - Reordering UI: CaretUp/CaretDown buttons for both containers and stories
   - Integrates with useContainersStore for all data operations
   - Navigation to child containers and story editor
   - Loading states with spinner animation
   - Error state display
   - Empty state with call-to-action button

2. **ContainerChildrenView.tsx** - Reusable component for listing children
   - Accepts children data as props for flexible usage
   - Callback-based approach for all interactions (click, reorder)
   - Same visual design as ContainerView for consistency
   - Can be embedded in other views or used standalone
   - Loading, empty, and error states

## Navigation Routes Added

Updated useNavigationStore with new routes:
- `container-view` - View container details and children
- `container-create` - Create new container (with optional parent)
- `container-settings` - Container settings page

## Design Decisions

- **Visual Distinction**: Containers use FolderOpen icon with primary color, stories use FileText icon with accent color
- **Reordering**: Simple up/down buttons instead of drag-and-drop for initial implementation
- **Separation of Concerns**: ContainerView handles full page layout, ContainerChildrenView is reusable component
- **Loading Strategy**: Uses store cache with separate loading states for container and children
- **Error Handling**: Graceful error display with ability to retry via navigation

## Integration Points

- useContainersStore for all data operations
- useNavigationStore for routing between views
- Design system tokens for consistent styling
- Phosphor icons for visual elements

## TypeScript

All code passes TypeScript compilation with no errors.
<!-- SECTION:NOTES:END -->
