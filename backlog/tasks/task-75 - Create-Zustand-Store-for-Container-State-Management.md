---
id: task-75
title: Create Zustand Store for Container State Management
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - frontend
  - state
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a new Zustand store to manage container state, hierarchical tree data, and container operations. This store handles loading containers, managing parent-child relationships, and coordinating container CRUD actions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 useContainersStore created in src/stores/useContainersStore.ts
- [ ] #2 State includes: containers array, containerChildren map (by parent ID), loading states
- [ ] #3 loadContainers action fetches containers for universe
- [ ] #4 loadContainerChildren action fetches children for a container
- [ ] #5 createContainer action calls Tauri command and updates state
- [ ] #6 updateContainer action updates container and refreshes state
- [ ] #7 deleteContainer action removes container and updates tree
- [ ] #8 reorderChildren action reorders child containers
- [ ] #9 Store correctly manages hierarchical container tree structure
<!-- AC:END -->
