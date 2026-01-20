---
id: task-118
title: 'dbv-7.2: Integrate useAutoSnapshot into StoryEditor'
status: To Do
assignee: []
created_date: '2026-01-15 13:40'
labels:
  - dbv
  - frontend
  - react
dependencies:
  - task-117
  - task-109
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add useAutoSnapshot hook to StoryEditor component to enable automatic history restore point creation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 useAutoSnapshot imported and used in StoryEditor
- [x] #2 Hook receives settings from useSettingsStore (trigger, threshold)
- [x] #3 Hook enabled when story is loaded and settings allow
- [x] #4 Editor creates snapshots based on user-configured trigger
- [x] #5 Snapshot creation works alongside 30s auto-save (two-layer model)
<!-- AC:END -->
