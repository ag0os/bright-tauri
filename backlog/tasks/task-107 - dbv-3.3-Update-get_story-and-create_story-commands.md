---
id: task-107
title: 'dbv-3.3: Update get_story and create_story commands'
status: Done
assignee: []
created_date: '2026-01-15 13:37'
labels:
  - dbv
  - backend
  - rust
  - tauri
dependencies:
  - task-102
  - task-103
  - task-104
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify existing story commands to work with versioning: get_story returns inline version/snapshot, create_story auto-creates Original version and initial snapshot.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 get_story returns story with active_version and active_snapshot populated via JOIN
- [x] #2 create_story creates Original version after story insert
- [x] #3 create_story creates initial empty snapshot after version
- [x] #4 create_story sets active_version_id and active_snapshot_id on story
- [x] #5 All operations wrapped in transaction for atomicity
<!-- AC:END -->
