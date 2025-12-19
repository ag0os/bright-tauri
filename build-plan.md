# Project/Story Architecture Refactor

## Overview
- **Type**: refactor
- **Scope**: Separate containers and content into distinct entities (Project + Story)
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
- **Project** = Organizer (can nest, no content)
- **Story** = Content (leaf node, has text)

## Risk Assessment
- **Blast radius**: High - touches models, database, commands, and all frontend views
- **Reversibility**: Moderate - requires database migration, but we're in early dev with only test data
- **Spread potential**: Good - cleaner abstractions will make future code simpler
- **Sequencing**: Safe to proceed - no users, no production data

## Target Architecture

### Entities

| Entity | Purpose | Git Repo |
|--------|---------|----------|
| Universe | Shared context (elements, lore) | No |
| Project | Organizes children (can nest) | Only if "leaf" (contains Stories, not Projects) |
| Story | Content you write | Shares parent Project's repo, OR own repo if standalone |

### Hierarchy Examples

```
Universe: "My TV Show"
├── Project: "Season 1"                    ← leaf, HAS Git repo
│   ├── Story: "Pilot"                     ← shares repo
│   └── Story: "Episode 2"
└── Project: "Season 2"                    ← leaf, HAS Git repo
    └── ...

Universe: "My Book Series"
├── Project: "The Trilogy"                 ← NOT leaf, no repo
│   ├── Project: "Book 1"                  ← leaf, HAS Git repo
│   │   ├── Story: "Chapter 1"
│   │   └── Story: "Chapter 2"
│   └── Project: "Book 2"                  ← leaf, HAS Git repo
│       └── ...

Universe: "Comic Adventures"
├── Story: "Adventure 1"                   ← standalone, HAS own Git repo
├── Story: "Adventure 2"                   ← standalone, HAS own Git repo
└── Story: "Adventure 3"
```

### Key Rules

1. **Leaf Project** = Contains only Stories (no child Projects) → has Git repo
2. **Non-leaf Project** = Contains child Projects → no Git repo
3. **Standalone Story** = No parent Project → has own Git repo
4. **Child Story** = Has parent Project → shares parent's Git repo
5. **StoryType** = Optional metadata label (chapter, scene, short-story, etc.) for display/filtering

---

## Phases

### Phase 1: Database Schema

#### 1.1 Create Projects Table
- **What**: New `projects` table for organizational entities
- **Where**: `src-tauri/src/db/migrations.rs`
- **Fields**: id, universe_id, parent_project_id (nullable), title, description, order, git_repo_path (nullable), current_branch, timestamps
- **Done when**: Migration runs, table exists

#### 1.2 Simplify Stories Table
- **What**: Remove container-related fields from stories, add project_id foreign key
- **Where**: `src-tauri/src/db/migrations.rs`
- **Changes**:
  - Remove: parent_story_id (replaced by project_id)
  - Add: project_id (nullable FK to projects)
  - Keep: story_type as optional label
- **Done when**: Stories only represent content, not containers

#### 1.3 Data Migration
- **What**: No data migration needed (dev-only test data)
- **Where**: N/A
- **Done when**: Acknowledged that existing test data can be discarded

---

### Phase 2: Rust Models

#### 2.1 Create Project Model
- **What**: New `Project` struct with nesting support
- **Where**: `src-tauri/src/models/project.rs` (new file)
- **Fields**: id, universe_id, parent_project_id, title, description, order, git_repo_path, current_branch, staged_changes, created_at, updated_at
- **Methods**: `is_leaf()`, `should_have_git_repo()`
- **Tests**: Verify is_leaf correctly identifies projects containing only stories
- **Done when**: Project model compiles, has ts-rs export

#### 2.2 Simplify Story Model
- **What**: Remove container concerns from Story struct
- **Where**: `src-tauri/src/models/story.rs`
- **Changes**:
  - Remove: parent_story_id
  - Add: project_id (Option<String>)
  - Keep: story_type as optional label
  - Simplify: `should_have_git_repo()` → only checks if project_id is None
- **Tests**: Verify standalone stories get git repos, child stories don't
- **Done when**: Story model is purely about content

#### 2.3 Update StoryType Enum
- **What**: Remove container types (novel, series, collection, screenplay) from enum
- **Where**: `src-tauri/src/models/story.rs`
- **Keep**: chapter, scene, short-story, episode, poem, outline, treatment
- **Done when**: Enum only contains content types

---

### Phase 3: Rust Repositories

#### 3.1 Create Project Repository
- **What**: CRUD operations for projects with nesting support
- **Where**: `src-tauri/src/repositories/project.rs` (new file)
- **Operations**: create, find_by_id, list_by_universe, list_children, update, delete (cascade), reorder_children
- **Tests**: Verify nested project queries work correctly
- **Done when**: All CRUD operations work, children queries return correct results

#### 3.2 Update Story Repository
- **What**: Update queries to use project_id instead of parent_story_id
- **Where**: `src-tauri/src/repositories/story.rs`
- **Changes**:
  - Update list_children → list_by_project
  - Remove get_with_children (projects handle this now)
  - Update reorder to work with project_id
- **Tests**: Verify stories can be listed by project
- **Done when**: Story repo no longer has container logic

---

### Phase 4: Tauri Commands

#### 4.1 Add Project Commands
- **What**: Expose project operations to frontend
- **Where**: `src-tauri/src/lib.rs`
- **Commands**: create_project, get_project, list_projects, list_project_children, update_project, delete_project, reorder_project_children
- **Tests**: Verify all commands callable from frontend
- **Done when**: Frontend can perform all project CRUD

#### 4.2 Update Story Commands
- **What**: Simplify story commands, remove container logic
- **Where**: `src-tauri/src/lib.rs`
- **Changes**:
  - Update create_story to accept project_id
  - Remove list_children from stories (use projects)
  - Update reorder to work within projects
- **Tests**: Verify story creation works with and without project_id
- **Done when**: Story commands are simpler, no container branching

#### 4.3 Remove Obsolete Commands
- **What**: Remove commands that no longer make sense
- **Where**: `src-tauri/src/lib.rs`
- **Remove**: list_story_children, get_story_with_children, reorder_story_children (replaced by project equivalents)
- **Done when**: No orphaned commands

---

### Phase 5: TypeScript Types

#### 5.1 Generate New Types
- **What**: Run ts-rs to generate Project type and updated Story type
- **Where**: `src/types/`
- **Command**: `cd src-tauri && cargo test --lib`
- **Done when**: `Project.ts` exists, `Story.ts` updated

#### 5.2 Update Type Imports
- **What**: Update frontend code to import new types
- **Where**: Throughout `src/`
- **Done when**: No type errors, new types used correctly

---

### Phase 6: State Management

#### 6.1 Create Projects Store
- **What**: Zustand store for project state
- **Where**: `src/stores/useProjectsStore.ts` (new file)
- **State**: projects, projectChildren (by parent), loading states
- **Actions**: loadProjects, loadProjectChildren, createProject, updateProject, deleteProject, reorderChildren
- **Done when**: Store can manage full project tree

#### 6.2 Update Stories Store
- **What**: Simplify stories store, remove container logic
- **Where**: `src/stores/useStoriesStore.ts`
- **Changes**:
  - Remove: childrenByParentId (moved to projects)
  - Update: loadStories to filter by project_id
  - Simplify: No more CONTAINER_TYPES checks
- **Done when**: Store only manages story content

---

### Phase 7: Frontend Views

#### 7.1 Create Project Views
- **What**: Views for managing project hierarchy
- **Where**: `src/views/ProjectView.tsx`, `src/views/ProjectChildrenView.tsx` (new files)
- **Features**:
  - View project details
  - List/reorder children (projects or stories)
  - Navigate to child projects or stories
- **Done when**: Can navigate and manage project tree

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
  - Add: project and project-children screens
  - Update: Story navigation always goes to editor
  - Remove: story-children screen (replaced by project-children)
- **Done when**: Navigation cleanly separates projects and stories

#### 7.4 Update Components
- **What**: Update shared components for new model
- **Where**: `src/components/`
- **Changes**:
  - CreateProjectModal (new)
  - Update CreateStoryModal (remove container types, add project selection)
  - Update StoryCard (remove child count for stories)
  - Create ProjectCard (shows child count)
- **Done when**: Components work with new model

---

### Phase 8: Git Integration

#### 8.1 Update Git Initialization
- **What**: Git repos created for leaf projects and standalone stories
- **Where**: `src-tauri/src/services/git.rs` (or equivalent)
- **Logic**:
  - When creating a project: Check if it will be a leaf, init Git if so
  - When creating a story: Check if standalone (no project_id), init Git if so
  - When adding child project: Parent may no longer be leaf, handle accordingly
- **Tests**: Verify correct entities get Git repos
- **Done when**: Git repos created for correct entities

#### 8.2 Handle Leaf Status Changes
- **What**: Handle when a project gains/loses leaf status
- **Where**: `src-tauri/src/services/git.rs`
- **Scenarios**:
  - Leaf project gets child project → What happens to existing Git repo?
  - Project loses all child projects → Becomes leaf again?
- **Specifics**: Define behavior (likely: keep repo, just add complexity warning)
- **Done when**: Edge cases handled gracefully

---

### Phase 9: Cleanup

#### 9.1 Remove Dead Code
- **What**: Remove all code related to old container model
- **Where**: Throughout codebase
- **Remove**:
  - CONTAINER_TYPES arrays
  - Container-related conditional logic
  - Old components (ChildStoryList if replaced)
  - Unused store state
- **Done when**: No references to old container model

#### 9.2 Update Documentation
- **What**: Update CLAUDE.md and other docs
- **Where**: `CLAUDE.md`, `docs/`
- **Changes**:
  - Document new Project/Story model
  - Update architecture section
  - Remove references to container types
- **Done when**: Docs reflect new architecture

---

## Dependencies

- No new external dependencies required
- May need to update existing test fixtures

## Notes

### Naming Consideration
"Project" is a common term that might conflict with IDE or user mental models. Alternatives considered:
- **Folder** - too filesystem-y
- **Container** - what we're trying to get away from
- **Group** - generic but clear
- **Collection** - conflicts with old model
- **Project** - clear intent, widely understood

Decision: Stick with **Project** for now, can rename later if confusing.

### Migration Strategy
Since this is dev-only with test data, we can do a clean break:
1. Create new tables
2. Drop old tables (or leave them, delete later)
3. No data migration needed

### Future Considerations
- Projects could have type labels too (novel, series, etc.) if needed for UI
- Could add "project templates" that pre-configure child structure
- Consider if Story.story_type should be truly optional (nullable) or have a default

