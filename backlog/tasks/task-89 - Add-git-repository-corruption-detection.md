---
id: task-89
title: Add git repository corruption detection
status: To Do
assignee: []
created_date: '2025-12-22 16:30'
labels:
  - backend
  - git
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The ensure_container_git_repo function checks if .git directory exists but doesn't validate if the repo is corrupted. Consider adding corruption detection (verify refs, HEAD exist) and auto-repair or clear error messages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Add validation for git repo integrity (HEAD, refs exist)
- [ ] #2 Provide clear error messages for corrupted repos
- [ ] #3 Consider auto-repair functionality
<!-- AC:END -->
