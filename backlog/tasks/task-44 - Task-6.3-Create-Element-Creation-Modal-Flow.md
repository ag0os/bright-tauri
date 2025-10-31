---
id: task-44
title: 'Task 6.3: Create Element Creation Modal/Flow'
status: To Do
assignee: []
created_date: '2025-10-31 19:28'
labels:
  - universe-ui
  - component
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build UI for creating a new universe element with template selection and suggested attributes.

Component location: src/components/universe/CreateElementModal.tsx

Features:
- Template selection screen (8 templates: Character, Location, Vehicle, Item, Organization, Creature, Event, Concept)
- Core fields: Name (required), Description (required), Details (optional)
- Template attributes loaded from src/config/element-templates.json
- Show suggested attributes based on template (optional to fill)
- Tags, icon, color selection (optional)
- Create button calls createElement from store

Depends on: Tasks 1.2, 2.3
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modal shows template options with icons
- [ ] #2 Selecting template loads suggested attributes from element-templates.json
- [ ] #3 Form validation works (name and description required)
- [ ] #4 Can skip optional attributes
- [ ] #5 Creating element calls backend and updates store
- [ ] #6 Modal closes after successful creation
- [ ] #7 Navigates to element detail or list after creation
- [ ] #8 All 8 templates available and functional
<!-- AC:END -->
