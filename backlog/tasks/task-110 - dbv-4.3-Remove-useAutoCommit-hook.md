---
id: task-110
title: 'dbv-4.3: Remove useAutoCommit hook'
status: To Do
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
- [ ] #1 src/hooks/useAutoCommit.ts deleted
- [ ] #2 src/hooks/useAutoCommit.test.ts deleted
- [ ] #3 All imports of useAutoCommit removed from codebase
- [ ] #4 StoryEditor no longer references useAutoCommit
<!-- AC:END -->
