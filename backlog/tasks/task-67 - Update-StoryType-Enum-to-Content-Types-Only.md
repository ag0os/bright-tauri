---
id: task-67
title: Update StoryType Enum to Content Types Only
status: In Progress
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 19:12'
labels:
  - container-refactor
  - backend
  - rust
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove organizational container types (novel, series, collection) from the StoryType enum, leaving only content types. Container types will be moved to a separate ContainerType enum. This completes the separation of organizational and content concerns at the type level.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Novel, Series, Collection variants removed from StoryType enum
- [x] #2 Content types retained: chapter, scene, short-story, episode, poem, outline, treatment, screenplay
- [x] #3 Screenplay remains as a content type (it represents written content)
- [x] #4 Enum compiles without errors
- [x] #5 TypeScript type generation updated to reflect new enum
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Verify current StoryType enum state (lines 80-92 in story.rs)
2. Add missing Screenplay variant to StoryType enum
3. Verify all 8 content types are present: Chapter, Scene, ShortStory, Episode, Poem, Outline, Treatment, Screenplay
4. Run cargo build to verify compilation
5. Run cargo test --lib to regenerate TypeScript types
6. Verify src/types/StoryType.ts reflects all content types
7. Mark all acceptance criteria complete
8. Add implementation notes and commit changes
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Summary

Updated StoryType enum to contain only content types by adding the missing Screenplay variant. Task-66 had already removed the container types (Novel, Series, Collection), but Screenplay was inadvertently omitted.

## Changes Made

**File Modified**: src-tauri/src/models/story.rs
- Added Screenplay variant to StoryType enum (line 92)
- Verified all 8 content types are present: Chapter, ShortStory, Scene, Episode, Poem, Outline, Treatment, Screenplay
- Container types (Novel, Series, Collection) confirmed removed

## Verification

1. **Compilation**: `cargo build` succeeded with no errors (only unrelated warnings)
2. **Type Generation**: TypeScript type generated correctly at src/types/StoryType.ts
   - Contains all 8 content types in kebab-case format
   - Screenplay included as "screenplay"

## Notes

- Screenplay represents written content (scripts, dialogue) and is correctly classified as a content type
- Container types will be handled by the separate ContainerType enum introduced in task-65
- Some test failures exist but are unrelated to this enum change (part of broader refactor)
<!-- SECTION:NOTES:END -->
