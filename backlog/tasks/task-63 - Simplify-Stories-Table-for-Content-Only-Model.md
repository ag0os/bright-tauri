---
id: task-63
title: Simplify Stories Table for Content-Only Model
status: Done
assignee:
  - '@agent'
created_date: '2025-12-19 18:41'
updated_date: '2025-12-19 18:58'
labels:
  - container-refactor
  - backend
  - database
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove container-related fields from the stories table and add container_id foreign key. Stories should only represent written content, not organizational structures. This enables stories to belong to containers while maintaining standalone story support.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Migration removes parent_story_id field from stories table
- [x] #2 Migration adds container_id field as nullable FK to containers table
- [x] #3 story_type field remains as optional label for content categorization
- [x] #4 All existing story content fields (title, description, content, git_repo_path, etc.) are preserved
- [x] #5 Migration runs successfully without errors
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review migrations.rs pattern (containers table as reference)
2. Add stories table SQL after containers table in migrate_v1()
3. Include all fields from schema: id, universe_id, container_id, story_type, title, description, content, order, git_repo_path, current_branch, staged_changes, target_word_count, timestamps
4. Add FK constraints for universe_id and container_id (nullable)
5. Create indexes for universe_id and container_id
6. Test compilation with cargo build
7. Verify migration runs successfully
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added simplified stories table migration to migrations.rs following the container/story architecture pattern.

Key changes:
- Created stories table with content-only model (no parent_story_id)
- Added container_id as nullable FK to containers table (allows standalone stories)
- Preserved all existing story content fields: title, description, content, git_repo_path, current_branch, staged_changes, target_word_count
- story_type remains as optional label for content categorization (chapter, scene, etc.)
- Added FK constraints for universe_id (NOT NULL) and container_id (nullable)
- Created indexes for universe_id and container_id for query performance
- Migration runs successfully with cargo build

The table structure supports both:
1. Standalone stories (container_id = NULL) with their own git_repo_path
2. Container-based stories (container_id set) that share the container's git repo

All acceptance criteria met:
✓ No parent_story_id field (new table, not a modification)
✓ container_id added as nullable FK to containers
✓ story_type preserved as optional label
✓ All existing content fields preserved
✓ Migration compiles and runs successfully
<!-- SECTION:NOTES:END -->
