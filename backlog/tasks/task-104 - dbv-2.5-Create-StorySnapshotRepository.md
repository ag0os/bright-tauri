---
id: task-104
title: 'dbv-2.5: Create StorySnapshotRepository'
status: Done
assignee: []
created_date: '2026-01-15 13:37'
labels:
  - dbv
  - backend
  - rust
dependencies:
  - task-101
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement repository for story_snapshots table with CRUD operations and retention policy support.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 create() method: inserts new snapshot record
- [x] #2 get() method: retrieves snapshot by id
- [x] #3 get_latest() method: returns most recent snapshot for a version
- [x] #4 list_by_version() method: returns all snapshots for a version ordered by created_at DESC
- [x] #5 update_content() method: updates snapshot content in place
- [x] #6 delete() method: removes single snapshot
- [x] #7 delete_oldest() method: removes oldest snapshots keeping N most recent, returns deleted count
- [x] #8 Unit tests for all repository methods
<!-- AC:END -->
