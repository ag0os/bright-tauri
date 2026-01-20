---
id: task-116
title: 'dbv-6.3: Remove Git-related frontend code and types'
status: Done
assignee: []
created_date: '2026-01-15 13:40'
labels:
  - dbv
  - frontend
  - cleanup
dependencies:
  - task-114
  - task-113
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Clean up all Git-related frontend code including types, settings, and any remaining references.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Git-related TypeScript types removed from src/types/
- [x] #2 useSettingsStore updated to remove git settings (autoCommitMode, autoCommitDelay, etc.)
- [x] #3 New snapshot settings added to useSettingsStore (snapshotTrigger, snapshotCharacterThreshold, maxSnapshotsPerVersion)
- [x] #4 All Git imports and references removed from frontend
- [x] #5 TypeScript compiles without errors
<!-- AC:END -->
