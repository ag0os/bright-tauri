---
id: task-29
title: 'Task 1.3: Generate TypeScript Types from Rust'
status: To Do
assignee: []
created_date: '2025-10-31 19:26'
labels:
  - setup
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure frontend has latest TypeScript types from backend models using ts-rs type generation.

Steps:
1. Run 'cd src-tauri && cargo test --lib' to generate types
2. Verify types exist in src/types/ for Universe, Story, Element, and related types
3. Create a types index file if needed for easier imports

Depends on: Task 1.1
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TypeScript types available for all domain models
- [ ] #2 No type errors when importing from @/types
- [ ] #3 Types index file created for easier imports
- [ ] #4 Types match current backend models
<!-- AC:END -->
