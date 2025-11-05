---
id: task-36
title: 'Task 4.1: Create Story Card Component'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:27'
updated_date: '2025-11-05 19:47'
labels:
  - stories-ui
  - component
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build reusable card component for displaying a story in the list view using Elevated Shadow design.

Component location: src/components/stories/StoryCard.tsx

Features:
- Displays story icon, title, type
- Shows word count, status badge
- Favorite indicator
- Child count for containers (e.g., '15 chapters')
- Last edited timestamp
- Hover actions: Edit, Delete, Favorite toggle
- Click handler to navigate to editor or chapter manager

Design:
- Uses Elevated Shadow card design from design system
- Responsive card size
- Proper typography and spacing with design tokens

Depends on: Tasks 1.2, 2.2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Card displays all required information (icon, title, type, word count, status, favorite, child count, timestamp)
- [x] #2 Hover actions appear and work (Edit, Delete, Favorite toggle)
- [x] #3 Click navigation works (editor or chapter manager)
- [x] #4 Styling matches design system (Elevated Shadow)
- [x] #5 Responsive card sizing works
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create StoryCard.tsx component structure
2. Import design system tokens (cards, buttons, icons)
3. Implement card layout with story info (icon, title, type, word count, status badge)
4. Add favorite indicator and child count for containers
5. Implement hover actions (Edit, Delete, Favorite toggle)
6. Add click handler for navigation
7. Style with Elevated Shadow card design
8. Test component renders correctly
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created reusable StoryCard component with Elevated Shadow design:

- Implemented card layout with story icon (mapped by type), title, description, and metadata
- Added status badge with color-coded styling (draft/inprogress/completed)
- Included favorite indicator (filled star) and child count display
- Implemented hover actions (Edit, Delete, Favorite toggle) with ghost buttons
- Added relative timestamp formatting (e.g., "2h ago", "3d ago")
- Used design system tokens throughout (spacing, colors, typography, icons)
- Card responds to click for navigation (onEdit for Chapter/Series, onClick for others)
- Responsive sizing with card-base class

Files:
- Created: src/components/stories/StoryCard.tsx
- Updated: src/components/stories/index.ts (added export)
- Updated: src/design-system/tokens/colors/modern-indigo.css (added --color-primary-bg and --color-success-bg tokens)
<!-- SECTION:NOTES:END -->
