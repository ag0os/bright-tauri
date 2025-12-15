---
id: task-58
title: 'Phase 4.1: Rename StoryDiff to StoryCompare and simplify to side-by-side text'
status: In Progress
assignee:
  - '@claude'
created_date: '2025-12-15 17:09'
updated_date: '2025-12-15 17:53'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create TodoWrite list with implementation steps
2. Rename StoryDiff.tsx to StoryCompare.tsx
3. Rename StoryDiff.css to StoryCompare.css
4. Rename StoryDiff.test.tsx to StoryCompare.test.tsx
5. Update component name and all internal references
6. Update title from "Compare Versions" to "Compare Variations"
7. Update terminology: branches -> variations
8. Update status labels: Added->New, Modified->Changed, Deleted->Removed
9. Simplify to side-by-side text comparison (remove line-by-line diff parsing)
10. Update dropdowns to use variation.display_name
11. Update imports in App.tsx
12. Test the changes
13. Mark acceptance criteria as complete
14. Commit the changes
<!-- SECTION:PLAN:END -->
