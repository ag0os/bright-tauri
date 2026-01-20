---
id: task-101
title: 'dbv-2.2: Create StorySnapshot Rust model'
status: Done
assignee: []
created_date: '2026-01-15 13:35'
labels:
  - dbv
  - backend
  - rust
dependencies:
  - task-99
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create StorySnapshot model in src-tauri/src/models/story_snapshot.rs with ts-rs export for TypeScript type generation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 StorySnapshot struct created with id, version_id, content, created_at fields
- [x] #2 Derive macros added: Debug, Clone, Serialize, Deserialize, TS
- [x] #3 ts-rs export directive configured for src/types/
- [x] #4 Model registered in models/mod.rs
<!-- AC:END -->
