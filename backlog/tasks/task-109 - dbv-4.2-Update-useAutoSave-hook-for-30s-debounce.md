---
id: task-109
title: 'dbv-4.2: Update useAutoSave hook for 30s debounce'
status: To Do
assignee: []
created_date: '2026-01-15 13:38'
labels:
  - dbv
  - frontend
  - react
  - hooks
dependencies:
  - task-108
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify useAutoSave hook to use 30s debounce delay and prepare for snapshot-based saving.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Default delay changed from 2000ms to 30000ms
- [x] #2 Hook works with new save signature (storyId, content, wordCount)
- [x] #3 Existing tests updated for new delay
<!-- AC:END -->
