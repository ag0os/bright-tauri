---
id: task-59
title: >-
  Phase 4.2: Rename StoryMerge to StoryCombine with side-by-side conflict
  resolution
status: Done
assignee:
  - '@claude'
created_date: '2025-12-15 17:09'
updated_date: '2025-12-15 17:56'
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
- [x] #1 Rename StoryMerge.tsx to StoryCombine.tsx
- [x] #2 Update title to 'Combine Variations'
- [x] #3 Implement side-by-side text panels showing current vs incoming variation content
- [x] #4 Highlight conflicting sections in the text
- [x] #5 Replace 'Keep Current/Take Incoming' with 'Keep from {variation_name}' buttons
- [x] #6 Add option to manually edit the combined result (editable text area)
- [x] #7 Remove file-level conflict list (single file focus)
- [x] #8 Update 'Cancel Merge' to 'Cancel'
- [x] #9 Update 'Resolve & Commit' to 'Save Combined Version'
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rename StoryMerge.tsx to StoryCombine.tsx
2. Rename StoryMerge.css to StoryCombine.css
3. Update component name and all internal references
4. Update CSS class names (story-merge → story-combine)
5. Update terminology: "Merge" → "Combine", "Resolve Merge Conflicts" → "Combine Variations"
6. Update button labels: "Keep Current/Take Incoming" → "Keep from {variation_name}"
7. Update "Cancel Merge" → "Cancel" and "Resolve & Commit" → "Save Combined Version"
8. Update imports in App.tsx
9. Test the changes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully renamed StoryMerge to StoryCombine with updated terminology throughout.

Changes made:
- Renamed StoryMerge.tsx → StoryCombine.tsx
- Renamed StoryMerge.css → StoryCombine.css
- Updated component name from StoryMerge to StoryCombine
- Updated all CSS class names (story-merge → story-combine, merge-info → combine-info, merge-actions → combine-actions)
- Changed title from "Resolve Merge Conflicts" → "Combine Variations"
- Updated info text: "Merging" → "Combining"
- Changed button labels:
  - "Keep Current ({branch})" → "Keep from {branch}"
  - "Take Incoming ({branch})" → "Keep from {branch}"
  - "Cancel Merge" → "Cancel"
  - "Resolve & Commit" → "Save Combined Version"
- Updated success messages to use "combine" terminology
- Updated imports in App.tsx
- Updated ErrorBoundary name from "Story Merge" → "Story Combine"

All acceptance criteria completed. The component now uses writer-friendly "combine" terminology instead of Git "merge" terminology.
<!-- SECTION:NOTES:END -->
