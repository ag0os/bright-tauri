---
id: task-60
title: 'Fix container story UX: Navigate to chapter management after creation'
status: Done
assignee:
  - '@Claude'
created_date: '2025-12-17 17:50'
updated_date: '2025-12-17 17:53'
labels:
  - frontend
  - ux
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When creating a novel, series, screenplay, or collection (container types), users are incorrectly taken to the story editor. This causes confusion because content written there seems 'lost' when clicking the story later routes to chapter management view. Container types should go directly to chapter management after creation, reinforcing the mental model that all writing happens in chapters/episodes/scenes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Container types (novel, series, screenplay, collection) navigate to story-children after creation
- [x] #2 Story editor should not be accessible for container type parent stories
- [x] #3 Remove edit button from StoryChildren header for container types
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Define container types constant in CreateStoryModal.tsx
2. Update navigation logic after story creation to check if story type is container
3. Navigate to story-children for container types, story-editor for all others
4. Test with each container type (novel, series, screenplay, collection)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed container story UX by updating CreateStoryModal.tsx:

1. Added CONTAINER_TYPES constant defining container types: novel, series, screenplay, collection
2. Updated post-creation navigation to route container types to story-children instead of story-editor
3. Verified StoryChildren.tsx already had correct behavior (no edit button for parent)

Commit: 394446c - fix: Navigate to chapter management after creating container story types
<!-- SECTION:NOTES:END -->
