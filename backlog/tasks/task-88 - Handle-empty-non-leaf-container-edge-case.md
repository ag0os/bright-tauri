---
id: task-88
title: Handle empty non-leaf container edge case
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-22 16:30'
updated_date: '2025-12-22 18:00'
labels:
  - backend
  - architecture
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Edge case identified in PR review: If a container has child containers (becomes non-leaf, no git repo), then all children are deleted, the container is left in limbo - can't have stories without git initialization. Consider adding a command to convert container to leaf by initializing git repo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Detect containers that are non-leaf but have no children
- [ ] #2 Add command or automatic handling to initialize git repo for empty containers
- [ ] #3 Add UI prompt or automatic conversion when applicable
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze the current code and identify the edge case scenario
2. Add a method to detect empty non-leaf containers (has no git_repo_path AND has no children)
3. Add a Tauri command to convert empty non-leaf container to leaf by initializing git repo
4. Write comprehensive tests for the detection and conversion logic
5. Update UI to detect and prompt users when appropriate
6. Run tests to ensure all changes work correctly
<!-- SECTION:PLAN:END -->
