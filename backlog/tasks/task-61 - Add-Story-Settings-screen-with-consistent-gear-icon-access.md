---
id: task-61
title: Add Story Settings screen with consistent gear icon access
status: Done
assignee:
  - '@claude'
created_date: '2025-12-18 14:57'
updated_date: '2025-12-18 15:13'
labels:
  - frontend
  - ux
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add the ability to edit story metadata (title, description, type, target word count, etc.) after creation. Currently, once a story is created, there's no way to edit its metadata. Add a gear icon that provides access to a dedicated Story Settings screen from three locations: story cards in the index, chapter view top bar, and editor top bar. Also remove the redundant pencil icon from story cards since clicking the card already navigates to the appropriate destination.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Gear icon visible on all story cards in the Stories Index
- [x] #2 Gear icon in chapter view top bar for container stories (novels, series)
- [x] #3 Gear icon in editor top bar
- [x] #4 Story Settings screen displays and allows editing: title, description, story type, target word count
- [x] #5 Clicking gear icon from any location opens Story Settings screen
- [x] #6 Pencil icon removed from story cards (card click handles navigation)
- [x] #7 Settings changes persist to database
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented Story Settings feature with consistent gear icon access:

**New Files:**
- src/views/StorySettings.tsx - Full-page settings form
- src/views/StorySettings.css - Styling

**Modified Files:**
- src/stores/useNavigationStore.ts - Added story-settings route
- src/App.tsx - Added route case
- src/components/stories/StoryCard.tsx - Removed pencil, added gear icon
- src/views/StoryChildren.tsx - Added gear icon in header
- src/views/StoryEditor.tsx - Added gear icon in header
- src/views/StoriesList.tsx - Removed onEdit prop

**Commits:**
- feat(task-61): Add Story Settings screen with navigation route
- feat(task-61): Add gear icon access to Story Settings from all views
<!-- SECTION:NOTES:END -->
