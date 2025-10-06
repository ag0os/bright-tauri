---
id: doc-1
title: Story Hierarchy and Git Integration Design
type: design
created_date: '2025-10-03 19:08'
updated_date: '2025-10-06 20:56'
---

## Implementation Status

**Last Updated:** 2025-10-06

### Summary
- ✅ **Phase 1: Story Hierarchy** - COMPLETE (7/7 tasks)
- ✅ **Phase 2: Git Integration** - COMPLETE (8/8 tasks)
- 🚧 **Phase 3: File Management** - IN PROGRESS (4/5 tasks)
- ⏳ **Phase 4: Frontend UI** - NOT STARTED (0/6 tasks)

### What's Working
- Full story hierarchy support (parent/child relationships, ordering)
- Complete Git service (init, commit, branch, merge, diff, history)
- File naming strategy with order-based prefixes
- File creation and management in Git repos
- File reordering with conflict-free two-phase rename
- Metadata.json generation and updates
- All backend Tauri commands registered and functional
- TypeScript types auto-generated from Rust

### What's Left
- **Phase 3:** Auto-commit on save with debouncing (task-20, LOW priority)
- **Phase 4:** All frontend UI components (tasks 21-26)

### Branch Status
- `main` - Contains Phase 1 & 2 (Story Hierarchy + Git Integration)
- `feature/file-management` - Contains Phase 3 (4/5 tasks complete)

---

## Overview

This document defines the flexible story hierarchy system and Git integration strategy for Bright. The core principle is that **every piece of writing is a Story** - whether standalone or part of something bigger.

## Key Concepts

### 1. Variations vs Versions

**Variations** = Different formats/interpretations of the same story concept (co-exist in database)
- Novel version
- Screenplay version
- Comic script version
- Kids book version
- Alternate ending version
- "What if" version

**Versions** = History within ONE variation (managed by Git)
- Draft 1, Draft 2, Draft 3 (commits)
- Experimental branches ("try-darker-tone", "different-act-2")
- Version control, undo/redo, time-travel

### 2. Story Hierarchy

Stories can exist in three ways:
1. **Standalone** - Independent story with no parent
2. **Parent** - Container that groups other stories (Novel, Series, Collection)
3. **Child** - Part of a larger work (Chapter, Scene, Episode)

## Story Types

```rust
pub enum StoryType {
    // Containers (optional parents for grouping)
    Novel,
    Series,
    Screenplay,
    Collection,

    // Independent content (can exist alone OR have a parent)
    Chapter,
    ShortStory,
    Scene,
    Episode,
    Poem,

    // Planning docs
    Outline,
    Treatment,
}
```

## Examples

### Standalone Story
```
Story: "The Lottery" (ShortStory)
  parent_story_id: null
  order: null
  → Has own Git repo
```

### Novel with Chapters
```
Story: "The Great Novel" (Novel)
  parent_story_id: null
  order: null
  → Has Git repo

  ├── Story: "Chapter 1: Dawn" (Chapter)
  │     parent_story_id: novel_id
  │     order: 1
  │     → File in parent's Git repo
  │
  └── Story: "Chapter 2: Dusk" (Chapter)
        parent_story_id: novel_id
        order: 2
        → File in parent's Git repo
```

### Series of Episodes
```
Story: "Star Wars Saga" (Series)
  parent_story_id: null
  → No Git repo (just a grouping)

  ├── Story: "Episode IV" (Episode)
  │     parent_story_id: series_id
  │     order: 4
  │     → Has own Git repo (complete work)
  │
  └── Story: "Episode V" (Episode)
        parent_story_id: series_id
        order: 5
        → Has own Git repo
```

### Series of Novels with Chapters
```
Story: "Harry Potter Series" (Series)
  ├── Story: "Book 1" (Novel)
  │   ├── Story: "Chapter 1" (Chapter)
  │   └── Story: "Chapter 2" (Chapter)
  │
  └── Story: "Book 2" (Novel)
      ├── Story: "Chapter 1" (Chapter)
      └── Story: "Chapter 2" (Chapter)
```

## Git Repository Strategy

### Rule: Git repos at the "versioning boundary"

**Stories that get their own Git repo:**
- ✅ Top-level standalone stories (ShortStory, Poem, etc.)
- ✅ Container stories that hold children (Novel, Screenplay)
- ✅ Episodes/stories within a series (each is complete work)

**Stories that are files in parent's repo:**
- ✅ Chapters within a Novel
- ✅ Scenes within a Screenplay
- ✅ Poems within a Collection

### Implementation Logic

```rust
impl Story {
    /// Determine if this story should have its own Git repo
    pub fn should_have_git_repo(&self) -> bool {
        match self.story_type {
            // Containers always get repos
            StoryType::Novel | StoryType::Screenplay | StoryType::Collection => true,

            // Standalone content gets repos
            StoryType::ShortStory | StoryType::Episode | StoryType::Poem => {
                self.parent_story_id.is_none()
            },

            // Children don't get their own repos
            StoryType::Chapter | StoryType::Scene => false,

            // Planning docs follow parent
            StoryType::Outline | StoryType::Treatment => {
                self.parent_story_id.is_none()
            },

            StoryType::Series => false, // Just a grouping, no content
        }
    }
}
```

## Repository Structure

### Novel with Chapters
```
~/Library/Application Support/bright/git-repos/{novel_story_id}/
├── .git/
├── metadata.json          # Novel info
├── 001-chapter-1.md       # Chapter Story records → files
├── 002-chapter-2.md
└── 003-chapter-3.md
```

### Screenplay with Scenes
```
~/Library/Application Support/bright/git-repos/{screenplay_story_id}/
├── .git/
├── metadata.json
├── act1-scene1.md
├── act1-scene2.md
└── act2-scene1.md
```

## Variations with Children

Each variation of a parent story gets its own Git repository:

```
Novel Story (variation_type: Original)
  git_repo_path: /repos/story-123/
  ├── 001-chapter-1.md
  └── 002-chapter-2.md

Novel Story (variation_type: Screenplay)
  git_repo_path: /repos/story-456/
  ├── act1-scene1.md
  └── act1-scene2.md
```

## Storage Architecture

```
~/Library/Application Support/bright/git-repos/
  ├── {story_id_novel}/          # One repo per variation
  │   ├── .git/
  │   ├── metadata.json
  │   ├── 001-chapter-1.md
  │   └── 002-chapter-2.md
  ├── {story_id_screenplay}/     # Different variation, different repo
  │   ├── .git/
  │   ├── metadata.json
  │   ├── act1-scene1.md
  │   └── act1-scene2.md
  └── {story_id_kids_book}/      # Another variation
      ├── .git/
      ├── metadata.json
      └── story.md
```

## Database Schema

### Existing Fields (no changes needed)
- `parent_story_id` - Links child to parent
- `order` (currently `story_order`) - Position within parent
- `git_repo_path` - Path to Git repository
- `current_branch` - Active Git branch
- `variation_group_id` - Groups variations together
- `variation_type` - Original, AlternatePlot, WhatIf, etc.

### Changes Required
1. Expand `StoryType` enum with new types
2. Add logic to determine Git repo ownership

## New Repository Methods

```rust
impl StoryRepository {
    /// Get all children of a parent story, ordered
    pub fn list_children(db: &Database, parent_id: &str) -> Result<Vec<Story>>;

    /// Reorder children by updating order field
    pub fn reorder_children(
        db: &Database,
        parent_id: &str,
        story_ids: Vec<String>
    ) -> Result<()>;

    /// Get the full hierarchy (parent + all children)
    pub fn get_with_children(
        db: &Database,
        id: &str
    ) -> Result<(Story, Vec<Story>)>;
}
```

## Git Service Interface

```rust
pub struct GitService;

impl GitService {
    /// Initialize repo for a story variation
    pub fn init_repo(story_id: &str) -> Result<PathBuf>;

    /// Commit a chapter/file in the repo
    pub fn commit_file(
        repo_path: &Path,
        file_path: &str,
        content: &str,
        message: &str
    ) -> Result<String>;

    /// Commit all changes in repo
    pub fn commit_all(
        repo_path: &Path,
        message: &str
    ) -> Result<String>;

    /// Create experimental branch
    pub fn create_branch(
        repo_path: &Path,
        parent_branch: &str,
        new_branch: &str
    ) -> Result<()>;

    /// Switch between branches
    pub fn checkout_branch(
        repo_path: &Path,
        branch: &str
    ) -> Result<()>;

    /// Diff two branches
    pub fn diff_branches(
        repo_path: &Path,
        branch_a: &str,
        branch_b: &str
    ) -> Result<Diff>;

    /// Merge branch into another
    pub fn merge_branches(
        repo_path: &Path,
        from: &str,
        into: &str
    ) -> Result<MergeResult>;

    /// Get commit history
    pub fn get_history(
        repo_path: &Path,
        branch: &str
    ) -> Result<Vec<Commit>>;

    /// Restore to specific commit
    pub fn restore_commit(
        repo_path: &Path,
        commit_hash: &str
    ) -> Result<()>;
}
```

## User Workflows

### Creating a Standalone Story
```
1. User creates "The Lottery" as ShortStory
   → Story record with parent_story_id=null
   → Initialize Git repo
   → Initial commit
```

### Creating a Novel with Chapters
```
1. User creates "The Great Novel" as Novel
   → Story record (Novel type)
   → Initialize Git repo

2. User adds Chapter 1
   → Story record with parent_story_id=novel_id, order=1
   → Create 001-chapter-1.md in novel's repo
   → Commit to repo

3. User adds Chapter 2
   → Story record with parent_story_id=novel_id, order=2
   → Create 002-chapter-2.md
   → Commit to repo
```

### Creating Variations
```
1. User has Novel: "The Hero's Journey"

2. User clicks "Create Variation → Screenplay"
   → New Story record with same variation_group_id
   → variation_type=Screenplay
   → Initialize NEW Git repo (fresh history)
   → Copy chapter content as scenes
```

### Working with Versions (Git Branching)
```
1. User edits Chapter 1 in Novel
   → Auto-commits to current branch (main)

2. User wants to experiment
   → Creates branch: "darker-ending"
   → Modifies chapters
   → Commits to experimental branch

3. User can:
   → Switch back to main branch
   → Compare branches (diff)
   → Merge experimental into main
   → Delete or keep experimental branch
```

### Reordering Chapters
```
1. User drags Chapter 3 to position 1
   → Update order fields: Ch3=1, Ch1=2, Ch2=3
   → Optionally rename files: 001-*, 002-*, 003-*
   → Commit reordering to Git
```

## Benefits

### Flexibility
- Write standalone short stories
- Group them into a collection later (optional)
- Write chapters that become a novel
- Write episodes that become a series
- Any grouping structure the author wants

### Git Versioning
- Novel as a whole is versioned
- Can commit individual chapter changes
- Can branch entire novel for experimentation
- Can diff chapter-by-chapter
- Unlimited undo/redo
- Time-travel through versions

### Organization
- Series can contain novels
- Novels can contain chapters
- Collections can contain stories/poems
- Everything has an optional order

## Implementation Checklist

### Phase 1: Story Hierarchy ✅ COMPLETE
- [x] Update StoryType enum with new types (task-1)
- [x] Add `should_have_git_repo()` logic (task-2)
- [x] Implement `list_children()` repository method (task-3)
- [x] Implement `reorder_children()` repository method (task-4)
- [x] Implement `get_with_children()` repository method (task-5)
- [x] Add Tauri commands for chapter management (tasks 6-7)
- [x] Update TypeScript types (auto-generated via ts-rs)

### Phase 2: Git Integration ✅ COMPLETE
- [x] Add git2 dependency (task-8)
- [x] Create GitService module (task-9)
- [x] Implement `init_repo()` (task-10)
- [x] Implement `commit_file()` and `commit_all()` (task-11)
- [x] Implement branch operations (task-12)
- [x] Implement diff/merge operations (task-13)
- [x] Implement history browsing (task-14)
- [x] Add Tauri commands for Git operations (task-15)

### Phase 3: File Management 🚧 IN PROGRESS (4/5)
- [x] Implement file naming strategy (001-chapter.md) (task-16)
- [x] Implement file creation in Git repos (task-17)
- [x] Implement file reordering/renaming (task-18)
- [x] Implement metadata.json handling (task-19)
- [ ] Add auto-commit on save (debounced) (task-20, LOW priority)

### Phase 4: Frontend ⏳ NOT STARTED (0/6)
- [ ] Chapter/child story management UI (task-21)
- [ ] Reordering interface (drag-and-drop) (task-22)
- [ ] Branch management UI (task-23)
- [ ] Diff viewer (task-24)
- [ ] Merge conflict resolution UI (task-25)
- [ ] History timeline viewer (task-26)

## Implementation Decisions Made

### ✅ Resolved Questions

1. **File Naming**: ✅ **Order-based with slugified titles** - Format: `{order:03}-{slugified-title}.md`
   - Example: `001-the-beginning.md`, `042-the-final-battle.md`
   - Implemented in `file_naming.rs` with slugify function
   - Supports reordering with two-phase rename strategy

2. **Commit Strategy**: ✅ **Manual commits for now**
   - Task-20 (auto-commit with debouncing) deferred as LOW priority
   - Can be added later when frontend integration is ready

3. **Metadata Storage**: ✅ **Pretty-printed JSON in repo root**
   - `metadata.json` contains story id, title, type, status, dates, word counts
   - Human-readable formatting for manual inspection
   - Committed to Git with story changes

### ⏳ Open Questions

1. **Merge Conflicts**: Auto-resolve (take newer), or show UI for manual resolution?
   - UI components planned (task-25) but not implemented yet

2. **History Depth**: Keep all history forever, or prune old commits after some time?
   - Keeping all history for now (Git is efficient with storage)
   - Can add pruning later if needed

3. **Commit Frequency** (task-20): Auto-commit every N seconds when changed, or only on manual save?
   - Deferred to later phase when frontend integration is ready

