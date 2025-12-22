---
id: task-97
title: Add missing test cases from PR review
status: To Do
assignee: []
created_date: '2025-12-22 16:36'
labels:
  - testing
  - pr-feedback
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
PR review identified several missing test scenarios that should be added for better coverage and edge case handling.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Add test for concurrent container creation with same parent
- [ ] #2 Add test for container deletion while git operation in progress
- [ ] #3 Add test for reorder with invalid container IDs (not children of parent)
- [ ] #4 Add frontend test for container creation failure error state
- [ ] #5 Add integration test for full series workflow (create series -> novels -> chapters -> delete)
<!-- AC:END -->
