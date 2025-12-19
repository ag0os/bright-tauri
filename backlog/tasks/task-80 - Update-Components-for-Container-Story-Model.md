---
id: task-80
title: Update Components for Container/Story Model
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:42'
updated_date: '2025-12-19 20:39'
labels:
  - container-refactor
  - frontend
  - components
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create and update shared components to work with the new Container/Story separation. Components need distinct UIs for containers (organizational) and stories (content), with appropriate actions and displays for each.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CreateContainerModal component created for creating new containers
- [x] #2 CreateStoryModal updated to remove container types, add container selection dropdown
- [x] #3 StoryCard component updated to remove child count display
- [x] #4 ContainerCard component created showing container type label and child count
- [x] #5 Components use correct types (Container vs Story)
- [x] #6 Container components show leaf/non-leaf status appropriately
- [x] #7 Story components work for both standalone and container-based stories
- [x] #8 All components compile and render without errors
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze existing component patterns and design system usage
2. Create src/components/containers/ folder structure
3. Create CreateContainerModal.tsx with container type selection
4. Create ContainerCard.tsx with leaf/non-leaf indicators
5. Update CreateStoryModal.tsx to remove container types and add container dropdown
6. Update StoryCard.tsx to remove child count display
7. Verify TypeScript compilation
8. Test component rendering patterns
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created and updated components for container/story separation:

**New Components:**
- CreateContainerModal: Modal for creating containers with type selection (novel, series, collection) and optional parent container
- ContainerCard: Card component displaying container info with type badge, leaf/non-leaf indicator (git repo status), and child counts

**Updated Components:**
- CreateStoryModal: Removed container types from story type dropdown, added optional container selection dropdown (only shows leaf containers), updated to use containerId prop instead of parentStory
- StoryCard: Removed childCount prop and display logic since stories no longer have children

**View Updates:**
- StoriesList: Removed childCount prop from StoryCard usage, removed unused getLocalChildCount function
- StoryChildren: Updated CreateStoryModal usage to pass containerId instead of parentStory

**Key Implementation Details:**
- Container types: novel, series, collection (matches backend)
- Story types: chapter, scene, short-story, episode, poem, outline, treatment, screenplay (content-only, no container types)
- Leaf containers (those with gitRepoPath) can contain stories
- Non-leaf containers contain other containers
- Container selection in CreateStoryModal filters to only leaf containers
- Components use design system tokens (modern-indigo colors, classic-serif typography, phosphor icons)
- TypeScript compilation passes with no errors

**Modified Files:**
- src/components/containers/CreateContainerModal.tsx (new)
- src/components/containers/ContainerCard.tsx (new)
- src/components/stories/CreateStoryModal.tsx (updated)
- src/components/stories/StoryCard.tsx (updated)
- src/views/StoriesList.tsx (updated)
- src/views/StoryChildren.tsx (updated)
<!-- SECTION:NOTES:END -->
