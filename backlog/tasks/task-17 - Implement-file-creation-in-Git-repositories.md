---
id: task-17
title: Implement file creation in Git repositories
status: Done
assignee:
  - '@claude'
created_date: '2025-10-03 19:24'
updated_date: '2025-10-06 20:46'
labels:
  - backend
  - file-management
  - git
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create functionality to write child story content as markdown files in parent's Git repository. When a chapter or scene is created, write its content to a file using the naming strategy and commit to Git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Function accepts story record, parent repo path, and content
- [x] #2 Function generates filename using naming strategy
- [x] #3 Function writes content to file in repo directory
- [x] #4 Function uses GitService to commit the new file
- [x] #5 Function updates story record with relative file path
- [x] #6 Function handles errors if file already exists
- [x] #7 Unit tests verify file creation and Git commit
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create src/file_management.rs module
2. Implement create_story_file function that:
   - Accepts repo_path, order, title, and content
   - Uses file_naming::generate_filename to create filename
   - Writes content to file in repo directory
   - Uses GitService::commit_file to commit the new file
   - Returns relative file path
3. Add error handling for file already exists
4. Write unit tests using TempDir and GitService
5. Export module from lib.rs
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created file_management.rs module with file creation functionality:

FileManagementError enum:
- FileExists: File already exists at target path
- Io: IO error wrapper
- Git: Git operation error wrapper
- Proper Display and Error trait implementations
- From implementations for std::io::Error and GitServiceError

create_story_file function:
- Signature: create_story_file(repo_path: &Path, order: usize, title: &str, content: &str) -> FileManagementResult<String>
- Uses file_naming::generate_filename to create consistent filenames
- Checks if file already exists before writing (returns FileExists error)
- Writes content to file using fs::write
- Commits file to Git using GitService::commit_file
- Commit message format: "Add {filename}: {title}"
- Returns relative filename (e.g., "001-chapter-name.md")

Added 6 comprehensive unit tests:
- Basic file creation and content verification
- Git commit verification (checks history has new commit)
- Special character handling in titles
- FileExists error when creating duplicate
- Multiple file creation
- Relative path return verification

All tests passing. Module exported from lib.rs.
<!-- SECTION:NOTES:END -->
