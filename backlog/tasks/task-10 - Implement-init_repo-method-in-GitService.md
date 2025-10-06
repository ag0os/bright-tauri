---
id: task-10
title: Implement init_repo method in GitService
status: Done
assignee: []
created_date: '2025-10-03 19:23'
updated_date: '2025-10-06 20:21'
labels:
  - backend
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the init_repo() method that initializes a new Git repository for a story variation. Creates repo directory under ~/Library/Application Support/bright/git-repos/{story_id}/ and initializes Git with an initial commit.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Method accepts story_id parameter
- [ ] #2 Creates directory at correct path for the platform
- [ ] #3 Initializes bare Git repository using git2
- [ ] #4 Creates initial commit with metadata.json
- [ ] #5 Returns PathBuf to the created repository
- [ ] #6 Handles errors if directory already exists
- [ ] #7 Unit tests verify repo creation and structure
<!-- AC:END -->
