---
id: task-30
title: 'Task 2.1: Create Universe Store'
status: To Do
assignee: []
created_date: '2025-10-31 19:26'
labels:
  - state-management
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement Zustand store for managing current universe state with persistence and Tauri backend integration.

Store location: src/stores/useUniverseStore.ts

State to manage:
- Current selected universe
- List of all universes
- Loading states
- Actions: setCurrentUniverse, loadUniverses, createUniverse

Features:
- Use persist middleware to remember selected universe across sessions
- Integrate with Tauri commands (invoke 'list_universes', 'get_universe')

Depends on: Tasks 1.1, 1.2, 1.3
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Store can be imported and used in components
- [ ] #2 Persistence works (reload app, universe selection persists)
- [ ] #3 Tauri commands integrate correctly (list_universes, get_universe)
- [ ] #4 Loading states handled properly
- [ ] #5 Store follows Zustand best practices
<!-- AC:END -->
