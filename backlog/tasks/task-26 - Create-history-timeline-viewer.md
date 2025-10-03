---
id: task-26
title: Create history timeline viewer
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
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
- [ ] #1 Component calls git_get_history Tauri command
- [ ] #2 Component displays commits in reverse chronological order
- [ ] #3 Component shows commit hash (abbreviated), message, and timestamp
- [ ] #4 Component provides button to restore to any commit
- [ ] #5 Restore action shows confirmation dialog with impact warning
- [ ] #6 Component calls git_restore_commit when user confirms
- [ ] #7 Component refreshes history after restore operation
- [ ] #8 Component handles pagination for long histories
<!-- AC:END -->
