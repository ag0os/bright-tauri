---
id: task-119
title: 'dbv-8.1: Add backend tests for versioning system'
status: To Do
assignee: []
created_date: '2026-01-15 13:40'
labels:
  - dbv
  - backend
  - rust
  - testing
dependencies:
  - task-105
  - task-106
  - task-107
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement comprehensive backend tests for the database versioning system covering repositories and commands.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 StoryVersionRepository CRUD tests
- [x] #2 StorySnapshotRepository CRUD tests
- [x] #3 Story creation auto-creates version + snapshot test
- [x] #4 Version switching updates active pointers test
- [x] #5 Snapshot switching updates active pointer test
- [x] #6 Cascade delete (story → versions → snapshots) test
- [x] #7 Retention policy deletes oldest snapshots test
- [x] #8 update_snapshot_content updates word_count and last_edited_at test
- [x] #9 Delete last version returns error test
- [x] #10 Delete active version auto-switches test
<!-- AC:END -->
