# Bright - Product Roadmap & Ideas

## Vision
A creation app for writers and creators to build series of books, scripts, or any type of stories with AI assistance, voice dictation, and comprehensive universe building.

## Progress Summary

**Current Phase**: Frontend Development (Phase 1 Complete)

**Completion Status**:
- ✅ **Backend (95% Complete)**: Domain models, repository layer, Git integration, most service layer functionality
- ✅ **Design System (100% Complete)**: Full token-first design system with Storybook, all phases complete
- 🚧 **Frontend (60% Complete)**: Core UI, story editor, chapter management, drag-and-drop implemented
- ⏳ **AI Integration (Not Started)**: Awaiting Git UI completion
- ⏳ **Voice Dictation (Not Started)**: Awaiting Git UI completion

**Next Up**: Git integration UI (tasks 20, 23-26) - auto-commit, branch management, diff viewer, merge UI, history

## Implemented ✅

### Domain Models
- Universe: Project container with genre, tone, worldbuilding notes, themes, status
- Story: With variation system, Git-based versioning fields, and hierarchy support (chapters, child stories)
- Element: Flexible entities (characters, locations, vehicles, custom types) with labeled relationships
- SQLite database with migrations
- TypeScript type generation via ts-rs

### Backend - Repository Layer
- ✅ Universe CRUD operations
- ✅ Story CRUD operations (with hierarchy support: list_children, reorder_children, get_with_children)
- ✅ Element CRUD operations
- ✅ Element relationship queries (bidirectional)
- ✅ Story variation queries (get all variations in a group)

### Backend - Tauri Commands
- ✅ Universe management commands (create, get, list, update, delete)
- ✅ Story management commands (create, get, list, list variations, update, delete)
- ✅ Story hierarchy commands (list children, reorder children, get with children)
- ✅ Element management commands (create, get, list, list by type, get related, update, delete)
- ✅ Git operation commands (init, commit, branch, diff, merge, history)

### Backend - Git Integration
- ✅ Initialize Git repo for each story/variation group
- ✅ Create branches for variations
- ✅ Commit story content changes (commit_file, commit_all)
- ✅ Diff between variations
- ✅ Merge variations (programmatic merge)
- ✅ Browse version history
- ✅ File naming strategy for story children (001-title.md format)
- ✅ File creation and management in Git repositories
- ✅ File reordering and renaming
- ✅ metadata.json handling for story metadata

### Backend - Service Layer
- ✅ Story hierarchy file management (naming, creation, reordering)
- ✅ Metadata synchronization (metadata.json)
- ✅ Git repository initialization and operations

### Design System (Storybook + React + CSS)
- ✅ Phase 1 - Foundations: Colors (Modern Indigo), Typography (Classic Serif), Icons (Lucide)
- ✅ Phase 2 - Atoms: Buttons (Minimal Squared), Inputs (Filled Background)
- ✅ Phase 3 - Organisms: Cards (Elevated Shadow), Navigation (Minimal Top Bar)
- ✅ Phase 4 - Templates: Dashboard (Stats Grid)
- ✅ Comprehensive documentation (`docs/design-system.md`)
- ✅ Storybook setup and component stories
- ✅ WCAG AA accessibility compliance
- ✅ Desktop-optimized for writing applications

### Frontend - Core UI (Implemented)
- ✅ Universe selection/creation screen
- ✅ Stories list view with filtering/sorting
- ✅ Universe elements list (characters, locations, etc.)
- ✅ Element detail view
- ✅ Navigation store with routing
- ✅ Error boundaries around all views
- ✅ Toast notification system for user feedback

### Frontend - Story Editor (Implemented)
- ✅ Rich text editor (Lexical-based) with toolbar
- ✅ Word count tracking (proper Lexical text extraction)
- ✅ Auto-save functionality with debouncing (useAutoSave hook)
- ✅ Chapter/section organization (StoryChildren view)
- ✅ Drag-and-drop reordering (dnd-kit) for chapters
- ✅ Inline title editing
- ✅ Save state indicators (saving, saved, error)

### Frontend - State Management (Implemented)
- ✅ Zustand stores: useNavigationStore, useStoriesStore, useUniverseStore, useElementsStore, useToastStore
- ✅ Optimistic updates with error rollback (drag-and-drop)
- ✅ Child story caching and invalidation
- ✅ Partial update types for cleaner API (StoryUpdate, ElementUpdate, UniverseUpdate)

## Roadmap

### Backend - Service Layer (Remaining)
- [ ] Story variation workflow (create variation from existing story)
- [ ] Element relationship management (bidirectional link creation)
- [ ] Universe-wide search (stories, elements)
- [ ] Export functionality (Universe → various formats)

### Backend - Additional Commands (Remaining)
- [ ] Search commands (universe-wide search across stories and elements)

### Frontend - Core UI (Remaining)
- [x] Universe selection/creation screen
- [ ] Main workspace layout (sidebar + editor + context panel)
- [x] Navigation between stories and elements
- [ ] Universe settings panel

### Frontend - Story Editor (Remaining)
- [x] Rich text editor for writing
- [x] Word count tracking
- [ ] Auto-commit on save with debouncing (task-20: Git auto-commit integration)
- [x] Chapter/section organization (task-21: ✅ COMPLETE)
- [x] Drag-and-drop reordering (task-22: ✅ COMPLETE)
- [ ] Outline view
- [ ] Notes panel

### Frontend - Git Integration & Story Variations
- [ ] Branch management UI (task-23: create, switch, list branches)
- [ ] Diff viewer component (task-24: visual diff between versions/branches)
- [ ] Merge conflict resolution UI (task-25: interactive conflict resolution)
- [ ] History timeline viewer (task-26: browse Git history with visualization)
- [ ] Create variation UI (branch creation flow)
- [ ] Variation tree visualization (branch graph)
- [ ] Switch between variations (branch switching)
- [ ] Compare variations side-by-side (diff view)

### Frontend - Element Management (Remaining)
- [x] Element browser/list view
- [x] Element detail view/editor
- [x] Custom attribute editor (key-value pairs)
- [ ] Relationship visualization (graph view)
- [ ] Element search and filtering
- [x] Element templates (for common types - src/config/element-templates.json)

### Frontend - AI Integration
- [ ] AI chat interface
- [ ] Context injection (selected universe elements)
- [ ] AI-assisted brainstorming
- [ ] AI-assisted refinement/editing
- [ ] Prompt templates for common tasks
- [ ] AI-generated suggestions (plot points, character ideas, etc.)

### Frontend - Voice Dictation
- [ ] Voice input integration
- [ ] Real-time transcription
- [ ] Dictation mode (hands-free writing)
- [ ] Voice command support

### Additional Features (Future)
- [ ] Collaboration features (if multi-user)
- [ ] Cloud sync/backup
- [ ] Mobile companion app
- [ ] Publishing/export to common formats (EPUB, PDF, etc.)
- [ ] Analytics (writing statistics, productivity tracking)
- [ ] Theme/appearance customization
- [ ] Keyboard shortcuts
- [ ] Import from other writing tools

## Technical Decisions Made ✅
- ✅ **UI Design System**: Custom token-first design system (Modern Indigo, Classic Serif, Lucide Icons)
- ✅ **Component Library**: Custom React components with CSS tokens and Storybook documentation
- ✅ **Git Backend**: git2 Rust library for version control
- ✅ **Rich Text Editor**: Lexical (Meta's editor framework)
- ✅ **State Management**: Zustand (lightweight, hooks-based)
- ✅ **Drag-and-Drop**: dnd-kit (modern, accessible)

## Technical Decisions to Make
- [ ] AI provider integration (OpenAI, Anthropic, local models?)
- [ ] Voice dictation API (Web Speech API, Whisper, etc.)
- [ ] Diff visualization library (react-diff-view, Monaco Diff Editor, custom?)
