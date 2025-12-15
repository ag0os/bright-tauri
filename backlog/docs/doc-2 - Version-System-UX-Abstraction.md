---
id: doc-2
title: Version-System-UX-Abstraction
type: design
created_date: '2025-12-15 17:06'
status: approved
---

# Version System UX Abstraction

## Overview

This document outlines the plan to abstract Git-based versioning into a writer-friendly experience. Users should never see Git terminology - instead, they interact with **Variations**, **Snapshots**, and **History** in language that makes sense for creative writing.

## Goals

1. **Hide Git complexity** - Users don't need to know we use Git internally
2. **Writer-friendly terminology** - Use language that resonates with creative workflows
3. **Debugging support** - Maintain internal consistency for troubleshooting
4. **Simplified conflict resolution** - Side-by-side text comparison for story merges

## Terminology Mapping

| Git Concept | User-Facing Term | Notes |
|-------------|------------------|-------|
| Branch | **Variation** | Alternate version of the story |
| `main` branch | **Original** | The primary version |
| Commit | **Snapshot** | A saved point in time |
| Commit message | **Note** | Optional description of changes |
| Commit hash | **Version ID** | Shown in parentheses for debugging |
| Diff | **Compare** | View differences between variations |
| Merge | **Combine** | Bring changes from one variation into another |
| Merge conflict | **Conflicting changes** | When both variations changed the same part |
| Checkout | **Switch to** | Change active variation |
| Restore commit | **Restore snapshot** | Go back to a previous point |

## Git Branch Naming Convention

To maintain consistency between UI and Git internals:

| UI Display | Git Branch Name | Storage |
|------------|-----------------|---------|
| Original | `original` | Default branch for all new stories |
| "What if Sarah lived?" | `what-if-sarah-lived` | Slugified version |
| "Dark Ending 2.0" | `dark-ending-2-0` | Slugified version |

### Variation Name Mapping

Users can name variations with any characters. We store the mapping in `metadata.json`:

```json
{
  "id": "story-uuid",
  "title": "My Story",
  "variations": {
    "original": "Original",
    "what-if-sarah-lived": "What if Sarah lived?",
    "dark-ending-2-0": "Dark Ending 2.0"
  }
}
```

### Slug Generation Rules

1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep alphanumeric and hyphens)
4. Collapse multiple hyphens into one
5. Handle duplicates by appending `-2`, `-3`, etc.

## UI Changes by View

### 1. StoryVariations (formerly StoryBranches)

**Current issues:**
- Title says "Story Variations" but button says "New Branch"
- Uses "branch" terminology throughout
- Shows raw branch names

**Changes:**
- Rename file to `StoryVariations.tsx`
- Button: "New Branch" → "New Variation"
- Show display names from metadata mapping
- "Current branch" → "Current variation"
- "Switch" → "Switch to"
- "Merge" → "Combine"
- Default variation labeled as "Original"

### 2. StoryHistory

**Current issues:**
- Shows commit hash prominently
- "Restore" button without context

**Changes:**
- Display format: `{relative_time} - {note} ({short_hash})`
- Example: "2 hours ago - Chapter 3 rewrite (abc1234)"
- If no note: "2 hours ago - Auto-save (abc1234)"
- "Restore" → "Restore this snapshot"
- Add confirmation: "Restore to this snapshot? Current changes will be preserved in a new variation."

### 3. StoryCompare (formerly StoryDiff)

**Current issues:**
- Shows file-level diffs (overkill for single-file stories)
- Technical diff format

**Changes:**
- Rename file to `StoryCompare.tsx`
- Title: "Compare Variations"
- Side-by-side text view of story content
- Highlight changed sections (not line-by-line code diff)
- Show variation display names in dropdowns
- Change status labels: Added → New, Modified → Changed, Deleted → Removed

### 4. StoryCombine (formerly StoryMerge)

**Current issues:**
- File-level conflict resolution
- "ours/theirs" Git terminology
- Complex UI for simple use case

**Changes:**
- Rename file to `StoryCombine.tsx`
- Title: "Combine Variations"
- Side-by-side text panels showing both versions
- For conflicts: highlight conflicting sections
- Actions: "Keep from {variation_name}" / "Keep from {other_variation_name}"
- Option to manually edit the combined result
- Simplified single-file focus (stories are one file)

### 5. Settings

**Current issues:**
- "Auto-commit" terminology
- "Commit Trigger" / "Commit Interval"

**Changes:**
- Section: "Version Control" → "Auto-Save"
- "Auto-commit" → "Auto-save snapshots"
- "Commit Trigger" → "Save timing"
- "Commit Interval" → "Save frequency"
- Options: "When leaving editor" / "Periodically"

### 6. Navigation & Routes

**Changes:**
- Route `story-branches` → `story-variations`
- Route `story-diff` → `story-compare`
- Route `story-merge` → `story-combine`
- Route `story-history` stays the same

## Backend Changes

### New/Modified Rust Functions

1. **Slug generation utility**
   - `fn slugify(name: &str) -> String`
   - Handle duplicates with suffix

2. **Variation metadata management**
   - `fn save_variation_mapping(repo_path, slug, display_name)`
   - `fn get_variation_display_name(repo_path, slug) -> String`
   - `fn list_variations(repo_path) -> Vec<{slug, display_name}>`

3. **Default branch rename**
   - New repos use `original` instead of `main`
   - Migration: detect `main`, treat as `original` in UI

### Modified Tauri Commands

| Current Command | Changes |
|-----------------|---------|
| `git_create_branch` | Accept display name, generate slug, save mapping |
| `git_list_branches` | Return display names from metadata |
| `git_get_current_branch` | Return display name |
| `git_checkout_branch` | Accept either slug or display name |
| `git_merge_branches` | Return user-friendly conflict info |
| `git_init_repo` | Use `original` as default branch |

### TypeScript Types

New/modified types:

```typescript
// New type for variation info
export type Variation = {
  slug: string;        // Git branch name
  displayName: string; // User-facing name
  isCurrent: boolean;
  isOriginal: boolean;
};

// Modified commit info display
export type Snapshot = {
  id: string;          // Short hash for debugging
  fullHash: string;    // Full hash (internal)
  note: string;        // Commit message or "Auto-save"
  timestamp: string;   // ISO timestamp
  relativeTime: string; // "2 hours ago"
};
```

## Implementation Phases

### Phase 1: Backend Foundation
**Priority: Must do first**

1. Add `slugify()` utility function
2. Update `metadata.json` schema to include variations mapping
3. Modify `git_init_repo` to use `original` branch
4. Add variation CRUD functions (save/get/list mappings)
5. Update `git_create_branch` to handle display names
6. Update `git_list_branches` to return display names
7. Handle migration: `main` → `original` compatibility

### Phase 2: Terminology Updates
**Priority: Can parallelize after Phase 1**

1. Rename `StoryBranches.tsx` → `StoryVariations.tsx`
2. Update all "branch" text to "variation"
3. Update Settings terminology
4. Update navigation routes
5. Show display names instead of slugs

### Phase 3: History View Enhancement
**Priority: Independent**

1. Update snapshot display format
2. Add relative time + note + (hash) format
3. Improve restore confirmation messaging

### Phase 4: Simplified Conflict UI
**Priority: After Phase 2**

1. Rename `StoryDiff.tsx` → `StoryCompare.tsx`
2. Implement side-by-side text comparison
3. Rename `StoryMerge.tsx` → `StoryCombine.tsx`
4. Implement side-by-side conflict resolution
5. Add inline editing for combined result

## Migration Strategy

For existing stories with `main` branch:

1. **Detection**: Check if `main` exists and `original` doesn't
2. **UI Handling**: Display `main` as "Original" in the UI
3. **No automatic rename**: Avoid breaking existing repos
4. **New stories**: Always use `original`

For existing stories without variation metadata:

1. **On load**: Generate default mapping from existing branches
2. **Display names**: Use branch name as display name (capitalized)
3. **Save mapping**: Persist to metadata.json on first access

## Success Criteria

1. No Git terminology visible to users in any UI
2. Users can name variations with any characters
3. Debugging remains possible via visible short hashes
4. Conflict resolution is intuitive (side-by-side text)
5. Existing stories continue to work (backward compatible)

## Open Questions

1. **Snapshot limits**: Should we auto-prune old auto-save snapshots? (Deferred)
2. **Variation icons**: Should variations have custom icons/colors? (Nice to have)
3. **Snapshot notes**: Should users be able to edit snapshot notes after creation?

## Related Tasks

Tasks will be created in backlog for each phase:
- Phase 1: Backend foundation tasks
- Phase 2: UI terminology tasks
- Phase 3: History view tasks
- Phase 4: Conflict UI tasks
