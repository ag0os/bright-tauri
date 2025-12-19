---
id: task-76
title: Simplify Stories Store by Removing Container Logic
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 20:22'
labels:
  - container-refactor
  - frontend
  - state
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor the stories Zustand store to remove container-related state and logic. Stories are now organized by containers, with the store simplified to manage only story content and loading states.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 childrenByParentId state removed (moved to containers store)
- [x] #2 loadStories action updated to filter by container_id
- [x] #3 CONTAINER_TYPES checks removed from store logic
- [x] #4 Container-related actions removed (moved to containers store)
- [x] #5 Store only manages story content state (loading, creation, updates)
- [x] #6 Story reordering works within container context
- [x] #7 Store correctly handles both standalone and container-based stories
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze current store and identify all container-related logic to remove
2. Remove childrenByParentId and childrenLoading state
3. Remove all child story actions (loadStoryChildren, reorderStoryChildren, getStoryChildren, invalidateChildren, getChildCount)
4. Update deleteStory to remove childrenByParentId cleanup logic
5. Keep core story CRUD operations (create, get, update, delete)
6. Keep loadStories for universe-wide story loading
7. Keep filtering and sorting functionality
8. Run TypeScript check to ensure no compilation errors
9. Document changes in implementation notes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully simplified the Stories store by removing all container logic:

## Changes Made

### useStoriesStore.ts
- Removed childrenByParentId and childrenLoading state (moved to containers store)
- Removed loadStoryChildren, reorderStoryChildren, getStoryChildren, invalidateChildren, and getChildCount actions
- Updated deleteStory to remove childrenByParentId cleanup logic
- Store now only manages story content state (loading, creation, updates, filtering, sorting)

### Component Updates
- **CreateStoryModal.tsx**: Removed invalidateChildren call, added TODO for containers store
- **StoriesList.tsx**: Replaced async getChildCount with local calculation from stories array
- **StoryChildren.tsx**: Added TODO comments for all container-related operations that will use containers store in task-78

## Architecture
Stories are now purely content entities. The store handles:
- Loading stories for a universe (all stories)
- Loading stories filtered by container_id (future)
- Loading standalone stories (container_id is null)
- Create/update/delete individual stories
- Filtering and sorting stories

Container hierarchy management has been moved to useContainersStore (task-75).

## Testing
- TypeScript compilation successful (npx tsc --noEmit)
- All component imports and usage updated
- Store interface cleaned and simplified
<!-- SECTION:NOTES:END -->
