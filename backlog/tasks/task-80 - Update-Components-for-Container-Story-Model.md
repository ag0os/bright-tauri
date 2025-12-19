---
id: task-80
title: Update Components for Container/Story Model
status: To Do
assignee: []
created_date: '2025-12-19 18:42'
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
- [ ] #1 CreateContainerModal component created for creating new containers
- [ ] #2 CreateStoryModal updated to remove container types, add container selection dropdown
- [ ] #3 StoryCard component updated to remove child count display
- [ ] #4 ContainerCard component created showing container type label and child count
- [ ] #5 Components use correct types (Container vs Story)
- [ ] #6 Container components show leaf/non-leaf status appropriately
- [ ] #7 Story components work for both standalone and container-based stories
- [ ] #8 All components compile and render without errors
<!-- AC:END -->
