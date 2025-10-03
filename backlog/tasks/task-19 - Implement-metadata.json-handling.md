---
id: task-19
title: Implement metadata.json handling
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create functionality to generate and maintain metadata.json files in story Git repositories. This file stores story metadata for reference and is committed to Git along with content files.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Function generates metadata.json with story details (id, title, type, created_date, etc.)
- [ ] #2 Function writes metadata.json to repository root
- [ ] #3 Function updates metadata.json when story metadata changes
- [ ] #4 Function uses GitService to commit metadata changes
- [ ] #5 Metadata format is valid JSON and human-readable
- [ ] #6 Unit tests verify metadata generation and updates
<!-- AC:END -->
