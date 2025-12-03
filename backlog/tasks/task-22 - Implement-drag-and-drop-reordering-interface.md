---
id: task-22
title: Implement drag-and-drop reordering interface
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-12-02 21:17'
labels:
  - frontend
  - story-hierarchy
  - ui
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build drag-and-drop interface for reordering child stories within a parent. Users should be able to visually reorder chapters, scenes, or other children by dragging them to new positions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 UI provides draggable handles on child story list items
- [x] #2 Drag interaction provides visual feedback during drag
- [x] #3 Drop updates visual order immediately (optimistic update)
- [x] #4 Drop calls reorder_story_children Tauri command with new order
- [x] #5 UI handles errors and reverts order if backend call fails
- [x] #6 UI works on both desktop platforms
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Research drag-and-drop libraries (dnd-kit vs react-beautiful-dnd vs native HTML5)
2. Install chosen library
3. Update ChildStoryList to use draggable items
4. Implement drag handles and visual feedback
5. Add optimistic updates with error rollback
6. Test on macOS (primary desktop platform)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

### Library Choice
Chose **@dnd-kit** over alternatives:
- Modern hooks-based API (works well with React 19)
- Lightweight and modular (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- Good accessibility support (keyboard navigation built-in)
- Active maintenance

### Packages Installed
- `@dnd-kit/core` - Core drag-and-drop primitives
- `@dnd-kit/sortable` - Sortable list utilities
- `@dnd-kit/utilities` - CSS transform helpers

### File Modified
- `src/components/stories/ChildStoryList.tsx` - Complete rewrite with drag-and-drop

### Features Implemented
1. **Draggable handles**: GripVertical icon on each item, cursor changes to grab/grabbing
2. **Visual feedback during drag**:
   - Original item fades to 50% opacity
   - DragOverlay shows elevated item with primary border and shadow
   - Smooth CSS transforms during drag
3. **Optimistic updates**: Local state updates immediately, reverts if backend fails
4. **Error handling**: Shows error message banner if reorder fails, reverts to original order
5. **Keyboard support**: Arrow keys + Enter for accessibility via KeyboardSensor
6. **Activation constraint**: Requires 8px movement before drag starts (prevents accidental drags)

### Architecture Notes
- `SortableItem` component handles individual draggable items
- `DragOverlayItem` renders the floating item during drag
- Local `items` state enables optimistic updates
- `isReordering` flag prevents prop sync during backend call
- Removed up/down buttons (replaced by drag-and-drop)
<!-- SECTION:NOTES:END -->
