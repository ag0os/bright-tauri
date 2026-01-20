---
id: task-106
title: 'dbv-3.2: Add snapshot Tauri commands'
status: Done
assignee: []
created_date: '2026-01-15 13:37'
labels:
  - dbv
  - backend
  - rust
  - tauri
dependencies:
  - task-103
  - task-104
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement Tauri commands for story snapshot management: create, list, update, switch, cleanup.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 create_story_snapshot(story_id, content) command: creates snapshot for active version, updates active_snapshot_id, word_count, last_edited_at, applies retention
- [x] #2 list_story_snapshots(version_id) command: returns all snapshots for a version
- [x] #3 update_snapshot_content(story_id, content, word_count) command: updates active snapshot content and story metadata (30s auto-save target)
- [x] #4 switch_story_snapshot(story_id, snapshot_id) command: restores to previous snapshot
- [x] #5 cleanup_old_snapshots(version_id, keep_count) command: deletes oldest snapshots beyond limit
- [x] #6 All commands registered in invoke_handler
<!-- AC:END -->
