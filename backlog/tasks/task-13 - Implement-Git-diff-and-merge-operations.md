---
id: task-13
title: Implement Git diff and merge operations
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - git
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement diff_branches() and merge_branches() methods in GitService. These enable comparing different story versions and merging experimental changes back into main branches.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 diff_branches accepts repo_path, branch_a, and branch_b parameters
- [ ] #2 diff_branches returns Diff struct with file changes between branches
- [ ] #3 Diff struct includes added, modified, and deleted files with content diffs
- [ ] #4 merge_branches accepts repo_path, from_branch, and into_branch parameters
- [ ] #5 merge_branches performs Git merge and returns MergeResult
- [ ] #6 MergeResult indicates success or conflict state
- [ ] #7 Methods handle merge conflicts gracefully
- [ ] #8 Unit tests verify diff and merge operations
<!-- AC:END -->
