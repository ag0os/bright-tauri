---
id: task-102
title: 'dbv-2.3: Update Story model for versioning'
status: Done
assignee: []
created_date: '2026-01-15 13:36'
labels:
  - dbv
  - backend
  - rust
dependencies:
  - task-100
  - task-101
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify Story struct to add versioning fields and remove git fields. Add optional inline StoryVersion and StorySnapshot for JOINed queries.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 active_version_id: Option<String> field added
- [x] #2 active_snapshot_id: Option<String> field added
- [x] #3 active_version: Option<StoryVersion> field added for inline data
- [x] #4 active_snapshot: Option<StorySnapshot> field added for inline data
- [x] #5 content field removed
- [x] #6 git_repo_path field removed
- [x] #7 current_branch field removed
- [x] #8 staged_changes field removed
- [x] #9 TypeScript types regenerated via cargo test --lib
<!-- AC:END -->
