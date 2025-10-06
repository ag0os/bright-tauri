---
id: task-19
title: Implement metadata.json handling
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:54'
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
- [x] #1 Function generates metadata.json with story details (id, title, type, created_date, etc.)
- [x] #2 Function writes metadata.json to repository root
- [x] #3 Function updates metadata.json when story metadata changes
- [x] #4 Function uses GitService to commit metadata changes
- [x] #5 Metadata format is valid JSON and human-readable
- [x] #6 Unit tests verify metadata generation and updates
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add StoryMetadata struct in file_management.rs with story details
2. Implement generate_metadata function that accepts a Story and creates StoryMetadata
3. Implement write_metadata function that:
   - Serializes StoryMetadata to JSON
   - Writes to metadata.json in repo root
   - Commits using GitService
4. Implement update_metadata function for when story changes
5. Add proper JSON formatting (pretty-print for human readability)
6. Write comprehensive unit tests
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Extended file_management.rs with metadata.json handling:

StoryMetadata struct:
- Serializable struct containing key story information
- Fields: id, universe_id, title, description, story_type, status, created_at, updated_at, word_count, target_word_count
- Implements PartialEq for testing
- from_story() method creates metadata from a Story
- story_type and status formatted as Debug strings

write_metadata_file function:
- Signature: write_metadata_file(repo_path: &Path, story: &Story) -> FileManagementResult<String>
- Creates StoryMetadata from Story using from_story()
- Serializes to pretty-printed JSON using serde_json::to_string_pretty
- Writes to metadata.json in repository root
- Commits using GitService::commit_file
- Commit message format: "Update metadata for story: {title}"
- Returns "metadata.json" filename

update_metadata_file function:
- Alias for write_metadata_file (same operation for create/update)
- Overwrites existing metadata.json when called

JSON format:
- Pretty-printed with indentation for human readability
- Valid JSON that can be deserialized back to StoryMetadata

Added 6 comprehensive unit tests:
- Creates valid JSON file
- Verifies pretty-printing (newlines and indentation)
- Git commit verification
- Updates existing metadata
- from_story() conversion
- Serialization round-trip

All 17 file_management tests passing.
<!-- SECTION:NOTES:END -->
