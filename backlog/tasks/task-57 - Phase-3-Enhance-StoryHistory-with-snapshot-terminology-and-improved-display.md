---
id: task-57
title: 'Phase 3: Enhance StoryHistory with snapshot terminology and improved display'
status: Done
assignee:
  - '@claude'
created_date: '2025-12-15 17:09'
updated_date: '2025-12-15 17:49'
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
- [x] #1 Change display format to: relative_time - note (short_hash)
- [x] #2 Example format: '2 hours ago - Chapter 3 rewrite (abc1234)'
- [x] #3 For auto-saves without notes, show: '2 hours ago - Auto-save (abc1234)'
- [x] #4 Update 'Restore' button text to 'Restore this snapshot'
- [x] #5 Improve restore confirmation dialog with clearer messaging
- [x] #6 Keep tooltip showing full timestamp on hover

- [x] #7 Update view title from 'Version History' to 'Snapshots' for terminology consistency
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update page title from "Version History" to "Snapshots"
2. Create helper function to detect auto-save messages
3. Update display format to: relative_time - note (short_hash)
4. Handle auto-save messages with "Auto-save" text
5. Update "Restore" button text to "Restore this snapshot"
6. Update confirmation dialog with clearer messaging about snapshots and variations
7. Test the changes
8. Commit changes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Enhanced StoryHistory component to use writer-friendly snapshot terminology instead of Git-specific version control language.

## Changes Made

### 1. Display Format Enhancement
- Created `formatCommitDisplay()` function to format snapshots as: `{relative_time} - {message} ({short_hash})`
- Example: "2 hours ago - Chapter 3 rewrite (abc1234)"
- Replaced separate commit-hash, commit-message, and commit-meta sections with single commit-display element
- Added tooltip with full timestamp on hover

### 2. Auto-save Detection
- Created `isAutoSaveMessage()` helper function to detect auto-save commits
- Detects empty messages and messages containing "auto-save", "autosave", or "auto save" (case-insensitive)
- Displays "Auto-save" instead of empty/generic commit messages

### 3. Terminology Updates
- Updated page title from "Version History" to "Snapshots"
- Changed "Restore" button text to "Restore this snapshot"
- Updated confirmation dialog title to "Restore to This Snapshot?"
- Improved dialog message: "Restore to this snapshot? Your current changes will be preserved in a new variation."
- Updated empty state text from "No history yet" to "No snapshots yet"
- Updated loading state from "Loading history..." to "Loading snapshots..."
- Updated success message to use "snapshot" terminology

### 4. CSS Updates
- Added `.commit-display` class with appropriate styling
- Maintained cursor: help for tooltip indication
- Preserved existing visual design while improving information hierarchy

### 5. Documentation
- Updated component header comment to explain snapshot terminology
- Clarified that snapshots are the writer-friendly term for Git commits

## Files Modified
- `/Users/cosmos/Projects/bright-tauri/src/views/StoryHistory.tsx` - Component logic and display
- `/Users/cosmos/Projects/bright-tauri/src/views/StoryHistory.css` - Added commit-display styles

## Testing Notes
- TypeScript compilation passes with no errors
- All acceptance criteria verified
- Ready for manual UI testing
<!-- SECTION:NOTES:END -->
