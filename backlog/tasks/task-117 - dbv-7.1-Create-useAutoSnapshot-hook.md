---
id: task-117
title: 'dbv-7.1: Create useAutoSnapshot hook'
status: To Do
assignee: []
created_date: '2026-01-15 13:40'
labels:
  - dbv
  - frontend
  - react
  - hooks
dependencies:
  - task-106
  - task-116
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement new useAutoSnapshot hook for creating history restore points based on character count threshold or on-leave trigger.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Hook accepts storyId, content, enabled, trigger (on_leave | character_count), characterThreshold
- [x] #2 Character threshold trigger: creates snapshot when chars increase by threshold (default 500)
- [x] #3 On-leave trigger: creates snapshot on component unmount
- [x] #4 Tracks lastSnapshotCharCount to avoid duplicate snapshots
- [x] #5 Calls create_story_snapshot(storyId, content) on trigger
- [x] #6 Unit tests for both trigger modes
<!-- AC:END -->
