---
id: task-73
title: Generate TypeScript Types for Container Model
status: To Do
assignee: []
created_date: '2025-12-19 18:41'
labels:
  - container-refactor
  - types
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run ts-rs type generation to create TypeScript definitions for the new Container model and updated Story model. This ensures frontend type safety when working with the new architecture.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 cargo test --lib runs successfully in src-tauri directory
- [ ] #2 Container.ts type file generated in src/types/
- [ ] #3 Story.ts type file updated with new fields (container_id, removed parent_story_id)
- [ ] #4 StoryType enum updated to content types only
- [ ] #5 Generated types match Rust struct definitions
- [ ] #6 No TypeScript compilation errors after generation
<!-- AC:END -->
