---
id: task-98
title: 'dbv-1.1: Create story_versions and story_snapshots tables'
status: To Do
assignee: []
created_date: '2026-01-15 13:34'
labels:
  - dbv
  - backend
  - database
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add new database tables for versioning system: story_versions (id, story_id, name, timestamps) and story_snapshots (id, version_id, content, created_at) with proper indexes and foreign keys.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 story_versions table created with id, story_id, name, created_at, updated_at columns
- [x] #2 story_snapshots table created with id, version_id, content, created_at columns
- [x] #3 Indexes created for story_id and version_id lookups
- [x] #4 Unique constraint on (story_id, name) for versions
- [x] #5 CASCADE DELETE configured for foreign keys
<!-- AC:END -->
