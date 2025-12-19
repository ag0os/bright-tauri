---
id: task-71
title: Update Story Tauri Commands for Container Model
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - backend
  - tauri
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplify story commands by removing container logic and updating to work with container_id. Stories are now created either standalone or within a container, with no hierarchical parent_story_id logic.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 create_story command updated to accept optional container_id parameter
- [ ] #2 list_children removed from story commands (replaced by container commands)
- [ ] #3 reorder_story_children replaced with reorder within container context
- [ ] #4 Story commands no longer branch on container vs content logic
- [ ] #5 Commands work correctly for both standalone and container-based stories
- [ ] #6 All updated commands registered in generate_handler! macro
<!-- AC:END -->
