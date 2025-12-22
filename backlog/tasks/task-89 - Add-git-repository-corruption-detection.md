---
id: task-89
title: Add git repository corruption detection
status: Done
assignee:
  - '@agent'
created_date: '2025-12-22 16:30'
updated_date: '2025-12-22 18:04'
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
- [x] #1 Add validation for git repo integrity (HEAD, refs exist)
- [x] #2 Provide clear error messages for corrupted repos
- [x] #3 Consider auto-repair functionality
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented git repository corruption detection for containers and stories.

**Implementation Details:**

1. Added GitServiceError::RepositoryCorrupted variant
   - New error type specifically for corruption issues
   - Clear Display implementation with helpful messages

2. Created GitService::validate_repo_integrity() function
   - Checks if .git directory exists
   - Validates HEAD reference can be resolved to a commit
   - Verifies refs/heads directory exists
   - Confirms at least one branch exists
   - Returns detailed error messages for each failure scenario

3. Updated ensure_container_git_repo command
   - Validates repository integrity before assuming it's valid
   - Provides clear error message with fix instructions on corruption
   - Suggests manual repair or reinitialize options

4. Updated ensure_story_git_repo command
   - Same validation logic as containers
   - Clear error messages with recovery instructions

5. Auto-repair approach NOT implemented
   - Decision: Auto-repair could lead to data loss
   - Instead: Provide clear error messages with manual fix options
   - Users can delete corrupted repo and reinitialize if needed

6. Comprehensive test coverage (6 new tests)
   - Valid repository (baseline test)
   - Missing .git directory
   - Corrupted HEAD reference
   - Missing refs/heads directory
   - No branches in repository
   - Nonexistent repository path

**Error Message Examples:**
- "Git repository corruption detected at [path]: Missing .git directory at [path]. The repository may not be initialized or the .git directory has been deleted."
- "HEAD reference exists but cannot be resolved to a commit: [error]. The repository may have a corrupted HEAD."
- "No branches found in repository. The repository may be corrupted or incompletely initialized."

**How to Fix:**
Users encountering corruption can:
1. Manually repair the repository using git commands
2. Delete the corrupted repo and set git_repo_path to null/empty, then call ensure_*_git_repo again

All 217 tests pass.
<!-- SECTION:NOTES:END -->
