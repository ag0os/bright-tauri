---
id: task-14
title: Implement Git history browsing
status: Done
assignee: []
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:21'
labels:
  - backend
  - git
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement get_history() and restore_commit() methods in GitService. These enable viewing commit history and time-traveling to previous versions of a story.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 get_history accepts repo_path and branch parameters
- [ ] #2 get_history returns Vec of Commit structs with hash, message, author, and timestamp
- [ ] #3 Commits are ordered from newest to oldest
- [ ] #4 restore_commit accepts repo_path and commit_hash parameters
- [ ] #5 restore_commit checks out files from specified commit
- [ ] #6 restore_commit returns error if commit hash is invalid
- [ ] #7 Unit tests verify history retrieval and commit restoration
<!-- AC:END -->
