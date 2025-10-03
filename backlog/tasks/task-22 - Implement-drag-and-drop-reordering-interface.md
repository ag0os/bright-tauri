---
id: task-22
title: Implement drag-and-drop reordering interface
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - frontend
  - story-hierarchy
  - ui
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build drag-and-drop interface for reordering child stories within a parent. Users should be able to visually reorder chapters, scenes, or other children by dragging them to new positions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 UI provides draggable handles on child story list items
- [ ] #2 Drag interaction provides visual feedback during drag
- [ ] #3 Drop updates visual order immediately (optimistic update)
- [ ] #4 Drop calls reorder_story_children Tauri command with new order
- [ ] #5 UI handles errors and reverts order if backend call fails
- [ ] #6 UI works on both desktop platforms
<!-- AC:END -->
