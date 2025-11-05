---
id: task-42
title: 'Task 6.1: Create Element Card Component'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:28'
updated_date: '2025-11-05 20:02'
labels:
  - universe-ui
  - component
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build reusable card component for displaying a universe element using Elevated Shadow design.

Component location: src/components/universe/ElementCard.tsx

Features:
- Display element icon (emoji or Lucide icon)
- Element name and type
- Description preview (first line)
- Tags as badges
- Relationship count ('3 links')
- Favorite indicator
- Hover actions: Edit, Delete, Favorite toggle
- Click handler to navigate to detail screen

Design:
- Uses Elevated Shadow card design from design system
- Consistent with StoryCard styling
- Responsive card size

Depends on: Tasks 1.2, 2.3
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Card displays element information correctly (icon, name, type, description, tags, relationship count, favorite)
- [x] #2 Icons render properly (emoji and Lucide icons)
- [x] #3 Hover actions work (Edit, Delete, Favorite toggle)
- [x] #4 Click navigation works (navigates to detail screen)
- [x] #5 Matches design system (Elevated Shadow)
- [x] #6 Consistent styling with StoryCard
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze StoryCard pattern and design system
2. Map ElementType to appropriate icons (emoji and Lucide)
3. Create ElementCard.tsx with all required props
4. Implement card layout with hover state management
5. Add Edit, Delete, Favorite actions
6. Add click handler for navigation
7. Match Elevated Shadow card design
8. Ensure styling consistency with StoryCard
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created ElementCard component matching StoryCard design pattern:

- Implemented card layout with Elevated Shadow design from design system
- Added type-to-icon mapping for all 8 element types (Character, Location, Vehicle, Item, Organization, Creature, Event, Concept)
- Support for both emoji icons (custom) and Lucide icons (default)
- Display element information: icon, name, type, description preview (2 lines max)
- Show tags as badges (max 3 visible, +N for overflow)
- Display relationship count with link icon
- Favorite indicator (star icon) when element is favorited
- Hover state with Edit, Delete, and Favorite toggle actions
- Click handler for navigation to detail screen
- Uses design system tokens for colors, typography, spacing
- Consistent styling with StoryCard component

Location: src/components/universe/ElementCard.tsx
<!-- SECTION:NOTES:END -->
