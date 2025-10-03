---
id: task-16
title: Implement file naming strategy for story children
status: To Do
assignee: []
created_date: '2025-10-03 19:24'
labels:
  - backend
  - file-management
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a file naming module that generates consistent filenames for child stories in Git repos. Use order-based naming (001-chapter-name.md) that supports reordering without filename conflicts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Function generates filenames with zero-padded order prefix (001-, 002-, etc.)
- [ ] #2 Function slugifies story title for filename body
- [ ] #3 Function adds appropriate extension (.md)
- [ ] #4 Function handles filename sanitization (remove invalid chars)
- [ ] #5 Function generates unique filenames if title collisions occur
- [ ] #6 Unit tests verify filename generation for various inputs
<!-- AC:END -->
