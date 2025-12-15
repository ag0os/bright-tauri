---
id: task-50
title: 'Phase 1.1: Add slugify utility and update metadata schema'
status: To Do
assignee: []
created_date: '2025-12-15 17:07'
updated_date: '2025-12-15 17:15'
labels:
  - backend
  - versioning
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Backend foundation for variation name mapping. Add slugify() function in Rust and extend metadata.json schema to include variations mapping.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Create slugify() utility function in Rust (lowercase, spaces to hyphens, remove special chars, collapse hyphens)
- [ ] #2 Handle duplicate slugs by appending -2, -3, etc.
- [ ] #3 Update StoryMetadata struct to include variations: HashMap<String, String>
- [ ] #4 Update metadata.json read/write functions to handle variations field
- [ ] #5 Add unit tests for slugify function

- [ ] #6 Handle edge cases: empty strings return 'untitled', all-special-chars return 'untitled', very long names get truncated
<!-- AC:END -->
