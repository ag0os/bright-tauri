---
id: task-59
title: >-
  Phase 4.2: Rename StoryMerge to StoryCombine with side-by-side conflict
  resolution
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
Rename the merge view and implement a simplified side-by-side conflict resolution UI for story text
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Rename StoryMerge.tsx to StoryCombine.tsx
- [ ] #2 Update title to 'Combine Variations'
- [ ] #3 Implement side-by-side text panels showing current vs incoming variation content
- [ ] #4 Highlight conflicting sections in the text
- [ ] #5 Replace 'Keep Current/Take Incoming' with 'Keep from {variation_name}' buttons
- [ ] #6 Add option to manually edit the combined result (editable text area)
- [ ] #7 Remove file-level conflict list (single file focus)
- [ ] #8 Update 'Cancel Merge' to 'Cancel'
- [ ] #9 Update 'Resolve & Commit' to 'Save Combined Version'
<!-- AC:END -->
