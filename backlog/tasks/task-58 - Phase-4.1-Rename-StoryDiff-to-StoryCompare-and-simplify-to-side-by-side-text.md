---
id: task-58
title: 'Phase 4.1: Rename StoryDiff to StoryCompare and simplify to side-by-side text'
status: To Do
assignee: []
created_date: '2025-12-15 17:09'
labels:
  - frontend
  - versioning
dependencies:
  - task-54
  - task-55
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rename the diff view and implement a simpler side-by-side text comparison instead of code-style diffs
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Rename StoryDiff.tsx to StoryCompare.tsx
- [ ] #2 Update title to 'Compare Variations'
- [ ] #3 Show variation display names in dropdown selectors
- [ ] #4 Implement side-by-side text panels showing full story content from each variation
- [ ] #5 Highlight changed sections between the two versions (not line-by-line code diff)
- [ ] #6 Remove file-level diff display (stories are single files)
- [ ] #7 Update status labels: Added->New, Modified->Changed, Deleted->Removed
<!-- AC:END -->
