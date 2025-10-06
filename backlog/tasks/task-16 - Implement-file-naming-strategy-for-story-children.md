---
id: task-16
title: Implement file naming strategy for story children
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:44'
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
- [x] #1 Function generates filenames with zero-padded order prefix (001-, 002-, etc.)
- [x] #2 Function slugifies story title for filename body
- [x] #3 Function adds appropriate extension (.md)
- [x] #4 Function handles filename sanitization (remove invalid chars)
- [x] #5 Function generates unique filenames if title collisions occur
- [x] #6 Unit tests verify filename generation for various inputs
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create src/file_naming.rs module
2. Implement slugify function to convert titles to URL-safe strings
3. Implement generate_filename function with order prefix, slugified title, and .md extension
4. Add filename sanitization to remove invalid filesystem characters
5. Add collision detection and unique filename generation
6. Write comprehensive unit tests
7. Export module from lib.rs
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created file_naming.rs module with three public functions:

1. slugify(text: &str) -> String
   - Converts text to lowercase
   - Replaces spaces and underscores with hyphens
   - Removes non-ASCII alphanumeric characters
   - Collapses multiple hyphens into single hyphens
   - Returns empty string for text with only special chars

2. generate_filename(order: usize, title: &str) -> String
   - Formats as "{order:03}-{slugified-title}.md"
   - Zero-pads order to 3 digits (001, 042, 123)
   - Uses "untitled" if slug is empty
   - Example: generate_filename(5, "First Chapter") -> "005-first-chapter.md"

3. generate_unique_filename(order: usize, title: &str, existing_filenames: &[String]) -> String
   - Generates base filename using generate_filename
   - Checks for collisions in existing filenames list
   - Appends counter if collision found: "001-chapter-2.md", "001-chapter-3.md"
   - Safety limit of 1000 to prevent infinite loops

Added 19 comprehensive unit tests covering:
- Basic slugification
- Special character handling
- Unicode character removal
- Multiple spaces/hyphens
- Empty strings and special-char-only strings
- Filename generation with various orders
- Collision detection and resolution
- Consistency between functions

All tests passing. Module exported from lib.rs.
<!-- SECTION:NOTES:END -->
