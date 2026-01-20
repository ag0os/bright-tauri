---
id: task-112
title: 'dbv-5.2: Update StoryHistory view for snapshots'
status: Done
assignee: []
created_date: '2026-01-15 13:39'
labels:
  - dbv
  - frontend
  - react
  - views
dependencies:
  - task-106
  - task-108
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor StoryHistory view to show database snapshots instead of Git commit history.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 View lists snapshots via list_story_snapshots(active_version_id)
- [x] #2 Each snapshot shows created_at timestamp (absolute format)
- [x] #3 Restore action calls switch_story_snapshot(story_id, snapshot_id)
- [x] #4 No manual delete UI (retention policy handles cleanup)
- [x] #5 All Git commit references removed
- [x] #6 Empty state when no snapshots exist
<!-- AC:END -->
