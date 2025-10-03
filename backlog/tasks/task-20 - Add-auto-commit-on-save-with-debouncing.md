---
id: task-20
title: Add auto-commit on save with debouncing
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement auto-commit functionality that automatically commits story changes to Git after a debounced delay. This provides automatic versioning without requiring manual commits while avoiding excessive commit noise.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 System detects story content changes
- [ ] #2 Changes are debounced (wait N seconds after last edit before committing)
- [ ] #3 Auto-commit creates commit with timestamp-based message
- [ ] #4 Auto-commit only commits changed files, not entire repo
- [ ] #5 User can configure debounce delay or disable auto-commit
- [ ] #6 System handles errors gracefully if Git operation fails
- [ ] #7 Unit tests verify debouncing and commit behavior
<!-- AC:END -->
