---
id: task-105
title: 'dbv-3.1: Add version Tauri commands'
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
Implement Tauri commands for story version management: create, list, rename, delete, switch.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 create_story_version(story_id, name, content) command: creates version + first snapshot, updates active pointers
- [x] #2 list_story_versions(story_id) command: returns all versions for a story
- [x] #3 rename_story_version(version_id, new_name) command: updates version name
- [x] #4 delete_story_version(version_id) command: deletes version with last-version error and auto-switch for active version
- [x] #5 switch_story_version(story_id, version_id) command: switches active version and sets active_snapshot to latest
- [x] #6 All commands registered in invoke_handler
<!-- AC:END -->
