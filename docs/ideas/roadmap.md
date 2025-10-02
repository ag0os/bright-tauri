# Bright - Product Roadmap & Ideas

## Vision
A creation app for writers and creators to build series of books, scripts, or any type of stories with AI assistance, voice dictation, and comprehensive universe building.

## Implemented ✅

### Domain Models
- Universe: Project container with genre, tone, worldbuilding notes, themes, status
- Story: With variation system and Git-based versioning fields
- Element: Flexible entities (characters, locations, vehicles, custom types) with labeled relationships
- SQLite database with migrations
- TypeScript type generation via ts-rs

## Roadmap

### Backend - Repository Layer
- [ ] Universe CRUD operations
- [ ] Story CRUD operations
- [ ] Element CRUD operations
- [ ] Element relationship queries (bidirectional)
- [ ] Story variation queries (get all variations in a group)

### Backend - Git Integration
- [ ] Initialize Git repo for each story/variation group
- [ ] Create branches for variations
- [ ] Commit story content changes
- [ ] Diff between variations
- [ ] Merge variations (with conflict resolution UI)
- [ ] Browse version history

### Backend - Service Layer
- [ ] Story variation workflow (create variation from existing story)
- [ ] Element relationship management (bidirectional link creation)
- [ ] Universe-wide search (stories, elements)
- [ ] Export functionality (Universe → various formats)

### Backend - Tauri Commands
- [ ] Universe management commands
- [ ] Story management commands
- [ ] Element management commands
- [ ] Git operations commands
- [ ] Search commands

### Frontend - Core UI
- [ ] Universe selection/creation screen
- [ ] Main workspace layout (sidebar + editor + context panel)
- [ ] Navigation between stories and elements
- [ ] Universe settings panel

### Frontend - Story Editor
- [ ] Rich text editor for writing
- [ ] Word count tracking
- [ ] Auto-save functionality
- [ ] Chapter/section organization
- [ ] Outline view
- [ ] Notes panel

### Frontend - Story Variations
- [ ] Create variation UI
- [ ] Variation tree visualization
- [ ] Switch between variations
- [ ] Compare variations side-by-side
- [ ] Merge variations UI

### Frontend - Element Management
- [ ] Element browser/list view
- [ ] Element detail view/editor
- [ ] Custom attribute editor (key-value pairs)
- [ ] Relationship visualization (graph view)
- [ ] Element search and filtering
- [ ] Element templates (for common types)

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

## Technical Decisions to Make
- AI provider integration (OpenAI, Anthropic, local models?)
- Voice dictation API (Web Speech API, Whisper, etc.)
- Rich text editor library (TipTap, ProseMirror, Slate, Lexical?)
- State management approach (Context, Zustand, Redux?)
- UI component library or custom components?
