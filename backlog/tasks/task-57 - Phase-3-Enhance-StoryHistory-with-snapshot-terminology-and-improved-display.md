---
id: task-57
title: 'Phase 3: Enhance StoryHistory with snapshot terminology and improved display'
status: To Do
assignee: []
created_date: '2025-12-15 17:09'
updated_date: '2025-12-15 17:15'
labels:
  - frontend
  - versioning
dependencies:
  - task-53
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the StoryHistory view to use snapshot terminology and show information in a more user-friendly format
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Change display format to: relative_time - note (short_hash)
- [ ] #2 Example format: '2 hours ago - Chapter 3 rewrite (abc1234)'
- [ ] #3 For auto-saves without notes, show: '2 hours ago - Auto-save (abc1234)'
- [ ] #4 Update 'Restore' button text to 'Restore this snapshot'
- [ ] #5 Improve restore confirmation dialog with clearer messaging
- [ ] #6 Keep tooltip showing full timestamp on hover

- [ ] #7 Update view title from 'Version History' to 'Snapshots' for terminology consistency
<!-- AC:END -->
