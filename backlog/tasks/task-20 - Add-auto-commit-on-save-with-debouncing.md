---
id: task-20
title: Add auto-commit on save with debouncing
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-12-04 16:41'
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
- [x] #1 System detects story content changes
- [x] #2 Changes are debounced (wait N seconds after last edit before committing)
- [x] #3 Auto-commit creates commit with timestamp-based message
- [x] #4 Auto-commit only commits changed files, not entire repo
- [x] #5 User can configure debounce delay or disable auto-commit
- [x] #6 System handles errors gracefully if Git operation fails
- [x] #7 Unit tests verify debouncing and commit behavior
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create useAutoCommit hook that extends auto-save behavior
2. Add debounced Git commit after successful save (30s delay)
3. Only commit if story has gitRepoPath
4. Use git_commit_file command with timestamp-based messages
5. Handle errors gracefully (console log, no UI disruption)
6. Add settings store for auto-commit preferences
7. Write unit tests for debouncing and commit behavior
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented auto-commit via useAutoCommit hook that works alongside existing useAutoSave. Created useSettingsStore for user preferences. 8 unit tests added.
<!-- SECTION:NOTES:END -->
