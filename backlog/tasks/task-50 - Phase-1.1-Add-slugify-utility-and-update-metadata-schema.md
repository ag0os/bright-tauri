---
id: task-50
title: 'Phase 1.1: Add slugify utility and update metadata schema'
status: Done
assignee:
  - '@claude'
created_date: '2025-12-15 17:07'
updated_date: '2025-12-15 17:29'
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
- [x] #1 Create slugify() utility function in Rust (lowercase, spaces to hyphens, remove special chars, collapse hyphens)
- [x] #2 Handle duplicate slugs by appending -2, -3, etc.
- [x] #3 Update StoryMetadata struct to include variations: HashMap<String, String>
- [x] #4 Update metadata.json read/write functions to handle variations field
- [x] #5 Add unit tests for slugify function

- [x] #6 Handle edge cases: empty strings return 'untitled', all-special-chars return 'untitled', very long names get truncated
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review existing slugify implementation in file_naming.rs
2. Create enhanced slugify_variation_name() function with:
   - Lowercase conversion
   - Space to hyphen replacement
   - Special char removal (keep alphanumeric + hyphens)
   - Multiple hyphen collapse
   - Empty/all-special-chars returns "untitled"
   - Length truncation (50 char limit)
3. Create slugify_unique() function that checks existing branches
4. Update StoryMetadata struct to add variations: HashMap<String, String>
5. Update write_metadata_file() and read functions for variations field
6. Add comprehensive unit tests for slugify edge cases
7. Generate TypeScript types
8. Test the implementation
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Implementation Summary

Successfully implemented slugify utility and updated metadata schema for the Version System UX Abstraction feature.

## Changes Made

### 1. Enhanced Slugify Functions (src-tauri/src/file_naming.rs)
- **slugify_variation_name()**: New function that converts variation display names to Git branch-safe slugs
  - Converts to lowercase
  - Replaces spaces with hyphens
  - Removes special characters (keeps alphanumeric + hyphens)
  - Collapses multiple hyphens
  - Returns "untitled" for empty/all-special-char inputs
  - Truncates to 50 characters (at word boundaries when possible)
  
- **slugify_unique_variation()**: Handles duplicate branch names by appending -2, -3, etc.
  - Checks against existing branch list
  - Ensures unique branch names

### 2. Updated StoryMetadata Schema (src-tauri/src/file_management.rs)
- Added `variations: HashMap<String, String>` field
- Maps branch slugs to display names (e.g., "what-if-sarah-lived" -> "What if Sarah lived?")
- Configured with `#[serde(default, skip_serializing_if = "...")]` for backward compatibility
- Empty variations HashMap not serialized to JSON

### 3. Added Helper Functions
- **read_metadata_file()**: Read and parse metadata.json from repository
- Updated **from_story()**: Initializes variations field as empty HashMap

### 4. Comprehensive Tests
Added 14 new tests for slugify functions covering:
- Basic slugification
- Empty strings → "untitled"
- Special characters handling
- Unicode character removal
- Multiple spaces collapsing
- 50-character truncation
- Duplicate slug handling with counters
- Edge cases (similar names, long names with truncation)

Added 5 new tests for metadata variations:
- Variations field serialization/deserialization
- Empty variations omitted from JSON
- Backward compatibility with old metadata.json
- Reading metadata files

### 5. TypeScript Types
- Types automatically generated via ts-rs
- HashMap<String, String> maps to Record<string, string> in TypeScript

## Files Modified
- `/Users/cosmos/Projects/bright-tauri/src-tauri/src/file_naming.rs` (added 86 lines, 14 tests)
- `/Users/cosmos/Projects/bright-tauri/src-tauri/src/file_management.rs` (added variations field, 5 tests)

## Test Results
All 127 tests passing:
- 36 file_naming tests (including 14 new variation tests)
- 22 file_management tests (including 5 new metadata tests)
- All existing tests remain green

## Design Decisions
1. **50-character limit**: Reasonable for branch names while avoiding overly long names
2. **Truncation at word boundaries**: Improves readability by avoiding mid-word cuts
3. **Backward compatibility**: Old metadata.json files without variations field still parse correctly
4. **Empty HashMap not serialized**: Keeps JSON clean when no variations exist
5. **Counter-based uniqueness**: Simple, predictable approach (-2, -3, etc.)

## Next Steps
Ready for Phase 1.2: Create variation management commands to use these utilities.
<!-- SECTION:NOTES:END -->
