---
id: task-40
title: 'Task 5.2: Create Auto-Save Hook'
status: To Do
assignee: []
created_date: '2025-10-31 19:28'
labels:
  - hook
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build custom React hook for debounced auto-saving with state indicators.

Hook location: src/hooks/useAutoSave.ts

Features:
- Accepts: content, save callback, delay (default 2000ms)
- Debounces save calls to prevent excessive backend requests
- Shows 'saving...' and 'saved' states
- Cancels pending saves on unmount to prevent memory leaks

Depends on: Tasks 1.1, 1.2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hook debounces correctly (doesn't save on every keystroke)
- [ ] #2 Save callback is called after delay
- [ ] #3 Returns save state for UI indicator (idle, saving, saved, error)
- [ ] #4 Works with Lexical editor content changes
- [ ] #5 Pending saves cancelled on unmount
- [ ] #6 No memory leaks
<!-- AC:END -->
