---
id: task-77
title: Create Container Views for Hierarchy Management
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
labels:
  - container-refactor
  - frontend
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build new React views for viewing and managing the container hierarchy. Users need to view container details, navigate the tree structure, and manage child containers and stories.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ContainerView component created in src/views/ContainerView.tsx
- [ ] #2 ContainerChildrenView component created for listing children
- [ ] #3 View displays container details (title, description, type, git repo status)
- [ ] #4 Child list shows both child containers and stories with clear visual distinction
- [ ] #5 Navigation links allow drilling down into child containers or opening story editor
- [ ] #6 Reordering UI allows drag-and-drop or up/down buttons for children
- [ ] #7 View integrates with useContainersStore for state management
- [ ] #8 Loading and error states handled gracefully
<!-- AC:END -->
