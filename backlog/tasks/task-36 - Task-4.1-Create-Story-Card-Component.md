---
id: task-36
title: 'Task 4.1: Create Story Card Component'
status: To Do
assignee: []
created_date: '2025-10-31 19:27'
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
- [ ] #1 Card displays all required information (icon, title, type, word count, status, favorite, child count, timestamp)
- [ ] #2 Hover actions appear and work (Edit, Delete, Favorite toggle)
- [ ] #3 Click navigation works (editor or chapter manager)
- [ ] #4 Styling matches design system (Elevated Shadow)
- [ ] #5 Responsive card sizing works
<!-- AC:END -->
