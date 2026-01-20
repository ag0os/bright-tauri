---
id: task-108
title: 'dbv-4.1: Update StoryEditor to use snapshots'
status: Done
assignee: []
created_date: '2026-01-15 13:38'
labels:
  - dbv
  - frontend
  - react
dependencies:
  - task-106
  - task-107
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify StoryEditor component to load content from active_snapshot and save via update_snapshot_content command.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Load content from story.active_snapshot?.content instead of story.content
- [x] #2 Save callback uses update_snapshot_content(storyId, content, wordCount)
- [x] #3 Remove any local tracking of snapshot IDs (backend resolves)
- [x] #4 Handle null active_snapshot gracefully (empty content)
<!-- AC:END -->
