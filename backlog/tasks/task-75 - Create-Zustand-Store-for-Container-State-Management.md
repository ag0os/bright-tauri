---
id: task-75
title: Create Zustand Store for Container State Management
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 20:18'
labels:
  - container-refactor
  - frontend
  - state
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a new Zustand store to manage container state, hierarchical tree data, and container operations. This store handles loading containers, managing parent-child relationships, and coordinating container CRUD actions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 useContainersStore created in src/stores/useContainersStore.ts
- [x] #2 State includes: containers array, containerChildren map (by parent ID), loading states
- [x] #3 loadContainers action fetches containers for universe
- [x] #4 loadContainerChildren action fetches children for a container
- [x] #5 createContainer action calls Tauri command and updates state
- [x] #6 updateContainer action updates container and refreshes state
- [x] #7 deleteContainer action removes container and updates tree
- [x] #8 reorderChildren action reorders child containers
- [x] #9 Store correctly manages hierarchical container tree structure
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review useStoriesStore.ts for Zustand patterns
2. Review Container types and Tauri commands
3. Create useContainersStore.ts with state interface
4. Implement loadContainers and loadContainerChildren actions
5. Implement createContainer, updateContainer, deleteContainer actions
6. Implement reorderChildren action
7. Add proper error handling and loading states
8. Test with TypeScript compiler
9. Verify all acceptance criteria are met
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created useContainersStore.ts following the established Zustand patterns from useStoriesStore.ts.

## What was implemented:

1. **Store Structure**: Created complete Zustand store with TypeScript interfaces for state and actions

2. **State Management**:
   - containers: Array of all containers for the current universe
   - selectedContainer: Currently selected container
   - isLoading/error: Loading and error states
   - childrenByContainerId: Map caching ContainerChildren (both child containers and stories) by parent ID
   - childrenLoading: Map tracking loading state for each parent

3. **CRUD Actions**:
   - loadContainers: Fetches all containers for a universe
   - createContainer: Creates new container and updates state
   - getContainer: Fetches single container by ID
   - updateContainer: Updates container and refreshes state
   - deleteContainer: Deletes container, handles cascading deletes, cleans up caches

4. **Hierarchical Actions**:
   - loadContainerChildren: Fetches ContainerChildren (child containers + stories) for a parent
   - reorderChildren: Reorders both child containers and stories
   - getContainerChildren: Returns cached children or null
   - invalidateChildren: Clears cache for a parent

5. **Type Integration**: Added Container, CreateContainerInput, UpdateContainerInput, and ContainerChildren to src/types/index.ts

6. **Store Export**: Added useContainersStore to src/stores/index.ts for easy import

## Files modified:
- Created: src/stores/useContainersStore.ts
- Modified: src/types/index.ts (added Container type exports)
- Modified: src/stores/index.ts (added useContainersStore export)

## Testing:
- TypeScript compilation passes with no errors
- All Tauri command names match task-70 implementation
<!-- SECTION:NOTES:END -->
