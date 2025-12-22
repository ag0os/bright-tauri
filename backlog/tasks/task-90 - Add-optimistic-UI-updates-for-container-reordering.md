---
id: task-90
title: Add optimistic UI updates for container reordering
status: Done
assignee:
  - '@agent'
created_date: '2025-12-22 16:30'
updated_date: '2025-12-22 18:13'
labels:
  - frontend
  - ux
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ContainerView reorder handlers send requests to backend but don't optimistically update the UI, making it feel sluggish. Should add optimistic updates with rollback on error.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Implement optimistic update in handleMoveContainerUp/Down
- [x] #2 Revert optimistic change on backend error
- [x] #3 Show user-friendly error message on failure
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add optimistic reorder function to useContainersStore
2. Update ContainerView handlers to use optimistic updates
3. Implement error handling with rollback
4. Add user-friendly error notifications
5. Write tests for optimistic update and rollback
6. Test the implementation manually
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented optimistic UI updates for container and story reordering in ContainerView:

**Store Changes (`useContainersStore.ts`):**
- Added `optimisticReorderChildren()` function that immediately updates cache with new order
- Modified `reorderChildren()` to:
  1. Save original state before applying changes
  2. Apply optimistic update immediately via `optimisticReorderChildren()`
  3. Call backend API to persist changes
  4. On success: reload from backend to ensure sync
  5. On error: rollback to saved state and set error message
- Updated all cache operations to use `_childrenCache` LRU cache instead of plain object

**View Changes (`ContainerView.tsx`):**
- Updated all reorder handlers (containers and stories) to use new optimistic store method
- Removed try-catch blocks since store handles errors internally
- Error messages automatically display via existing error UI (lines 320-334)

**Testing:**
- Created comprehensive test suite in `useContainersStore.test.ts`
- Tests cover: optimistic updates, error rollback, mixed reordering, edge cases
- All 5 tests passing

**User Experience:**
- UI now updates immediately when user clicks move up/down buttons
- No more waiting for backend response before seeing changes
- If backend fails, changes revert automatically with error message
- Feels much more responsive and snappy
<!-- SECTION:NOTES:END -->
