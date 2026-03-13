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
- **Versions**: Stored in a `story_versions` table as named variations
- **Snapshots**: Stored in a `story_snapshots` table as timestamped content saves within a version
- **No Git**: Remove the `git2` dependency and all Git-related code

### New Data Model

Two tables implement the versioning hierarchy: `story_versions` (named variations) and `story_snapshots` (point-in-time content saves within a version). The `stories` table points to both the active version and the active snapshot.

```
stories (modified)
├── id, title, universe_id, ...
├── active_version_id          -- Points to current version (FK → story_versions)
├── active_snapshot_id         -- Points to current snapshot (FK → story_snapshots)
└── [REMOVED: content, git_repo_path, current_branch, staged_changes]

story_versions (new)
├── id                         -- Primary key
├── story_id                   -- Parent story
├── name                       -- "Original", "Alternate Ending", etc.
├── created_at                 -- When created
├── updated_at                 -- Last edit time

story_snapshots (new)
├── id                         -- Primary key
├── version_id                 -- Parent version (FK → story_versions)
├── content                    -- The actual text
├── created_at                 -- When created
```

**The hierarchy: Story → Version → Snapshot**
- A **version** is a named variation (e.g., "Original", "Alternate Ending")
- A **snapshot** is a point-in-time save of content within a version
- Each version can have many snapshots (auto-saved over time)
- The story tracks both the active version and the active snapshot within it

**Key insight:** Content lives in exactly one place (snapshots). Versions are organizational, snapshots hold the actual text. No copying, no syncing, no duplication.

### Simplified Workflows

Four independent systems, each with a single responsibility:

**1. Editing System:**
```
User types → Update the snapshot pointed to by active_snapshot_id
(Just update one snapshot record, debounced)
```

**2. Versioning System (user-controlled):**
```
User creates version → Insert new story_versions record with user's name
                      → Insert initial story_snapshots record within it
(User explicitly decides when to create versions)
```

**3. History System (automatic):**
```
Timer fires → Insert new story_snapshots record under the active version
(System creates snapshots at configured interval within the current version)
```

**4. Switching System:**
```
User switches version → Update stories.active_version_id and active_snapshot_id
(Just update two pointers - no content copying, no side effects)
```

**Restoring from snapshot** updates `active_snapshot_id` to point to a different snapshot within the same version.

**Comparing snapshots:**
```
Load two snapshot content strings from database → Use JavaScript diff library
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

1. **Single Source of Truth**: All content in SQLite (story_versions + story_snapshots), no sync issues
2. **Content Lives in One Place**: No copying between tables, just pointer changes
3. **Switching is O(1)**: Just update `active_version_id` and `active_snapshot_id`, no data movement
4. **Clean Hierarchy**: Story → Version → Snapshot maps directly to user concepts
5. **Clear Separation of Concerns**: Four systems (editing, versioning, history, switching) each do one thing
6. **Simpler Mental Model**: Versions are user-named variations, snapshots are automatic saves within them
7. **Configurable Retention**: Easy to implement "keep last N snapshots per version"
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
- Create `story_versions` and `story_snapshots` tables
- Add `active_version_id` and `active_snapshot_id` to stories table
- Remove Git-related fields from stories table (`content`, `git_repo_path`, `current_branch`, `staged_changes`)
- Migration: create initial "Original" version and snapshot for each existing story

### Phase 2: Backend - Version/Snapshot Repository & Commands
- Create `StoryVersionRepository` and `StorySnapshotRepository` with CRUD operations
- Commands: create/get/update/delete versions and snapshots
- Commands: list versions for a story, list snapshots for a version
- Commands: switch active version/snapshot (update pointers)

### Phase 3: Frontend - Update Editor
- Update `StoryEditor` to work with versions/snapshots instead of story.content
- Load content via `active_version_id` / `active_snapshot_id`
- Save edits to the active snapshot
- Remove all Git-related logic

### Phase 4: Frontend - Update Views
- Simplify `StoryVariations` view (list versions, create, switch, delete)
- Simplify `StoryHistory` view (list snapshots within a version, restore)
- Simplify `StoryCompare` view (JS-based diff between any two snapshots)
- Remove `StoryCombine` view (merge conflicts don't exist)

### Phase 5: Remove Git Code
- Delete `src-tauri/src/git.rs`
- Delete `src-tauri/src/file_management.rs`
- Delete `src-tauri/src/commands/git.rs`
- Remove `git2` from Cargo.toml
- Clean up unused TypeScript types

### Phase 6: History System
- Implement auto-snapshot service (creates new snapshot records within the active version at interval)
- Implement retention policy (keep last N snapshots per version)
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
