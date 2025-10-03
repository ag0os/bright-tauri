---
id: task-17
title: Implement file creation in Git repositories
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create functionality to write child story content as markdown files in parent's Git repository. When a chapter or scene is created, write its content to a file using the naming strategy and commit to Git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Function accepts story record, parent repo path, and content
- [ ] #2 Function generates filename using naming strategy
- [ ] #3 Function writes content to file in repo directory
- [ ] #4 Function uses GitService to commit the new file
- [ ] #5 Function updates story record with relative file path
- [ ] #6 Function handles errors if file already exists
- [ ] #7 Unit tests verify file creation and Git commit
<!-- AC:END -->
