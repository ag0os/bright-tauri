# Implementation Plan - UI Navigation

**Last Updated**: 2025-10-31
**Status**: Ready for Implementation
**Related Doc**: [UI Navigation Structure](./ui-navigation.md)

## Overview

This document outlines the implementation plan for Phase 1 of the UI navigation structure. Phase 1 focuses on building the foundational screens and navigation that enable basic writing and universe management functionality.

## Goals

Phase 1 delivers:
1. Top-level navigation between Stories and Universe sections
2. Stories List screen with grouped view
3. Basic Story Editor with auto-save
4. Universe Elements List screen with grid view
5. Basic Element Detail screen

## Technology Stack

- **Frontend Framework**: React 19 + TypeScript + Vite
- **State Management**: Zustand (with persist middleware)
- **Rich Text Editor**: Lexical
- **Icons**: Lucide React
- **Styling**: CSS custom properties (design system tokens)
- **Backend**: Tauri v2 (already implemented)
- **Design System**: Custom token-first system (already implemented)

---

## Phase 1: Foundation

### Task Organization

Tasks are grouped by functional area and ordered by dependency. Each task should be implemented in sequence within its group, but some groups can be worked on in parallel.

---

## Group 1: Dependencies & Project Setup

**Must be completed first before any other work.**

### Task 1.1: Install Core Dependencies
**Goal**: Add required npm packages for Phase 1.

**Packages to Install**:
- `zustand` - State management
- `lexical` - Rich text editor core
- `@lexical/react` - Lexical React bindings
- `@lexical/clipboard`, `@lexical/selection`, `@lexical/utils` - Lexical utilities
- `lucide-react` - Icon library (if not already installed)
- `lodash` or `lodash.debounce` - Debouncing utility for auto-save

**Success Criteria**:
- All packages installed in package.json
- No dependency conflicts
- `npm run dev` still works

---

### Task 1.2: Project Folder Structure Setup
**Goal**: Create organized folder structure for UI components and state management.

**Folders to Create**:
```
src/
├── stores/              # Zustand stores
├── components/
│   ├── layout/         # Top bar, navigation, page layouts
│   ├── stories/        # Story-related components
│   ├── universe/       # Universe element components
│   └── editor/         # Rich text editor components
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
└── pages/              # Top-level page components
```

**Success Criteria**:
- Folder structure matches plan
- Add index.ts barrel exports where appropriate
- Update tsconfig.json paths if needed

---

### Task 1.3: Generate TypeScript Types from Rust
**Goal**: Ensure frontend has latest TypeScript types from backend models.

**Steps**:
- Run `cd src-tauri && cargo test --lib` to generate types
- Verify types exist in `src/types/` for: Universe, Story, Element, and related types
- Create a types index file if needed

**Success Criteria**:
- TypeScript types available for all domain models
- No type errors when importing from `@/types`

---

## Group 2: State Management Foundation

**Depends on**: Group 1 (Dependencies)

### Task 2.1: Create Universe Store
**Goal**: Zustand store for managing current universe state.

**Store Location**: `src/stores/useUniverseStore.ts`

**State to Manage**:
- Current selected universe
- List of all universes
- Loading states
- Actions: setCurrentUniverse, loadUniverses, createUniverse

**Features**:
- Use `persist` middleware to remember selected universe across sessions
- Integrate with Tauri commands (invoke 'list_universes', 'get_universe')

**Success Criteria**:
- Store can be imported and used in components
- Persistence works (reload app, universe selection persists)
- Tauri commands integrate correctly

---

### Task 2.2: Create Stories Store
**Goal**: Zustand store for managing stories state.

**Store Location**: `src/stores/useStoriesStore.ts`

**State to Manage**:
- List of stories in current universe
- Currently selected story
- Loading states
- Filter/sort preferences
- Actions: loadStories, selectStory, createStory, updateStory, deleteStory

**Features**:
- Filter stories by type, status, search query
- Sort stories by various criteria
- Integrate with Tauri commands (invoke 'list_stories_by_universe', 'get_story', etc.)

**Success Criteria**:
- Store manages story list correctly
- Filters and sorting work
- CRUD operations integrate with backend

---

### Task 2.3: Create Elements Store
**Goal**: Zustand store for managing universe elements state.

**Store Location**: `src/stores/useElementsStore.ts`

**State to Manage**:
- List of elements in current universe
- Currently selected element
- Loading states
- Filter/sort preferences
- Actions: loadElements, selectElement, createElement, updateElement, deleteElement

**Features**:
- Filter by element type
- Search by name/description
- Integrate with Tauri commands (invoke 'list_elements_by_universe', 'get_element', etc.)

**Success Criteria**:
- Store manages element list correctly
- Filters work (by type, search)
- CRUD operations integrate with backend

---

## Group 3: Core Layout Components

**Depends on**: Group 1 (Dependencies), Task 2.1 (Universe Store)

### Task 3.1: Create Top Bar Component
**Goal**: Build the main navigation top bar with universe selector.

**Component Location**: `src/components/layout/TopBar.tsx`

**Features**:
- Universe selector dropdown (uses useUniverseStore)
- Navigation tabs: Stories (active by default), Universe
- Minimal Top Bar design (48px height)
- Active tab indication
- Responsive behavior

**Integration**:
- Reads current universe from useUniverseStore
- Shows list of universes in dropdown
- Allows switching universes
- Emits navigation events or uses routing

**Success Criteria**:
- Component renders with correct design system styling
- Universe dropdown lists all universes
- Switching universes updates store
- Tab navigation works (Stories/Universe)
- Matches design from ui-navigation.md

---

### Task 3.2: Create Page Layout Component
**Goal**: Reusable layout wrapper for all screens.

**Component Location**: `src/components/layout/PageLayout.tsx`

**Features**:
- Wraps page content
- Includes TopBar
- Handles content area
- Responsive padding/spacing

**Success Criteria**:
- All pages can use this layout
- Consistent spacing and structure
- Design system tokens used

---

### Task 3.3: Create App Router/Navigation Structure
**Goal**: Set up routing or navigation system to switch between Stories and Universe sections.

**Approach Options**:
- React Router (if using client-side routing)
- Simple state-based navigation (simpler, might be sufficient)

**Navigation States**:
- Stories section (default)
- Universe section
- Story Editor (when editing a story)
- Element Detail (when viewing an element)

**Success Criteria**:
- Can navigate between Stories List and Universe List
- URL or state reflects current screen
- Back navigation works
- Navigation is clean and performant

---

## Group 4: Stories Section - List View

**Depends on**: Group 3 (Layout), Task 2.2 (Stories Store)

### Task 4.1: Create Story Card Component
**Goal**: Reusable card component for displaying a story in the list.

**Component Location**: `src/components/stories/StoryCard.tsx`

**Features**:
- Displays story icon, title, type
- Shows word count, status badge
- Favorite indicator
- Child count for containers (e.g., "15 chapters")
- Last edited timestamp
- Hover actions: Edit, Delete, Favorite toggle
- Click handler to navigate to editor or chapter manager

**Design**:
- Uses Elevated Shadow card design from design system
- Responsive card size
- Proper typography and spacing

**Success Criteria**:
- Card displays all required information
- Hover actions appear and work
- Click navigation works
- Styling matches design system

---

### Task 4.2: Create Stories List Page
**Goal**: Main page showing all stories in grouped view.

**Component Location**: `src/pages/StoriesListPage.tsx`

**Features**:
- Toolbar: Search, Filter, Sort, View toggle (grouped only in Phase 1)
- Grid of StoryCard components
- "[+ New Story]" button
- Empty state when no stories
- Loading state while fetching stories

**Data Flow**:
- Reads stories from useStoriesStore
- Filters/sorts based on toolbar selections
- Groups stories (containers at top level, hides children)

**Success Criteria**:
- Page displays stories correctly
- Search filters stories in real-time
- Filter by type/status works
- Sort works (last edited, title, word count)
- Create button triggers story creation
- Clicking story card navigates appropriately (container → chapter manager, standalone → editor)

---

### Task 4.3: Create Story Creation Modal/Flow
**Goal**: UI for creating a new story.

**Component Location**: `src/components/stories/CreateStoryModal.tsx`

**Features**:
- Story type selection (Novel, Screenplay, ShortStory, etc.)
- Title input (required)
- Description input (optional)
- Target word count input (optional)
- Tags input (optional)
- Create button → calls createStory from store
- Cancel button

**Success Criteria**:
- Modal opens from "[+ New Story]" button
- Form validation works (title required)
- Creating story calls backend and updates store
- Modal closes and navigates to editor or list
- Error handling for failed creation

---

## Group 5: Stories Section - Editor

**Depends on**: Group 4 (Stories List), Task 1.1 (Lexical installed)

### Task 5.1: Create Basic Lexical Editor Component
**Goal**: Rich text editor using Lexical framework.

**Component Location**: `src/components/editor/RichTextEditor.tsx`

**Features**:
- Lexical editor instance
- Basic formatting: bold, italic, underline, headings, lists
- Plain text editing (minimal plugins for Phase 1)
- onChange handler to capture content
- Read-only mode support

**Lexical Setup**:
- Initialize LexicalComposer
- Add RichTextPlugin
- Add HistoryPlugin (undo/redo)
- Basic theme styling with design system tokens

**Success Criteria**:
- Editor renders and accepts text input
- Basic formatting works
- Content changes emit to parent component
- Styling matches design system

---

### Task 5.2: Create Auto-Save Hook
**Goal**: Custom React hook for debounced auto-saving.

**Hook Location**: `src/hooks/useAutoSave.ts`

**Features**:
- Accepts: content, save callback, delay (default 2000ms)
- Debounces save calls
- Shows "saving..." and "saved" states
- Cancels pending saves on unmount

**Success Criteria**:
- Hook debounces correctly (doesn't save on every keystroke)
- Save callback is called after delay
- Returns save state for UI indicator
- Works with Lexical editor content changes

---

### Task 5.3: Create Story Editor Page
**Goal**: Full-screen story editing interface.

**Component Location**: `src/pages/StoryEditorPage.tsx`

**Features**:
- Minimal top chrome: back button, story title (editable), auto-save indicator
- RichTextEditor component (main area)
- Auto-save using useAutoSave hook
- Load story content on mount
- Word count display (bottom status bar)
- No sidebars in Phase 1 (added later)

**Data Flow**:
- Reads story from useStoriesStore (by ID from route/nav)
- Loads story content into editor
- Auto-saves changes to backend via updateStory
- Shows word count (calculate from content)

**Success Criteria**:
- Editor loads story content correctly
- Typing updates content
- Auto-save works (saves after 2s of inactivity)
- Auto-save indicator shows status
- Word count updates in real-time
- Back button returns to Stories List

---

## Group 6: Universe Section - List View

**Depends on**: Group 3 (Layout), Task 2.3 (Elements Store)

### Task 6.1: Create Element Card Component
**Goal**: Reusable card component for displaying a universe element.

**Component Location**: `src/components/universe/ElementCard.tsx`

**Features**:
- Display element icon (emoji or Lucide icon)
- Element name and type
- Description preview (first line)
- Tags as badges
- Relationship count ("3 links")
- Favorite indicator
- Hover actions: Edit, Delete, Favorite toggle
- Click handler to navigate to detail screen

**Design**:
- Uses Elevated Shadow card design
- Consistent with StoryCard styling

**Success Criteria**:
- Card displays element information correctly
- Icons render properly
- Hover actions work
- Click navigation works
- Matches design system

---

### Task 6.2: Create Universe Elements List Page
**Goal**: Main page showing all universe elements in grid view.

**Component Location**: `src/pages/UniverseListPage.tsx`

**Features**:
- Toolbar: Search, Filter (by type), Sort, View toggle (grid only in Phase 1)
- "[+ New Element]" button
- Grid of ElementCard components
- Empty state when no elements
- Loading state

**Data Flow**:
- Reads elements from useElementsStore
- Filters by type and search query
- Sorts elements

**Success Criteria**:
- Page displays elements correctly
- Search works
- Filter by type works (Character, Location, Vehicle, etc.)
- Sort works (name, recently updated, type)
- Create button triggers element creation
- Clicking element card navigates to detail screen

---

### Task 6.3: Create Element Creation Modal/Flow
**Goal**: UI for creating a new universe element with template selection.

**Component Location**: `src/components/universe/CreateElementModal.tsx`

**Features**:
- Template selection screen (8 templates: Character, Location, Vehicle, Item, Organization, Creature, Event, Concept)
- Core fields: Name (required), Description (required), Details (optional)
- Template attributes loaded from `src/config/element-templates.json`
- Show suggested attributes based on template (optional to fill)
- Tags, icon, color selection (optional)
- Create button → calls createElement from store

**Success Criteria**:
- Modal shows template options with icons
- Selecting template loads suggested attributes
- Form validation works (name and description required)
- Can skip optional attributes
- Creating element calls backend and updates store
- Modal closes and navigates to element detail or list

---

## Group 7: Universe Section - Detail View

**Depends on**: Task 6.1, Task 6.2 (Elements List)

### Task 7.1: Create Element Detail Page
**Goal**: Full-screen view of a single universe element.

**Component Location**: `src/pages/ElementDetailPage.tsx`

**Features**:
- Back button to Universe List
- Display element name, type, icon, description
- Display all attributes (template + custom)
- Display relationships (with labels)
- Display tags
- "Appears In" section showing linked stories (read-only in Phase 1)
- Edit button (navigates to edit mode or opens modal)
- Delete button (with confirmation)

**Data Flow**:
- Reads element from useElementsStore (by ID from route/nav)
- Displays all element properties
- Edit/Delete actions call store methods

**Success Criteria**:
- Page displays element information correctly
- All attributes and relationships shown
- Back button works
- Edit button works (even if edit is placeholder)
- Delete button works with confirmation
- Clean, readable layout

---

## Group 8: Integration & Polish

**Depends on**: All previous groups

### Task 8.1: Connect Navigation Between Stories and Universe
**Goal**: Ensure seamless navigation between all screens.

**Integration Points**:
- Top Bar tabs switch between Stories List and Universe List
- Story Editor back button returns to Stories List
- Element Detail back button returns to Universe List
- Story creation flow returns to appropriate screen
- Element creation flow returns to appropriate screen

**Success Criteria**:
- All navigation paths work correctly
- No broken links or navigation dead-ends
- Navigation state is consistent
- Back buttons go to correct previous screen

---

### Task 8.2: Loading States & Error Handling
**Goal**: Add loading indicators and error messages throughout the app.

**Features**:
- Loading spinners while fetching data from Tauri backend
- Error messages when operations fail (toast notifications or inline messages)
- Empty states with helpful messages ("No stories yet. Create your first story!")
- Network error handling
- Validation error messages

**Success Criteria**:
- All async operations show loading state
- Errors are displayed to user clearly
- Empty states are helpful and actionable
- App doesn't crash on errors

---

### Task 8.3: Responsive Layout Adjustments
**Goal**: Ensure basic responsive behavior for tablet and larger screens.

**Adjustments**:
- Cards resize appropriately on different screen sizes
- Grid layouts adjust column count based on viewport width
- Top bar remains functional on smaller screens
- Editor remains usable on tablets (no mobile phones, as per decision)

**Success Criteria**:
- App works well on desktop (1920x1080+)
- App works well on tablet landscape (1024x768+)
- No horizontal scrolling on standard screens
- Text remains readable at all supported sizes

---

### Task 8.4: Design System Integration Verification
**Goal**: Ensure all components correctly use design system tokens.

**Verification**:
- All components use CSS custom properties from design system
- Colors, typography, spacing consistent throughout
- Button styles match Minimal Squared design
- Input styles match Filled Background design
- Cards use Elevated Shadow design
- Icons are from Lucide React

**Success Criteria**:
- Visual consistency across all screens
- No hardcoded colors or spacing values
- Design matches ui-navigation.md mockups
- Accessibility (color contrast) maintained

---

## Testing & Validation

### Functional Testing
- Universe selection and switching works
- Story CRUD operations work (create, read, update, delete)
- Element CRUD operations work
- Auto-save in editor works
- Search and filtering work
- Navigation between all screens works

### Data Integrity Testing
- Stories persist correctly in database
- Elements persist correctly
- Auto-save doesn't lose data
- Concurrent edits don't cause issues (if applicable)

### Performance Testing
- App loads within acceptable time (<2s)
- Story list with 100+ stories remains responsive
- Editor typing has no lag
- Auto-save doesn't block typing

### Design Verification
- All screens match ui-navigation.md design
- Design system components used correctly
- Responsive layouts work on tablet and desktop

---

## Success Criteria for Phase 1 Completion

Phase 1 is complete when:

1. ✅ User can select a universe and see all stories in grouped view
2. ✅ User can create a new story and it appears in the list
3. ✅ User can click a story and open the editor
4. ✅ User can type in the editor with auto-save working
5. ✅ User can navigate to Universe section and see all elements
6. ✅ User can create a new element with template selection
7. ✅ User can click an element and see full details
8. ✅ User can navigate back and forth between Stories and Universe sections
9. ✅ All data persists correctly (survives app restart)
10. ✅ Loading states, error handling, and empty states are present
11. ✅ Basic responsive behavior works on desktop and tablet
12. ✅ Design system is consistently applied

---

## Implementation Notes

### Order of Implementation
1. **Start with Group 1** (dependencies and setup) - must be completed first
2. **Then Group 2** (state management) - foundation for all features
3. **Groups 3-7 can be parallelized** if multiple developers, otherwise do in order
4. **Finish with Group 8** (integration and polish)

### Testing Strategy
- Test each component as it's built (unit tests optional but recommended)
- Test integration between components after each group
- Do full end-to-end testing after Group 8

### Code Organization
- Keep components small and focused (single responsibility)
- Use barrel exports (index.ts) for cleaner imports
- Follow existing code style in the project
- Document complex logic with comments

### Design System Usage
- Always import design tokens instead of hardcoding values
- Reuse existing design system components where possible
- Create new reusable components when needed (add to design-system folder)

### State Management Best Practices
- Keep Zustand stores focused (separate stores for Universe, Stories, Elements)
- Don't duplicate data between stores
- Use selectors to prevent unnecessary re-renders
- Handle loading and error states in stores

### Tauri Integration
- All backend calls use `invoke()` from `@tauri-apps/api/core`
- Handle errors from backend gracefully
- Show user-friendly error messages
- Consider connection failures and offline scenarios

---

## Future Phases Preview

**Phase 2**: Story Organization
- Chapter Manager screen
- Drag-and-drop reordering
- Parent-child story navigation

**Phase 3**: Enhanced Editing
- Editor sidebars (Outline, Notes, Universe panel)
- Collapsible UI
- Element linking from editor

**Phase 4**: Enhanced Universe
- Relationship management
- Relationship graph visualization
- Advanced element editing

**Phase 5**: Alternative Views
- Flat view for Stories List
- List view for Universe Elements
- Advanced filters and sorting

**Phase 6**: Version Control
- Git history visualization
- Diff viewer
- Branch/variation management

---

**End of Implementation Plan**
