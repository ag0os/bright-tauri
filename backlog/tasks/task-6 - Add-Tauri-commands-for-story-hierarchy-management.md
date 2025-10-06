---
id: task-6
title: Add Tauri commands for story hierarchy management
status: Done
assignee: []
created_date: '2025-10-03 19:23'
updated_date: '2025-10-06 16:00'
labels:
  - backend
  - story-hierarchy
  - tauri
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Tauri commands that expose story hierarchy operations to the frontend: listing children, reordering children, and getting parent with children. These commands bridge the repository layer to the UI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 list_story_children command accepts parent_id and returns ordered children
- [ ] #2 reorder_story_children command accepts parent_id and story_id array
- [ ] #3 get_story_with_children command returns parent and children tuple
- [ ] #4 All commands have proper error handling and return Result types
- [ ] #5 Commands are registered in Tauri generate_handler
- [ ] #6 TypeScript types are generated for all command parameters and returns
<!-- AC:END -->
