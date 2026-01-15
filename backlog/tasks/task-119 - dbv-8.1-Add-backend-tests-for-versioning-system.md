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
- [ ] #1 StoryVersionRepository CRUD tests
- [ ] #2 StorySnapshotRepository CRUD tests
- [ ] #3 Story creation auto-creates version + snapshot test
- [ ] #4 Version switching updates active pointers test
- [ ] #5 Snapshot switching updates active pointer test
- [ ] #6 Cascade delete (story → versions → snapshots) test
- [ ] #7 Retention policy deletes oldest snapshots test
- [ ] #8 update_snapshot_content updates word_count and last_edited_at test
- [ ] #9 Delete last version returns error test
- [ ] #10 Delete active version auto-switches test
<!-- AC:END -->
