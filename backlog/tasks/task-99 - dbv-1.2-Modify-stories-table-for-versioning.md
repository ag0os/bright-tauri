---
id: task-99
title: 'dbv-1.2: Modify stories table for versioning'
status: Done
assignee: []
created_date: '2026-01-15 13:35'
labels:
  - dbv
  - backend
  - database
dependencies:
  - task-98
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update stories table schema: add active_version_id and active_snapshot_id columns, remove content, git_repo_path, current_branch, staged_changes columns.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 active_version_id column added with FK to story_versions
- [x] #2 active_snapshot_id column added with FK to story_snapshots
- [x] #3 content column removed from stories table
- [x] #4 git_repo_path column removed
- [x] #5 current_branch column removed
- [x] #6 staged_changes column removed
<!-- AC:END -->
