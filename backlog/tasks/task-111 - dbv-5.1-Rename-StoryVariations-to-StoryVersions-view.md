---
id: task-111
title: 'dbv-5.1: Rename StoryVariations to StoryVersions view'
status: To Do
assignee: []
created_date: '2026-01-15 13:39'
labels:
  - dbv
  - frontend
  - react
  - views
dependencies:
  - task-105
  - task-108
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename and refactor StoryVariations view to StoryVersions, using database versioning instead of Git branches.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 StoryVariations.tsx renamed to StoryVersions.tsx
- [ ] #2 Route updated from /variations to /versions
- [ ] #3 View lists versions via list_story_versions(story_id)
- [ ] #4 Create version flow: save current snapshot, then create_story_version(story_id, name, content)
- [ ] #5 Switch version via switch_story_version(story_id, version_id)
- [ ] #6 Rename version via rename_story_version(version_id, new_name)
- [ ] #7 Delete version with warning for active version, error handling for last version
- [ ] #8 All Git branch references removed
<!-- AC:END -->
