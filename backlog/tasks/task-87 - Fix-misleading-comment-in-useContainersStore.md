---
id: task-87
title: Fix misleading comment in useContainersStore
status: Done
assignee:
  - '@claude'
created_date: '2025-12-22 16:29'
updated_date: '2025-12-22 16:46'
labels:
  - frontend
  - typescript
  - pr-feedback
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Comment at useContainersStore.ts:132 says 'Stories are not deleted with container' but stories ARE deleted via CASCADE foreign key. Comment should clarify this only removes child containers from cache.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Update comment to accurately describe cache behavior vs database behavior
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated comment from 'Stories are not deleted with container' to 'Stories deleted via database CASCADE, not filtered here'. All 137 frontend tests pass.
<!-- SECTION:NOTES:END -->
