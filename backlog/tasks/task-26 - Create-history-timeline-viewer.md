---
id: task-26
title: Create history timeline viewer
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-12-04 16:47'
labels:
  - frontend
  - git
  - ui
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build visual timeline component that displays commit history for a story. Shows commits chronologically with messages, authors, timestamps, and allows restoring to previous commits.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Component calls git_get_history Tauri command
- [x] #2 Component displays commits in reverse chronological order
- [x] #3 Component shows commit hash (abbreviated), message, and timestamp
- [x] #4 Component provides button to restore to any commit
- [x] #5 Restore action shows confirmation dialog with impact warning
- [x] #6 Component calls git_restore_commit when user confirms
- [x] #7 Component refreshes history after restore operation
- [x] #8 Component handles pagination for long histories
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Read existing types and stores to understand data structures
2. Create StoryHistory.tsx view component with Git history fetching
3. Create StoryHistory.css with design system tokens
4. Add story-history route to navigation store
5. Integrate route handler in App.tsx
6. Add History button to StoryEditor toolbar
7. Test complete flow and verify all acceptance criteria
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created StoryHistory.tsx with timeline view, pagination, restore confirmation dialog. Added story-history route. Added History button to StoryEditor.
<!-- SECTION:NOTES:END -->
