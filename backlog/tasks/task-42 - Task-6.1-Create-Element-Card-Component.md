---
id: task-42
title: 'Task 6.1: Create Element Card Component'
status: To Do
assignee: []
created_date: '2025-10-31 19:28'
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
- [ ] #1 Card displays element information correctly (icon, name, type, description, tags, relationship count, favorite)
- [ ] #2 Icons render properly (emoji and Lucide icons)
- [ ] #3 Hover actions work (Edit, Delete, Favorite toggle)
- [ ] #4 Click navigation works (navigates to detail screen)
- [ ] #5 Matches design system (Elevated Shadow)
- [ ] #6 Consistent styling with StoryCard
<!-- AC:END -->
