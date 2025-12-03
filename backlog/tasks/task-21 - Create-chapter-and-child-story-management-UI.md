---
id: task-21
title: Create chapter and child story management UI
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-12-02 18:13'
labels:
  - frontend
  - story-hierarchy
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build frontend interface for managing child stories (chapters, scenes, etc.) within parent stories. Users should be able to create, edit, delete, and view children in the context of their parent.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 UI displays list of child stories for a parent story
- [x] #2 UI shows child stories in order with visual indicators
- [x] #3 UI provides button/form to create new child story
- [x] #4 UI allows editing child story title and content
- [x] #5 UI allows deleting child stories with confirmation
- [x] #6 UI integrates with list_story_children Tauri command
- [x] #7 UI integrates with reorder_story_children command for ordering
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extend useStoriesStore with child loading/caching methods
2. Add story-children route to useNavigationStore
3. Create ChildStoryList component
4. Extend CreateStoryModal to support parent context
5. Create StoryChildren view (main page)
6. Wire up edit/delete functionality
7. Add basic reordering (up/down buttons)
8. Update StoriesList to navigate to children view
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Files Created
- `src/components/stories/ChildStoryList.tsx` - Ordered list component for children with reorder buttons
- `src/views/StoryChildren.tsx` - Full-page view for managing child stories

### Files Modified
- `src/stores/useStoriesStore.ts` - Added child story loading, caching, and reordering methods
- `src/stores/useNavigationStore.ts` - Added `story-children` route
- `src/components/stories/CreateStoryModal.tsx` - Extended to support parent context (creates children with parentStoryId)
- `src/components/stories/index.ts` - Added ChildStoryList export
- `src/views/StoriesList.tsx` - Updated click handler to navigate to children for container types
- `src/App.tsx` - Added StoryChildren route rendering

### Features Implemented
- Child story list with visual order indicators (#1-n)
- Up/down buttons for reordering children (integrates with `reorder_story_children` command)
- Add chapter button opens modal with parent context pre-filled
- Edit button navigates to story editor
- Delete button with confirmation dialog
- Smart child type defaults (Novel→Chapter, Screenplay→Scene)
- Container stories (novel, series, screenplay, collection) now navigate to children manager instead of editor

### Architecture Notes
- Children are cached in `childrenByParentId` Record in the store
- Cache is invalidated on create/delete operations
- Reordering calls backend then reloads children for consistency
- Loading states tracked per-parent in `childrenLoading` Record
<!-- SECTION:NOTES:END -->
