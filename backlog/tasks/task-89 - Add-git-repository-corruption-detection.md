---
id: task-89
title: Add git repository corruption detection
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-22 16:30'
updated_date: '2025-12-22 18:01'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a validate_git_repo_integrity helper function in GitService that:
   - Checks if .git directory exists
   - Validates HEAD reference can be resolved
   - Checks refs/heads directory exists and has at least one branch
   - Returns clear error messages for each type of corruption
2. Update ensure_container_git_repo to use validation before assuming repo is valid
3. Update ensure_story_git_repo to use validation before assuming repo is valid
4. Add tests for corruption detection scenarios
5. Consider auto-repair options (reinitialize with warning)
6. Run cargo test to ensure all tests pass
7. Commit changes
<!-- SECTION:PLAN:END -->
