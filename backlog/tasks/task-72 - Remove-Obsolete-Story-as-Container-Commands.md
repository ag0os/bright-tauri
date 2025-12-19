---
id: task-72
title: Remove Obsolete Story-as-Container Commands
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - backend
  - tauri
  - cleanup
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove Tauri commands that treated stories as containers, now replaced by dedicated container commands. This cleanup eliminates dead code and prevents confusion about which commands to use.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 list_story_children command removed
- [ ] #2 get_story_with_children command removed
- [ ] #3 reorder_story_children command removed (replaced by reorder_container_children)
- [ ] #4 Removed commands unregistered from generate_handler! macro
- [ ] #5 No frontend code references removed commands
- [ ] #6 Application compiles without errors after removal
<!-- AC:END -->
