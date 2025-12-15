---
id: task-52
title: 'Phase 1.3: Add variation CRUD functions'
status: To Do
assignee: []
created_date: '2025-12-15 17:08'
updated_date: '2025-12-15 17:15'
labels:
  - backend
  - versioning
dependencies:
  - task-50
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Rust functions for managing variation name mappings in metadata.json
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Add save_variation_mapping(repo_path, slug, display_name) function
- [ ] #2 Add get_variation_display_name(repo_path, slug) -> Option<String> function
- [ ] #3 Add list_variations(repo_path) -> Vec<VariationInfo> function returning slug, display_name, is_current, is_original
- [ ] #4 Add remove_variation_mapping(repo_path, slug) function for branch deletion
- [ ] #5 Create VariationInfo struct with ts-rs export

- [ ] #6 Handle missing metadata: return empty Vec for list, return slug as display name if mapping missing, auto-create variations field if absent
<!-- AC:END -->
