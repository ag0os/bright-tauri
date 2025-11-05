---
id: task-33
title: 'Task 3.1: Create Top Bar Component'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:27'
updated_date: '2025-11-05 19:38'
labels:
  - layout
  - component
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the main navigation top bar with universe selector following the Minimal Top Bar design (48px height).

Component location: src/components/layout/TopBar.tsx

Features:
- Universe selector dropdown (uses useUniverseStore)
- Navigation tabs: Stories (active by default), Universe
- Active tab indication
- Responsive behavior
- Follows Minimal Top Bar design from design system

Integration:
- Reads current universe from useUniverseStore
- Shows list of universes in dropdown
- Allows switching universes
- Emits navigation events or uses routing

Depends on: Tasks 1.1, 1.2, 2.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Component renders with correct design system styling
- [x] #2 Universe dropdown lists all universes
- [x] #3 Switching universes updates store
- [x] #4 Tab navigation works (Stories/Universe)
- [x] #5 Matches design from ui-navigation.md
- [x] #6 48px height maintained
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create TopBar component structure with universe selector and navigation tabs
2. Import and use useUniverseStore for universe data
3. Add design system CSS imports and styling
4. Implement tab switching functionality
5. Add Lucide icons for visual elements
6. Ensure 48px height and responsive behavior
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented TopBar component with:
- Universe selector dropdown using useUniverseStore
- Navigation tabs (Stories/Universe) with active state indication
- 48px height following Minimal Top Bar design
- Design system tokens for colors, buttons, and styling
- Lucide icons (BookOpen, Globe, ChevronDown)
- Responsive behavior (hides text on mobile, shows icons only)
- Proper hover states and accessibility

Files created:
- src/components/layout/TopBar.tsx - Main component
- src/components/layout/TopBar.css - Styling with design tokens
<!-- SECTION:NOTES:END -->
