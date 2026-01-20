---
id: task-110
title: 'dbv-4.3: Remove useAutoCommit hook'
status: Done
assignee: []
created_date: '2026-01-15 13:38'
labels:
  - dbv
  - frontend
  - cleanup
dependencies:
  - task-108
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Delete the Git-based auto-commit hook and its tests as they are no longer needed with database versioning.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 src/hooks/useAutoCommit.ts deleted
- [x] #2 src/hooks/useAutoCommit.test.ts deleted
- [x] #3 All imports of useAutoCommit removed from codebase
- [x] #4 StoryEditor no longer references useAutoCommit
<!-- AC:END -->
