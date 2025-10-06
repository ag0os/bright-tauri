---
id: task-11
title: Implement commit_file and commit_all methods
status: Done
assignee: []
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:21'
labels:
  - backend
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement commit_file() for committing a specific file and commit_all() for committing all changes in a Git repository. These methods enable granular and bulk commits for story content changes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 commit_file accepts repo_path, file_path, content, and message parameters
- [ ] #2 commit_file writes content to file and stages it
- [ ] #3 commit_file creates commit and returns commit hash
- [ ] #4 commit_all accepts repo_path and message parameters
- [ ] #5 commit_all stages all modified/new files in repo
- [ ] #6 commit_all creates commit and returns commit hash
- [ ] #7 Both methods handle errors appropriately
- [ ] #8 Unit tests verify file and all commits work correctly
<!-- AC:END -->
