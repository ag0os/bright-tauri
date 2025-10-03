---
id: task-7
title: Update TypeScript types for story hierarchy
status: To Do
assignee: []
created_date: '2025-10-03 19:23'
labels:
  - frontend
  - typescript
  - story-hierarchy
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Regenerate TypeScript types after updating StoryType enum and adding new Tauri commands. Ensure frontend has type-safe access to all story hierarchy features.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Run cargo test --lib to generate types
- [ ] #2 StoryType TypeScript enum includes all new types
- [ ] #3 New Tauri command types are available in src/types/
- [ ] #4 No TypeScript compilation errors in frontend
<!-- AC:END -->
