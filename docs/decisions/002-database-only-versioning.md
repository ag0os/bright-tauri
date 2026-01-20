# ADR 002: Database-Only Versioning (Replacing Git)

## Status

Accepted

## Date

2025-01-14

## Context

The application originally implemented version control using Git under the hood. The design stored story content in two places:

1. **SQLite Database**: `content` field in the `stories` table (updated by auto-save)
2. **Git Repository**: `content.md` file (updated by auto-commit)

This created a dual-source-of-truth architecture where Git handled branching (for "variations") and commit history (for "version history").

### Problems Discovered

During implementation of the variation switching feature, we discovered fundamental synchronization issues:

1. **Data Drift**: The database `content` field and Git `content.md` file could get out of sync. Auto-save updates the database immediately, but auto-commit to Git is configurable and may not have run yet.

2. **Data Loss Bug**: When switching variations, the system would:
   - Commit whatever was in the Git working directory (potentially stale)
   - Checkout the new branch
   - Read `content.md` from the new branch
   - Update the database

   If the database had newer content than the Git working directory, that content would be lost.

3. **Conceptual Mismatch**: Git concepts (branches, working directory, staging area, commits) don't map cleanly to what users actually need:
   - Users want "named alternate versions" → Git branches are overkill
   - Users want "undo/restore points" → Git commits are overcomplicated
   - Users don't need collaboration features → Git's distributed model is unnecessary

4. **Complexity**: The Git integration required:
   - ~1500 lines of Rust code for Git operations
   - File system I/O for content storage
   - Complex synchronization logic
   - Metadata files (`metadata.json`) to map branch slugs to display names
   - Lock files to prevent concurrent access

### What Users Actually Need

Analyzing the requirements, users need two simple concepts:

1. **Variations**: Named alternate versions of a story (e.g., "Alternate Ending", "What if Sarah lived?", "Screenplay version")

2. **History**: A timeline of auto-saved snapshots they can restore from

Both of these are just **labeled copies of text** - no complex version control semantics required.

## Decision

Replace the Git-based versioning system with a database-only approach:

- **Single source of truth**: All content lives in SQLite
- **Variations**: Stored in a `story_variations` table as named content snapshots
- **History**: Stored in a `story_history` table as timestamped content snapshots
- **No Git**: Remove the `git2` dependency and all Git-related code

### New Data Model

A single `story_contents` table stores all content - the original, variations, and snapshots. The `stories` table points to whichever content record is currently active.

```
stories (modified)
├── id, title, universe_id, ...
├── active_content_id          -- Points to current content record
└── [REMOVED: content, git_repo_path, current_branch, staged_changes]

story_contents (new)
├── id                         -- Primary key
├── story_id                   -- Parent story
├── content                    -- The actual text
├── label                      -- "Original", "Alternate Ending", or null for snapshots
├── created_at                 -- When created
├── updated_at                 -- Last edit time
```

**The `label` field determines what the record represents:**
- `"Original"` → The main version (created with the story)
- `"Some Name"` → A user-created variation
- `null` → An auto-snapshot (UI shows timestamp instead)

**Key insight:** Content lives in exactly one place. No copying, no syncing, no duplication.

### Simplified Workflows

Four independent systems, each with a single responsibility:

**1. Editing System:**
```
User types → Update the content record pointed to by active_content_id
(Just update one record, debounced)
```

**2. Versioning System (user-controlled):**
```
User creates variation → Insert new story_contents record with user's label
(User explicitly decides when to create variations)
```

**3. History System (automatic):**
```
Timer fires → Insert new story_contents record with label=null
(System creates snapshots at configured interval)
```

**4. Switching System:**
```
User switches → Update stories.active_content_id to new content record
(Just update one pointer - no content copying, no side effects)
```

**Restoring from snapshot** is the same as switching - just point to a different content record.

**Comparing versions:**
```
Load two content strings from database → Use JavaScript diff library
(Simple string comparison, no Git diff parsing)
```

## Alternatives Considered

### Alternative 1: Fix the Git Synchronization

Keep Git but fix the sync issues:
- Always write database content to `content.md` before any Git operation
- Add validation to ensure DB and Git stay in sync
- Implement recovery mechanisms for drift

**Rejected because:**
- Adds more complexity to an already complex system
- Still maintaining two storage locations
- Git concepts still don't match user mental model
- Doesn't address the fundamental over-engineering

### Alternative 2: Git as Primary, Remove Database Content Field

Make Git the single source of truth:
- Remove `content` field from database
- Always read/write directly to Git working directory
- Database only stores metadata

**Rejected because:**
- Slower (file I/O vs database)
- More complex error handling (filesystem errors)
- Still have Git conceptual mismatch
- Lose transactional guarantees of SQLite

### Alternative 3: Use a Simpler VCS Library

Replace `git2` with a simpler version control approach:
- Implement custom file-based versioning
- Or use a simpler library than Git

**Rejected because:**
- Still file-based with sync issues
- Still more complex than needed
- Database already provides everything we need

## Consequences

### Positive

1. **Single Source of Truth**: All content in one table, no sync issues
2. **Content Lives in One Place**: No copying between tables, just pointer changes
3. **Switching is O(1)**: Just update `active_content_id`, no data movement
4. **Unified Model**: Variations and snapshots are the same thing (content records), just labeled differently
5. **Clear Separation of Concerns**: Four systems (editing, versioning, history, switching) each do one thing
6. **Simpler Mental Model**: Everything is a "version" - some named by user, some auto-created
7. **Configurable Retention**: Easy to implement "keep last N snapshots"
8. **Faster**: No file I/O, no content copying
9. **Portable**: Everything in one database file
10. **Less Code**: Remove ~1500 lines of Git code, replace with ~200 lines of simple DB operations

### Negative

1. **No True Branching/Merging**: Users can't merge variations (must manually copy/paste)
   - *Mitigated*: This is acceptable for a creative writing app
2. **No Distributed Backup**: Git repos could be pushed to remote for backup
   - *Mitigated*: Can implement database export/backup feature later
3. **Migration Required**: Existing Git-based data won't carry over
   - *Mitigated*: Early stage, no production users

### Neutral

1. **Diffing Moves to Frontend**: Use JS diff library instead of Git diff
   - Actually simpler to display and style
2. **No Commit Messages**: History entries have timestamps and optional labels instead
   - Labels are more user-friendly anyway

## Implementation Plan

### Phase 1: Backend - New Schema
- Create `story_contents` table
- Add `active_content_id` to stories table
- Remove Git-related fields from stories table (`content`, `git_repo_path`, `current_branch`, `staged_changes`)
- Migration: create initial "Original" content record for each existing story

### Phase 2: Backend - Content Repository & Commands
- Create `StoryContentRepository` with CRUD operations
- Commands: create content, get content, update content, delete content
- Commands: list variations (labeled content), list snapshots (unlabeled content)
- Commands: switch active content (update pointer)

### Phase 3: Frontend - Update Editor
- Update `StoryEditor` to work with content records instead of story.content
- Load content via `active_content_id`
- Save edits to the active content record
- Remove all Git-related logic

### Phase 4: Frontend - Update Views
- Simplify `StoryVariations` view (list labeled content, create, switch, delete)
- Simplify `StoryHistory` view (list unlabeled content, restore)
- Simplify `StoryCompare` view (JS-based diff between any two content records)
- Remove `StoryCombine` view (merge conflicts don't exist)

### Phase 5: Remove Git Code
- Delete `src-tauri/src/git.rs`
- Delete `src-tauri/src/file_management.rs`
- Delete `src-tauri/src/commands/git.rs`
- Remove `git2` from Cargo.toml
- Clean up unused TypeScript types

### Phase 6: History System
- Implement auto-snapshot service (creates unlabeled content records at interval)
- Implement retention policy (keep last N snapshots per story/variation)
- Add settings UI for snapshot interval and retention count

## When Would We Choose Differently?

This decision is appropriate because:
- **Single-user desktop app** - no collaboration needs
- **Creative writing focus** - users think in "versions" not "commits"
- **Early development** - can make breaking changes

We would keep Git if:
- **Collaboration required** - multiple users editing same content
- **Complex branching/merging** - users need true VCS semantics
- **Existing user base** - migration cost too high
- **Integration needs** - syncing with GitHub/GitLab repositories

## References

- Previous Git implementation: `src-tauri/src/git.rs` (to be removed)
- Git lifecycle documentation: `docs/git-repository-lifecycle.md` (to be archived)
- Story model: `src-tauri/src/models/story.rs`
- Current variation UI: `src/views/StoryVariations.tsx`

## Notes

This decision reflects a key lesson: **choose the simplest solution that meets the actual requirements**. Git is a powerful tool for collaborative software development, but those capabilities are unnecessary overhead for a single-user creative writing application.

The database-only approach aligns with the application's philosophy of minimalism and focus - the same principles that guide the UI design should guide the technical architecture.
