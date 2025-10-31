---
id: task-41
title: 'Task 5.3: Create Story Editor Page'
status: To Do
assignee: []
created_date: '2025-10-31 19:28'
labels:
  - editor
  - page
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build full-screen story editing interface with minimal chrome and auto-save functionality.

Component location: src/pages/StoryEditorPage.tsx

Features:
- Minimal top chrome: back button, story title (editable), auto-save indicator
- RichTextEditor component (main area)
- Auto-save using useAutoSave hook
- Load story content on mount
- Word count display (bottom status bar)
- No sidebars in Phase 1 (added later)

Data flow:
- Reads story from useStoriesStore (by ID from route/nav)
- Loads story content into editor
- Auto-saves changes to backend via updateStory
- Shows word count (calculate from content)

Depends on: Tasks 2.2, 3.2, 3.3, 5.1, 5.2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Editor loads story content correctly on mount
- [ ] #2 Typing updates content in real-time
- [ ] #3 Auto-save works (saves after 2s of inactivity)
- [ ] #4 Auto-save indicator shows status (saving/saved)
- [ ] #5 Word count updates in real-time
- [ ] #6 Back button returns to Stories List
- [ ] #7 Story title is editable in top chrome
<!-- AC:END -->
