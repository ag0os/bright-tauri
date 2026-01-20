# Implementation Plan: Database-Only Versioning

> Based on [ADR 002: Database-Only Versioning](../decisions/002-database-only-versioning.md)

## Overview

Replace Git-based versioning with a database-only approach using a two-level hierarchy:

```
Story
└── Version ("Original", "Alternate Ending", etc.)
    └── Snapshots (auto-saved states within that version)
```

- **Versions** are user-created named variations of a story
- **Snapshots** are automatic point-in-time saves within a version
- The `stories` table tracks which version and snapshot are currently active
- Content records are never copied between each other (except when creating new snapshots)

## Decisions Made

| Question | Decision |
|----------|----------|
| Migration strategy | Clean slate - drop all existing data |
| Existing Git branches | Lost (acceptable) |
| Story + content loading | Inline - single request returns story with active content |
| Restore behavior | Switch pointer to snapshot (edits then modify that snapshot) |
| Diff library | Defer until basic versioning works |
| Settings storage | Keep existing Zustand + localStorage |
| Snapshot display | Absolute timestamps |
| **Auto-save (crash protection)** | 30s debounce, updates current snapshot in place |
| **Snapshot creation trigger** | Setting: "on leave" OR "after X characters" (default: 500 chars) |
| **Version creation** | Frontend passes content; save current snapshot first |
| **Frontend snapshot tracking** | Frontend passes `story_id`, backend resolves active snapshot |
| **Content save side effects** | `update_snapshot_content` also updates `stories.word_count` and `stories.last_edited_at` |
| **Delete last version** | Prevent with error |
| **Delete "Original" version** | Allowed (no special protection) |
| **Delete active version** | Warning → if confirmed, auto-switch to most recent remaining |
| **Git removal timing** | After Phase 4 is verified (not after Phase 3) |

## Current Implementation (for reference)

- **Database auto-save**: `useAutoSave.ts` - 2s debounce → `updateStory()` (will change to 30s)
- **Git snapshots**: `useAutoCommit.ts` - 30s debounce → `git_commit_file()` (will be removed)
- **Settings**: `useSettingsStore.ts` - Zustand with localStorage persistence

---

## Phase 1: Database Schema Changes

### 1.1 New Tables

```sql
-- Versions: named variations of a story
CREATE TABLE story_versions (
    id TEXT PRIMARY KEY NOT NULL,
    story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,  -- "Original", "Alternate Ending", etc.
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_story_versions_story_id ON story_versions(story_id);
CREATE UNIQUE INDEX idx_story_versions_name ON story_versions(story_id, name);

-- Snapshots: point-in-time content saves within a version
CREATE TABLE story_snapshots (
    id TEXT PRIMARY KEY NOT NULL,
    version_id TEXT NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_story_snapshots_version_id ON story_snapshots(version_id);
CREATE INDEX idx_story_snapshots_created_at ON story_snapshots(version_id, created_at DESC);
```

### 1.2 Modify `stories` Table

**Add columns:**
```sql
ALTER TABLE stories ADD COLUMN active_version_id TEXT REFERENCES story_versions(id);
ALTER TABLE stories ADD COLUMN active_snapshot_id TEXT REFERENCES story_snapshots(id);
```

**Remove columns:**
- `content`
- `git_repo_path`
- `current_branch`
- `staged_changes`

### 1.3 Migration Strategy

Clean slate approach:
1. Drop existing database
2. Run fresh migrations with new schema
3. All test data will be recreated

### 1.4 Story Creation Flow

When a new story is created:
1. Insert story record
2. Create "Original" version → set `active_version_id`
3. Create initial empty snapshot → set `active_snapshot_id`

---

## Phase 2: Backend - Rust Models

### 2.1 New Models

```rust
// src-tauri/src/models/story_version.rs

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
pub struct StoryVersion {
    pub id: String,
    pub story_id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
}
```

```rust
// src-tauri/src/models/story_snapshot.rs

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
pub struct StorySnapshot {
    pub id: String,
    pub version_id: String,
    pub content: String,
    pub created_at: String,
}
```

### 2.2 Modify `Story` Model

```rust
// Updated Story struct
pub struct Story {
    pub id: String,
    pub title: String,
    pub story_type: StoryType,
    pub container_id: Option<String>,
    pub order_index: i32,
    pub word_count: i32,
    pub created_at: String,
    pub updated_at: String,
    pub last_edited_at: String,

    // New fields
    pub active_version_id: Option<String>,
    pub active_snapshot_id: Option<String>,

    // Inline content (populated by JOIN)
    pub active_version: Option<StoryVersion>,
    pub active_snapshot: Option<StorySnapshot>,

    // Removed: content, git_repo_path, current_branch, staged_changes
}
```

### 2.3 Repositories

```rust
// src-tauri/src/repositories/story_version_repository.rs

impl StoryVersionRepository {
    pub fn create(&self, story_id: &str, name: &str) -> Result<StoryVersion>;
    pub fn get(&self, id: &str) -> Result<Option<StoryVersion>>;
    pub fn list_by_story(&self, story_id: &str) -> Result<Vec<StoryVersion>>;
    pub fn rename(&self, id: &str, new_name: &str) -> Result<()>;
    pub fn delete(&self, id: &str) -> Result<()>;
}
```

```rust
// src-tauri/src/repositories/story_snapshot_repository.rs

impl StorySnapshotRepository {
    pub fn create(&self, version_id: &str, content: &str) -> Result<StorySnapshot>;
    pub fn get(&self, id: &str) -> Result<Option<StorySnapshot>>;
    pub fn get_latest(&self, version_id: &str) -> Result<Option<StorySnapshot>>;
    pub fn list_by_version(&self, version_id: &str) -> Result<Vec<StorySnapshot>>;
    pub fn update_content(&self, id: &str, content: &str) -> Result<()>;
    pub fn delete(&self, id: &str) -> Result<()>;
    pub fn delete_oldest(&self, version_id: &str, keep_count: i32) -> Result<i32>; // Returns deleted count
}
```

---

## Phase 3: Backend - Tauri Commands

### 3.1 Version Commands

```rust
#[tauri::command]
fn create_story_version(story_id: String, name: String, content: String) -> Result<StoryVersion>;
// Frontend passes current editor content
// Backend creates new version + snapshot with that content
// Backend updates stories.active_version_id and active_snapshot_id

#[tauri::command]
fn list_story_versions(story_id: String) -> Result<Vec<StoryVersion>>;

#[tauri::command]
fn rename_story_version(version_id: String, new_name: String) -> Result<()>;

#[tauri::command]
fn delete_story_version(version_id: String) -> Result<()>;
// Error if this is the last version ("Cannot delete the only version")
// If deleting active version: auto-switch to most recent remaining version
// Frontend should show warning before deleting active version

#[tauri::command]
fn switch_story_version(story_id: String, version_id: String) -> Result<Story>;
// Also sets active_snapshot_id to latest snapshot of that version
```

### 3.2 Snapshot Commands

```rust
#[tauri::command]
fn create_story_snapshot(story_id: String, content: String) -> Result<StorySnapshot>;
// Creates new snapshot for the current active version
// Updates stories.active_snapshot_id to the new snapshot
// Updates stories.word_count and stories.last_edited_at
// Applies retention policy (delete oldest if over limit)

#[tauri::command]
fn list_story_snapshots(version_id: String) -> Result<Vec<StorySnapshot>>;

#[tauri::command]
fn update_snapshot_content(story_id: String, content: String, word_count: u32) -> Result<()>;
// This is the auto-save target (30s debounce)
// Backend resolves current active_snapshot_id internally
// Also updates stories.word_count and stories.last_edited_at

#[tauri::command]
fn switch_story_snapshot(story_id: String, snapshot_id: String) -> Result<Story>;
// Restore to a previous snapshot

#[tauri::command]
fn cleanup_old_snapshots(version_id: String, keep_count: i32) -> Result<i32>;
```

### 3.3 Modified Commands

**`get_story`**: Now returns story with inline `active_version` and `active_snapshot`

**`create_story`**: Now also:
1. Creates "Original" version
2. Creates initial snapshot with empty content
3. Sets both `active_version_id` and `active_snapshot_id`

### 3.4 Commands to Remove

Current Git commands in `src-tauri/src/commands/git.rs`:
- `git_init_repo`
- `git_commit_file`
- `git_commit_all`
- `git_get_status`
- `git_get_history`
- `git_get_branches`
- `git_create_branch`
- `git_checkout_branch`
- `git_delete_branch`
- `git_get_diff`
- `git_merge_branch`
- `git_get_file_at_commit`

All will be removed.

---

## Phase 4: Frontend - Editor Updates

### 4.1 Update `StoryEditor` Component

**Current flow:**
```tsx
// Load
const story = await invoke('get_story', { id });
setContent(story.content);

// Save (via useAutoSave)
await invoke('update_story', { story: { ...story, content } });
```

**New flow:**
```tsx
// Load
const story = await invoke('get_story', { id });
setContent(story.active_snapshot?.content ?? '');
// No need to track active_snapshot_id locally!

// Auto-save (via useAutoSave, 30s debounce)
await invoke('update_snapshot_content', {
  storyId,  // Backend resolves active snapshot
  content,
  wordCount
});
```

**Key simplification:** Frontend only tracks `storyId`. Backend handles all snapshot pointer resolution. This eliminates sync issues when snapshots are created mid-session.

### 4.2 Update `useAutoSave` Hook

Changes:
- Update delay from 2s to 30s
- Save callback calls `update_snapshot_content(storyId, content, wordCount)` instead of `update_story`

### 4.3 Remove `useAutoCommit` Hook

This hook managed Git commits. Delete entirely:
- `src/hooks/useAutoCommit.ts`
- `src/hooks/useAutoCommit.test.ts`

---

## Phase 5: Frontend - Views Updates

### 5.1 `StoryVariations` View → Rename to `StoryVersions`

**Current:** Shows Git branches as variations

**New:**
- List versions: `list_story_versions(story_id)`
- Create version flow:
  1. Trigger save on current snapshot first (persist pending changes)
  2. Call `create_story_version(story_id, name, content)` with current editor content
  3. Backend creates version + snapshot, switches active pointers
- Switch: `switch_story_version(story_id, version_id)`
- Rename: `rename_story_version(version_id, new_name)`
- Delete: `delete_story_version(version_id)`
  - If deleting active version: show warning "This is your active version. Deleting will switch to [other version]. Continue?"
  - If last version: backend returns error, show "Cannot delete the only version"

### 5.2 `StoryHistory` View

**Current:** Shows Git commit history

**New:**
- List snapshots for current version: `list_story_snapshots(active_version_id)`
- Restore: `switch_story_snapshot(story_id, snapshot_id)`
- Display: Show `created_at` timestamp for each snapshot
- No manual delete UI (handled by retention policy)

### 5.3 Defer: `StoryCompare` View

Keep existing view but stub out until diff library decision is made.

### 5.4 Remove: `StoryCombine` View

Delete entirely - no merge conflicts in this model.

---

## Phase 6: Remove Git Code

### 6.1 Rust Files to Delete

- `src-tauri/src/git.rs` (~700 lines)
- `src-tauri/src/file_management.rs`
- `src-tauri/src/commands/git.rs`

### 6.2 Dependencies to Remove

From `src-tauri/Cargo.toml`:
```toml
git2 = "..."  # Remove this line
```

### 6.3 Frontend Files to Delete/Update

**Delete:**
- `src/hooks/useAutoCommit.ts`
- `src/hooks/useAutoCommit.test.ts`
- Any Git-related type definitions

**Update:**
- `src/types/` - Remove Git-related types after `cargo test --lib` regenerates
- `src/views/StoryVariations.tsx` - Rename and refactor
- `src/views/StoryHistory.tsx` - Refactor for snapshots
- `src/views/StoryCombine.tsx` - Delete
- `src/stores/useSettingsStore.ts` - Update settings for new snapshot system

---

## Phase 7: Auto-Snapshot System

### 7.1 Two-Layer Model

The system has two distinct saving mechanisms:

| Layer | Purpose | Trigger | Action |
|-------|---------|---------|--------|
| **Auto-save** | Crash protection | 30s after changes | Updates current snapshot in place |
| **Snapshot creation** | History restore points | Setting-based | Creates new snapshot, switches pointer |

**Auto-save (Layer 1):**
- Uses existing `useAutoSave` hook with 30s debounce
- Calls `update_snapshot_content(storyId, content, wordCount)`
- Invisible to user, just prevents data loss on crash

**Snapshot creation (Layer 2):**
- Triggered by user setting: "on leave" OR "after X characters"
- Calls `create_story_snapshot(storyId, content)`
- Creates visible history restore points

### 7.2 Trigger Mechanism

**Decision: Character count threshold (not word count, not time-based)**

```tsx
// New hook: useAutoSnapshot.ts
// Triggers snapshot when character count increases by threshold

interface UseAutoSnapshotProps {
  storyId: string;
  content: string;
  enabled: boolean;
  trigger: 'on_leave' | 'character_count';
  characterThreshold: number;  // Default: 500 characters
}

function useAutoSnapshot({
  storyId,
  content,
  enabled,
  trigger,
  characterThreshold = 500,
}: UseAutoSnapshotProps) {
  const lastSnapshotCharCount = useRef(content.length);

  useEffect(() => {
    if (!enabled || trigger !== 'character_count') return;

    const charsDelta = content.length - lastSnapshotCharCount.current;

    if (charsDelta >= characterThreshold) {
      // Create new snapshot
      invoke('create_story_snapshot', { storyId, content })
        .then(() => {
          lastSnapshotCharCount.current = content.length;
        });
    }
  }, [content, storyId, enabled, trigger, characterThreshold]);

  // Snapshot on unmount if trigger is 'on_leave' or content changed since last snapshot
  useEffect(() => {
    return () => {
      const shouldSnapshot = trigger === 'on_leave' ||
        content.length !== lastSnapshotCharCount.current;

      if (enabled && shouldSnapshot) {
        invoke('create_story_snapshot', { storyId, content });
      }
    };
  }, []);
}
```

**Why character count (not word count):**
- More precise measurement
- Simpler to compute (no tokenization)
- 500 characters ≈ 100 words

### 7.3 Configuration

Update `useSettingsStore.ts`:

```typescript
interface SettingsState {
  // Snapshot settings
  snapshotTrigger: 'on_leave' | 'character_count';  // Default: 'character_count'
  snapshotCharacterThreshold: number;                // Default: 500
  maxSnapshotsPerVersion: number;                    // Default: 50
}
```

### 7.4 Retention Policy

When creating a new snapshot:
1. Create the snapshot
2. Count snapshots for this version
3. If count > `maxSnapshotsPerVersion`, delete oldest

This keeps storage bounded without user intervention.

### 7.5 Edge Cases

- **Deletions**: Character count decrease doesn't trigger snapshot (user removing content)
- **On close**: If trigger is `on_leave`, always snapshot when leaving editor
- **Version switch**: Snapshot current version before switching (via create version flow)
- **Initial load**: Set `lastSnapshotCharCount` to current content length to avoid immediate snapshot

---

## Phase 8: Testing & Verification

### 8.1 Backend Tests

- [ ] StoryVersionRepository CRUD
- [ ] StorySnapshotRepository CRUD
- [ ] Story creation creates version + snapshot
- [ ] Switching version updates active pointers
- [ ] Switching snapshot updates active pointer
- [ ] Cascade delete: story → versions → snapshots
- [ ] Retention policy deletes oldest snapshots
- [ ] `update_snapshot_content` updates `word_count` and `last_edited_at` on stories
- [ ] `create_story_snapshot` updates active pointer and applies retention
- [ ] Delete last version returns error
- [ ] Delete active version auto-switches to most recent remaining

### 8.2 Frontend Tests

- [ ] Editor loads content from active snapshot
- [ ] Auto-save (30s) updates active snapshot via story_id
- [ ] Version list displays correctly
- [ ] Version switching works
- [ ] Version creation saves current snapshot first, then creates new version
- [ ] Version deletion shows warning when deleting active version
- [ ] Snapshot history displays correctly
- [ ] Snapshot restoration works
- [ ] Character threshold triggers snapshot creation
- [ ] On-leave trigger creates snapshot

---

## Implementation Order

```
Phase 1: Schema ──────────────────────┐
                                      │
Phase 2: Rust Models ─────────────────┼──► Phase 4: Editor
                                      │
Phase 3: Tauri Commands ──────────────┘
                                              │
                                              ▼
Phase 6: Remove Git ◄─────────────────────── (after Phase 4 verified)

Phase 5: Views ───────────────────────────► (after Phase 4 working)

Phase 7: Auto-Snapshot ───────────────────► (after Phase 5)

Phase 8: Testing ─────────────────────────► (ongoing)
```

**Suggested sprint breakdown:**

1. **Sprint 1**: Phases 1-3 (backend complete)
2. **Sprint 2**: Phase 4 (editor works with snapshots)
3. **Sprint 3**: Phase 6 + 5 (Git removed, views updated)
4. **Sprint 4**: Phase 7 + 8 (auto-snapshot + polish)

---

## Resolved Questions

All questions have been resolved and incorporated into the Decisions Made table at the top of this document.

## Open Questions

None - plan is ready for implementation.

