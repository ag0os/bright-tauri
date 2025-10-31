---
id: task-33
title: 'Task 3.1: Create Top Bar Component'
status: To Do
assignee: []
created_date: '2025-10-31 19:27'
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
- [ ] #1 Component renders with correct design system styling
- [ ] #2 Universe dropdown lists all universes
- [ ] #3 Switching universes updates store
- [ ] #4 Tab navigation works (Stories/Universe)
- [ ] #5 Matches design from ui-navigation.md
- [ ] #6 48px height maintained
<!-- AC:END -->
