---
id: task-41
title: 'Task 5.3: Create Story Editor Page'
status: Done
assignee:
  - '@agent'
created_date: '2025-10-31 19:28'
updated_date: '2025-11-05 19:59'
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
- [x] #1 Editor loads story content correctly on mount
- [x] #2 Typing updates content in real-time
- [x] #3 Auto-save works (saves after 2s of inactivity)
- [x] #4 Auto-save indicator shows status (saving/saved)
- [x] #5 Word count updates in real-time
- [x] #6 Back button returns to Stories List
- [x] #7 Story title is editable in top chrome
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review existing navigation and store patterns
2. Create StoryEditor.tsx view component
3. Implement story loading on mount using storyId from route
4. Integrate RichTextEditor component
5. Set up useAutoSave hook with updateStory callback
6. Create minimal top chrome (back button, title, auto-save indicator)
7. Add word count calculation and display
8. Style with design system tokens for minimal, distraction-free UI
9. Update App.tsx to render StoryEditor for story-editor route
10. Test navigation flow and auto-save functionality
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented full-screen Story Editor page with complete auto-save functionality:

**Core Features:**
- Full-screen editing interface with minimal, distraction-free UI
- Integrated RichTextEditor component (Lexical-based)
- Auto-save using useAutoSave hook (2s debounce)
- Story loading on mount from route params
- Real-time word count calculation and display
- Editable story title in top chrome
- Visual auto-save indicators (Saving, Saved, Error)

**Navigation:**
- Extract storyId from useNavigationStore route params
- Back button navigates to Stories List
- Updated App.tsx to render StoryEditor for story-editor route

**UI/UX:**
- Minimal top chrome: back button, editable title, save indicator
- Main editor area takes full height
- Bottom status bar with word count
- Follows "Minimalism Over Feature Density" philosophy
- Clean, focused writing experience
- Styled with design system tokens

**Technical Details:**
- Uses useStoriesStore for CRUD operations (getStory, updateStory)
- Word count: parses JSON content and counts words
- Title editing: click to edit, blur to save, Enter/Escape handling
- Loading and error states with proper UI feedback
- Content auto-saves after 2s of inactivity
- First render skipped to avoid saving on initial load

Files created:
- src/views/StoryEditor.tsx (main component)
- src/views/StoryEditor.css (minimal styling)

Files modified:
- src/App.tsx (added StoryEditor route case)
<!-- SECTION:NOTES:END -->
