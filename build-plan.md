# Container/Story Architecture Refactor

## Overview
- **Type**: refactor
- **Scope**: Separate containers and content into distinct entities (Container + Story)
- **Tech Stack**: Rust (Tauri backend), TypeScript (React frontend), SQLite

## Context

The current `Story` model conflates two fundamentally different concepts:
1. **Organizational structures** (Novel, Series, Collection) - containers that organize content
2. **Written content** (Chapter, ShortStory, Scene) - documents users actually write in

This leads to:
- `CONTAINER_TYPES` arrays duplicated across the codebase
- Conditional logic everywhere (`if story.storyType in containers then X else Y`)
- Fields that are meaningless for one type (`order` for containers, `content` for pure organizers)
- Conceptual confusion when designing new features

**Solution**: Split into two clean entities:
- **Container** = Organizer (can nest, no content). User sees it as "Novel", "Series", etc.
- **Story** = Content (leaf node, has text). User sees it as "Chapter", "Short Story", etc.

## Risk Assessment
- **Blast radius**: High - touches models, database, commands, and all frontend views
- **Reversibility**: Easy - no production data, database can be dropped entirely
- **Spread potential**: Good - cleaner abstractions will make future code simpler
- **Sequencing**: Safe to proceed - no users, no production data

## Database Freedom

**The database can be completely dropped and recreated.** There is:
- No production data
- No real users
- Only a few test examples used during development

This means:
- No migration scripts needed
- No backwards compatibility concerns
- Tables can be dropped, renamed, or restructured freely
- Schema can be designed from scratch for the new model

## Target Architecture

### Entities

| Entity | Purpose | Git Repo |
|--------|---------|----------|
| Universe | Shared context (elements, lore) | No |
| Container | Organizes children (can nest) | Only if "leaf" (contains Stories, not child Containers) |
| Story | Content you write | Shares parent Container's repo, OR own repo if standalone |

### Hierarchy Examples

```
Universe: "My TV Show"
├── Container: "Season 1"                  ← leaf, HAS Git repo
│   ├── Story: "Pilot"                     ← shares repo
│   └── Story: "Episode 2"
└── Container: "Season 2"                  ← leaf, HAS Git repo
    └── ...

Universe: "My Book Series"
├── Container: "The Trilogy"               ← NOT leaf, no repo
│   ├── Container: "Book 1"                ← leaf, HAS Git repo
│   │   ├── Story: "Chapter 1"
│   │   └── Story: "Chapter 2"
│   └── Container: "Book 2"                ← leaf, HAS Git repo
│       └── ...

Universe: "Comic Adventures"
├── Story: "Adventure 1"                   ← standalone, HAS own Git repo
├── Story: "Adventure 2"                   ← standalone, HAS own Git repo
└── Story: "Adventure 3"
```

### Key Rules

1. **Leaf Container** = Contains only Stories (no child Containers) → has Git repo
2. **Non-leaf Container** = Contains child Containers → no Git repo
3. **Standalone Story** = No parent Container → has own Git repo
4. **Child Story** = Has parent Container → shares parent's Git repo
5. **StoryType** = Optional metadata label (chapter, scene, short-story, screenplay, etc.) for display/filtering
6. **ContainerType** = User-facing label (novel, series, collection) for display
7. **Leaf Protection** = A leaf container with stories cannot have child containers added (prevents breaking existing git repo structure)
8. **Universe-level ordering** = Containers and standalone stories at universe root have no defined order (unordered for now)

---

## Phases

### Phase 1: Database Schema

#### 1.1 Create Containers Table
- **What**: New `containers` table for organizational entities
- **Where**: `src-tauri/src/db/migrations.rs`
- **Fields**: id, universe_id, parent_container_id (nullable), container_type, title, description, order (for sibling ordering within parent, not used at universe root), git_repo_path (nullable), current_branch, timestamps
- **Done when**: Migration runs, table exists

#### 1.2 Simplify Stories Table
- **What**: Remove container-related fields from stories, add container_id foreign key
- **Where**: `src-tauri/src/db/migrations.rs`
- **Changes**:
  - Remove: parent_story_id (replaced by container_id)
  - Add: container_id (nullable FK to containers)
  - Keep: story_type as optional label
- **Done when**: Stories only represent content, not containers

#### 1.3 Drop Old Schema
- **What**: Drop existing stories table and any related tables
- **Where**: `src-tauri/src/db/migrations.rs`
- **Action**: Remove old migrations, start fresh with new schema
- **Done when**: Clean database with only new containers + stories tables

---

### Phase 2: Rust Models

#### 2.1 Create Container Model
- **What**: New `Container` struct with nesting support
- **Where**: `src-tauri/src/models/container.rs` (new file)
- **Fields**: id, universe_id, parent_container_id, container_type, title, description, order, git_repo_path, current_branch, staged_changes, created_at, updated_at
- **Methods**: `is_leaf()`, `should_have_git_repo()`
- **Tests**: Verify is_leaf correctly identifies containers containing only stories
- **Done when**: Container model compiles, has ts-rs export

#### 2.2 Simplify Story Model
- **What**: Remove container concerns from Story struct
- **Where**: `src-tauri/src/models/story.rs`
- **Changes**:
  - Remove: parent_story_id
  - Add: container_id (Option<String>)
  - Keep: story_type as optional label
  - Simplify: `should_have_git_repo()` → only checks if container_id is None
- **Tests**: Verify standalone stories get git repos, child stories don't
- **Done when**: Story model is purely about content

#### 2.3 Update StoryType Enum
- **What**: Remove container types (novel, series, collection) from enum, keep screenplay as content type
- **Where**: `src-tauri/src/models/story.rs`
- **Keep**: chapter, scene, short-story, episode, poem, outline, treatment, screenplay
- **Done when**: Enum only contains content types

---

### Phase 3: Rust Repositories

#### 3.1 Create Container Repository
- **What**: CRUD operations for containers with nesting support
- **Where**: `src-tauri/src/repositories/container.rs` (new file)
- **Operations**: create, find_by_id, list_by_universe, list_children, update, delete (cascade + filesystem cleanup), reorder_children
- **Validation**:
  - On create with parent_container_id: Check if parent has stories → reject with error "Cannot add child container to a container that already has stories"
  - On delete: Remove git repo directory from filesystem if git_repo_path is set
- **Tests**: Verify nested container queries work correctly, verify leaf protection validation, verify filesystem cleanup on delete
- **Done when**: All CRUD operations work, children queries return correct results, leaf protection enforced

#### 3.2 Update Story Repository
- **What**: Update queries to use container_id instead of parent_story_id
- **Where**: `src-tauri/src/repositories/story.rs`
- **Changes**:
  - Update list_children → list_by_container
  - Remove get_with_children (containers handle this now)
  - Update reorder to work with container_id
- **Tests**: Verify stories can be listed by container
- **Done when**: Story repo no longer has container logic

---

### Phase 4: Tauri Commands

#### 4.1 Add Container Commands
- **What**: Expose container operations to frontend
- **Where**: `src-tauri/src/lib.rs`
- **Commands**: create_container, get_container, list_containers, list_container_children, update_container, delete_container, reorder_container_children
- **Tests**: Verify all commands callable from frontend
- **Done when**: Frontend can perform all container CRUD

#### 4.2 Update Story Commands
- **What**: Simplify story commands, remove container logic
- **Where**: `src-tauri/src/lib.rs`
- **Changes**:
  - Update create_story to accept container_id
  - Remove list_children from stories (use containers)
  - Update reorder to work within containers
- **Tests**: Verify story creation works with and without container_id
- **Done when**: Story commands are simpler, no container branching

#### 4.3 Remove Obsolete Commands
- **What**: Remove commands that no longer make sense
- **Where**: `src-tauri/src/lib.rs`
- **Remove**: list_story_children, get_story_with_children, reorder_story_children (replaced by container equivalents)
- **Done when**: No orphaned commands

---

### Phase 5: TypeScript Types

#### 5.1 Generate New Types
- **What**: Run ts-rs to generate Container type and updated Story type
- **Where**: `src/types/`
- **Command**: `cd src-tauri && cargo test --lib`
- **Done when**: `Container.ts` exists, `Story.ts` updated

#### 5.2 Update Type Imports
- **What**: Update frontend code to import new types
- **Where**: Throughout `src/`
- **Done when**: No type errors, new types used correctly

---

### Phase 6: State Management

#### 6.1 Create Containers Store
- **What**: Zustand store for container state
- **Where**: `src/stores/useContainersStore.ts` (new file)
- **State**: containers, containerChildren (by parent), loading states
- **Actions**: loadContainers, loadContainerChildren, createContainer, updateContainer, deleteContainer, reorderChildren
- **Done when**: Store can manage full container tree

#### 6.2 Update Stories Store
- **What**: Simplify stories store, remove container logic
- **Where**: `src/stores/useStoriesStore.ts`
- **Changes**:
  - Remove: childrenByParentId (moved to containers)
  - Update: loadStories to filter by container_id
  - Simplify: No more CONTAINER_TYPES checks
- **Done when**: Store only manages story content

---

### Phase 7: Frontend Views

#### 7.1 Create Container Views
- **What**: Views for managing container hierarchy
- **Where**: `src/views/ContainerView.tsx`, `src/views/ContainerChildrenView.tsx` (new files)
- **Features**:
  - View container details
  - List/reorder children (child containers or stories)
  - Navigate to child containers or stories
- **Done when**: Can navigate and manage container tree

#### 7.2 Update Story Views
- **What**: Simplify story views, remove container branching
- **Where**: `src/views/StoriesList.tsx`, `src/views/StoryEditor.tsx`
- **Changes**:
  - Remove: CONTAINER_TYPES checks
  - Remove: Conditional navigation (containers vs content)
  - Stories always navigate to editor
- **Tests**: Verify story click always opens editor
- **Done when**: No more container/content branching in UI

#### 7.3 Update Navigation
- **What**: Update router and navigation logic
- **Where**: `src/stores/useNavigationStore.ts`, `src/App.tsx`
- **Changes**:
  - Add: container and container-children screens
  - Update: Story navigation always goes to editor
  - Remove: story-children screen (replaced by container-children)
- **Done when**: Navigation cleanly separates containers and stories

#### 7.4 Update Components
- **What**: Update shared components for new model
- **Where**: `src/components/`
- **Changes**:
  - CreateContainerModal (new)
  - Update CreateStoryModal (remove container types, add container selection)
  - Update StoryCard (remove child count for stories)
  - Create ContainerCard (shows child count, container type label)
- **Done when**: Components work with new model

---

### Phase 8: Git Integration

#### 8.1 Update Git Initialization
- **What**: Git repos created for leaf containers and standalone stories
- **Where**: `src-tauri/src/services/git.rs` (or equivalent)
- **Logic**:
  - When creating a container: Check if it will be a leaf, init Git if so
  - When creating a story: Check if standalone (no container_id), init Git if so
- **Transaction Handling**:
  - Container/Story creation with git repo must be atomic
  - Sequence: 1) Insert DB row, 2) Init git repo, 3) Update git_repo_path in DB
  - On git init failure: Rollback DB insert, return error
  - On path update failure: Delete git repo directory, rollback DB, return error
- **Tests**: Verify correct entities get Git repos, verify rollback on git init failure
- **Done when**: Git repos created for correct entities with proper transaction handling

#### 8.2 Handle Leaf Status Changes
- **What**: Prevent breaking leaf container structure
- **Where**: `src-tauri/src/repositories/container.rs` (validation in create)
- **Decision**: **PREVENT** - Do not allow adding child containers to a leaf container that has stories
- **Rationale**: Keeps git repo structure simple; avoids complex migrations of existing repos
- **Behavior**:
  - Adding child container to empty container: Allowed (container becomes non-leaf, no git repo needed yet)
  - Adding child container to container with stories: **Rejected with error**
  - Container loses all child containers: Remains non-leaf (no automatic git repo creation)
- **Done when**: Validation prevents invalid nesting, error message is clear

---

### Phase 9: Cleanup

#### 9.1 Remove Dead Code
- **What**: Remove all code related to old Story-as-container model
- **Where**: Throughout codebase
- **Remove**:
  - CONTAINER_TYPES arrays
  - Container-related conditional logic in stories
  - Old components (ChildStoryList if replaced)
  - Unused store state
- **Done when**: No references to old model where Story could be a container

#### 9.2 Update Documentation
- **What**: Update CLAUDE.md and other docs
- **Where**: `CLAUDE.md`, `docs/`
- **Changes**:
  - Document new Container/Story model
  - Update architecture section
  - Update entity descriptions
- **Done when**: Docs reflect new architecture

---

## Dependencies

- No new external dependencies required
- May need to update existing test fixtures

## Notes

### Naming
- **Container** = The internal entity name (describes what it does)
- **ContainerType** = User-facing label (novel, series, collection)
- **Story** = Content entity
- **StoryType** = Optional user-facing label (chapter, scene, short-story, episode, poem, outline, treatment, screenplay)

### Migration Strategy
**Clean slate approach** - no migration complexity:
1. Drop all existing tables (stories, etc.)
2. Create new schema from scratch (containers, stories)
3. No data preservation needed - test data is disposable

### Future Considerations
- Container templates that pre-configure child structure (e.g., "Novel" template creates a container with 10 chapter placeholders)
- Consider if Story.story_type should be truly optional (nullable) or have a default
- Consider allowing custom ContainerType and StoryType values beyond the predefined ones

