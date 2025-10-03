---
id: task-18
title: Implement file reordering and renaming
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create functionality to rename child story files when reordering occurs. When chapters are reordered, update the order prefix in filenames (001- to 003-, etc.) and commit the renames to Git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Function accepts parent repo path and ordered list of stories
- [ ] #2 Function generates new filenames based on new order
- [ ] #3 Function uses Git mv operation to rename files
- [ ] #4 Function updates story records with new file paths
- [ ] #5 Function commits the reordering to Git with descriptive message
- [ ] #6 Function handles errors if files don't exist or Git operation fails
- [ ] #7 Unit tests verify file renaming and order updates
<!-- AC:END -->
