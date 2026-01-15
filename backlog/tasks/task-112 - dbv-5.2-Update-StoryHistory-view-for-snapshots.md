---
id: task-112
title: 'dbv-5.2: Update StoryHistory view for snapshots'
status: To Do
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
- [ ] #1 View lists snapshots via list_story_snapshots(active_version_id)
- [ ] #2 Each snapshot shows created_at timestamp (absolute format)
- [ ] #3 Restore action calls switch_story_snapshot(story_id, snapshot_id)
- [ ] #4 No manual delete UI (retention policy handles cleanup)
- [ ] #5 All Git commit references removed
- [ ] #6 Empty state when no snapshots exist
<!-- AC:END -->
