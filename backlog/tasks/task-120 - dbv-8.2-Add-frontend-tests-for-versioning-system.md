---
id: task-120
title: 'dbv-8.2: Add frontend tests for versioning system'
status: To Do
assignee: []
created_date: '2026-01-15 13:41'
labels:
  - dbv
  - frontend
  - react
  - testing
dependencies:
  - task-111
  - task-112
  - task-118
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement comprehensive frontend tests for the database versioning UI components and hooks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Editor loads content from active snapshot test
- [ ] #2 Auto-save (30s) updates active snapshot via story_id test
- [ ] #3 Version list displays correctly test
- [ ] #4 Version switching works test
- [ ] #5 Version creation saves snapshot first test
- [ ] #6 Version deletion warning for active version test
- [ ] #7 Snapshot history displays correctly test
- [ ] #8 Snapshot restoration works test
- [ ] #9 Character threshold triggers snapshot creation test
- [ ] #10 On-leave trigger creates snapshot test
<!-- AC:END -->
