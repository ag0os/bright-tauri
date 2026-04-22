# UI Navigation Structure

**Last Updated**: 2025-10-31
**Status**: Draft - Design Phase

## Overview

This document defines the navigation structure and screen layouts for Bright, a writing-first application. The core principle is that **writing is the primary activity** and universe building serves as a supporting context system.

## Core Philosophy

1. **Writing First**: Default view shows stories, not universe elements
2. **Minimal Distraction**: Clean, focused screens following the minimalist design philosophy
3. **Separate Concerns**: Dedicated sections for writing and universe building
4. **Easy Context Switching**: Quick access to universe elements while writing

## Main Navigation Structure

### Top Bar (Minimal Top Bar - 48px)

```
┌──────────────────────────────────────────────────────────────┐
│  Bright  [Universe Name ▾]    📝 Stories    🌍 Universe      │
└──────────────────────────────────────────────────────────────┘
```

**Components**:
- **Bright** - App logo/name (left side)
- **Universe Selector** - Dropdown to switch between universes
- **📝 Stories** - Primary navigation tab (default active)
- **🌍 Universe** - Secondary navigation tab for element management

**Behavior**:
- Stories tab is active by default when opening a universe
- Clicking Universe tab switches to element management view
- Universe selector dropdown shows list of all universes + "Create New Universe"

---

## Section 1: Stories (Primary View)

**Purpose**: Manage and write all stories within the selected universe.

### 1.1 Stories List Screen

The default screen when entering a universe.

#### Viewing Modes

Users can toggle between two viewing modes:

**Mode 1: Grouped View** (Default)
- Shows only top-level stories (containers and standalone stories)
- Children (chapters, scenes) are hidden until parent is clicked
- **Containers** (Novel, Screenplay, Collection, Series):
  - Displayed as cards with child count indicator
  - Click to expand/navigate to Chapter Manager
- **Standalone** (ShortStory without parent, standalone Episode, Poem):
  - Displayed as regular story cards
  - Click to open Story Editor directly

**Mode 2: Flat View** (Alternative)
- Shows all stories side-by-side, including children
- No grouping or hierarchy
- All stories at same visual level
- Useful for seeing everything at once or bulk operations

#### Layout Structure (Grouped View - Default)

```
┌────────────────────────────────────────────────────────────┐
│  All Stories                            [+ New Story]      │
├────────────────────────────────────────────────────────────┤
│  [Search...]  [Filter ▾]  [Sort ▾]  [View: 📚Grouped | 📄]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 📖 Novel    │  │ 🎬 Screenplay│  │ 📝 Story    │        │
│  │ Space War   │  │ Time Travel  │  │ Lost Key    │        │
│  │ 15 chapters │  │ 8 scenes     │  │ Standalone  │        │
│  │ 45,000 wds  │  │ 12,000 wds   │  │ 3,200 wds   │        │
│  │ In Progress │  │ Draft        │  │ Completed   │        │
│  │ ⭐          │  │              │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  (More story cards...)                                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Layout Structure (Flat View - Alternative)

```
┌────────────────────────────────────────────────────────────┐
│  All Stories                            [+ New Story]      │
├────────────────────────────────────────────────────────────┤
│  [Search...]  [Filter ▾]  [Sort ▾]  [View: 📚 | 📄Flat]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 📖 Novel    │  │   Chapter 1  │  │   Chapter 2  │        │
│  │ Space War   │  │   Awakening  │  │   Discovery  │        │
│  │ 15 chapters │  │   2,500 wds  │  │   3,100 wds  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Chapter 3  │  │ 📝 Story    │  │ 🎬 Screenplay│        │
│  │   Conflict   │  │ Lost Key    │  │ Time Travel  │        │
│  │   2,800 wds  │  │ 3,200 wds   │  │ 12,000 wds   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Card Information Display

**Container Card** (Novel, Screenplay, Collection):
- Icon + Story type
- Title
- Child count (e.g., "15 chapters")
- Total word count
- Status badge (Draft, In Progress, Completed, Published)
- Favorite indicator (⭐)
- Tags (if any)
- Last edited timestamp

**Standalone Card** (ShortStory, Episode, Poem):
- Icon + Story type
- Title
- Word count
- Status badge
- Favorite indicator
- Tags
- Last edited timestamp

**Child Card** (Chapter, Scene) - Only in Flat View:
- Indentation or visual hierarchy indicator
- Icon + Type
- Title
- Word count
- Status badge (optional)

#### Toolbar Actions

**Primary**:
- `[+ New Story]` - Create new story (opens type selection modal/screen)

**Toolbar**:
- `[Search...]` - Live search across story titles, descriptions
- `[Filter ▾]` - Dropdown: All Types, Novel, Screenplay, Chapter, etc. + Status filters
- `[Sort ▾]` - Dropdown: Last Edited, Title A-Z, Word Count, Created Date
- `[View Toggle]` - Switch between Grouped (📚) and Flat (📄) views

#### Card Actions

**Container Card Actions**:
- **Click** → Navigate to Chapter Manager screen
- **Hover Actions**:
  - `[Edit]` → Open Story Editor (edit the container's content/notes)
  - `[Manage Chapters]` → Open Chapter Manager
  - `[Delete]` → Confirmation dialog
  - `[⭐]` → Toggle favorite

**Standalone Card Actions**:
- **Click** → Navigate to Story Editor
- **Hover Actions**:
  - `[Edit]` → Open Story Editor
  - `[Delete]` → Confirmation dialog
  - `[⭐]` → Toggle favorite

### 1.2 Chapter Manager Screen

Accessed by clicking a container story (Novel, Screenplay, Collection).

**Purpose**: Organize and manage child stories (chapters, scenes) within a container.

#### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Stories    Space War (Novel)    [+ Add Chapter] │
├────────────────────────────────────────────────────────────┤
│  15 Chapters  •  45,000 words  •  In Progress              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Awakening                           2,500 words │   │
│  │  Draft  •  Last edited 2 hours ago      [Edit] [⋮] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. Discovery                           3,100 words │   │
│  │  In Progress  •  Last edited 1 day ago  [Edit] [⋮] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. Conflict                            2,800 words │   │
│  │  Draft  •  Last edited 3 days ago       [Edit] [⋮] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (More chapters...)                                        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Features

- **Ordered List**: Chapters displayed in order (1, 2, 3...)
- **Drag-and-Drop**: Reorder chapters by dragging (uses `reorder_story_children` backend command)
- **Chapter Info**: Title, word count, status, last edit time
- **Quick Edit**: Click `[Edit]` to open chapter in Story Editor
- **Chapter Menu** (`[⋮]`): Delete, Duplicate, Move, Change Status

#### Actions

- `[+ Add Chapter]` - Create new chapter at end of list
- `[← Back to Stories]` - Return to Stories List screen
- `[Edit Container]` - Edit the novel's own content/description/notes (in top bar menu)

### 1.3 Story Editor Screen

The primary writing interface - full-screen, distraction-free.

**Purpose**: Write and edit story content.

#### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  ← Stories  Chapter 1: Awakening  Auto-saved  [⚙️] [👁️]   │  ← Minimal chrome
└────────────────────────────────────────────────────────────┘

┌──────────────┬───────────────────────────────┬────────────┐
│              │                               │            │
│  Outline     │   [Rich Text Editor Area]     │  Universe  │
│  (collapsible│                               │  (collapsi-│
│  sidebar)    │   Main writing space          │  ble panel)│
│              │   Focused, distraction-free   │            │
│  - Chapter 1 │                               │  Linked:   │
│  - Chapter 2 │                               │  • Han     │
│  - Chapter 3 │   The starship descended...   │  • Falcon  │
│              │                               │  • Tatooine│
│              │                               │            │
│  [Notes]     │                               │  [+ Link]  │
│  (tab)       │                               │            │
│              │                               │            │
└──────────────┴───────────────────────────────┴────────────┘

Status Bar: 2,543 words  •  Target: 3,000  •  85% complete
```

#### Components

**Top Bar** (Minimal):
- `← Stories` - Back to Stories List
- Story title (editable inline)
- Auto-save indicator ("Auto-saved 2 minutes ago")
- `[⚙️]` - Settings menu (word count goals, export, etc.)
- `[👁️]` - Preview mode toggle

**Left Sidebar** (Collapsible):
- **Outline Tab**:
  - Chapter list for quick navigation
  - Outline/structure notes
  - Collapsible sections
- **Notes Tab**:
  - Research notes
  - Character development notes
  - Plot ideas

**Main Editor Area**:
- Rich text editor (TBD: TipTap, ProseMirror, Slate, Lexical)
- Distraction-free writing space
- Formatting toolbar (appears on selection)
- Auto-save with debouncing

**Right Panel** (Collapsible):
- **Universe Elements**:
  - Shows elements linked to this story
  - Quick view of character/location details
  - `[+ Link Element]` button to add more
  - Click element to see full details (modal or slide-out)

**Bottom Status Bar**:
- Current word count
- Target word count progress
- Percentage complete

#### Features

- **Auto-save**: Debounced saves (2-3 seconds after typing stops)
- **Keyboard Shortcuts**: Hide sidebars, focus mode, etc.
- **Collapsible UI**: Both sidebars can collapse for full-screen writing
- **Version Control**: Git auto-commits in background (configurable frequency)

### 1.4 Version History Screen

**Purpose**: Browse Git history, view changes, create/manage variations.

*[To be detailed in future iteration - see Roadmap tasks 23-26]*

Key features:
- Commit timeline
- Diff viewer
- Branch management (variations)
- Restore previous versions
- Compare variations side-by-side

---

## Section 2: Universe (Supporting View)

**Purpose**: Manage universe elements (characters, locations, vehicles, etc.) that provide context for stories.

### 2.1 Universe Elements List Screen

Accessed by clicking the "🌍 Universe" tab in the top bar.

#### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  Universe Elements                      [+ New Element]    │
├────────────────────────────────────────────────────────────┤
│  [Search...]  [Filter ▾] [Sort ▾] [View: Grid/List]       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 👤          │  │ 📍          │  │ 🚗          │        │
│  │ Han Solo    │  │ Tatooine    │  │ Millennium  │        │
│  │ Character   │  │ Location    │  │ Vehicle     │        │
│  │ ⭐ Pilot     │  │ Desert      │  │ ⭐ Fast      │        │
│  │ 3 links     │  │ 2 links     │  │ 1 link      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  (Grid of element cards...)                                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Features

Similar to Stories List, but for elements:

**Viewing Modes**:
- **Grid View** (Default) - Card-based layout
- **List View** (Alternative) - Compact table view

**Card Display**:
- Icon (template icon or custom emoji)
- Name
- Element type (Character, Location, Vehicle, etc.)
- Tags
- Relationship count ("3 links")
- Favorite indicator

**Filters**:
- By Type: All, Character, Location, Vehicle, Item, Organization, Creature, Event, Concept, Custom
- By Tag: User-defined tags
- Favorites Only

**Sort Options**:
- Name A-Z
- Recently Updated
- Type
- Most Connected (by relationship count)

**Actions**:
- `[+ New Element]` - Create element with template selection
- Click card → Navigate to Element Detail screen
- Hover actions: Edit, Delete, Toggle Favorite

### 2.2 Element Detail Screen

Full view of a single universe element.

#### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  ← Universe    Han Solo (Character)           [Edit] [⋮]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  👤  Han Solo                                              │
│  Character  •  ⭐ Favorite                                  │
│  Tags: pilot, main-character, rebellion                    │
│                                                             │
│  ─────────────────────────────────────────────────────────│
│                                                             │
│  Description                                               │
│  Smuggler and pilot of the Millennium Falcon. Reluctant   │
│  hero who becomes a key leader in the Rebel Alliance.      │
│                                                             │
│  ─────────────────────────────────────────────────────────│
│                                                             │
│  Attributes                                                │
│  Age:              32                                      │
│  Occupation:       Smuggler, Pilot                         │
│  Personality:      Roguish, brave, cynical                 │
│  Affiliation:      Rebel Alliance                          │
│                                                             │
│  ─────────────────────────────────────────────────────────│
│                                                             │
│  Relationships                                             │
│  → owns: Millennium Falcon (Vehicle)                       │
│  → best friend: Chewbacca (Character)                      │
│  ← captain of: Millennium Falcon (Vehicle)                 │
│                                                             │
│  ─────────────────────────────────────────────────────────│
│                                                             │
│  Appears In                                                │
│  • Space War (Novel) - Chapter 1, 3, 5, 7                  │
│  • Lost Key (Short Story)                                  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

#### Features

- **Full Element Information**: All attributes, relationships, details
- **Edit Mode**: Click `[Edit]` to modify any field
- **Relationship Management**: Add/remove relationships to other elements
- **Story References**: See which stories use this element
- **Quick Navigation**: Click related element to view its details
- **Actions Menu** (`[⋮]`): Duplicate, Delete, Export, Change Type

### 2.3 Element Creation Screen

Modal or full-screen form for creating new elements.

#### Flow

1. **Select Template**: Choose from 8 template types (Character, Location, Vehicle, Item, Organization, Creature, Event, Concept) or "Custom"
2. **Fill Core Fields**:
   - Name (required)
   - Description (required)
   - Details (optional long-form text)
3. **Fill Template Attributes** (optional):
   - Shows suggested attributes based on template
   - User can skip, fill some, or add custom attributes
4. **Add Relationships** (optional)
5. **Set Tags, Icon, Color** (optional)
6. **Save** → Returns to Element Detail screen

---

## Navigation Flows

### Primary User Journeys

**Journey 1: Start Writing**
```
Open App
→ Select Universe
→ Stories List (Default)
→ Click "New Story"
→ Story Editor
```

**Journey 2: Continue Writing**
```
Open App
→ Select Universe
→ Stories List (shows recent stories)
→ Click story card
→ Story Editor
```

**Journey 3: Organize Novel**
```
Stories List
→ Click Novel card
→ Chapter Manager
→ Add/reorder chapters
→ Click "Edit" on chapter
→ Story Editor
```

**Journey 4: Reference Universe While Writing**
```
Story Editor
→ Right panel shows linked elements
→ Click element to view details (modal/slide-out)
→ Close modal, continue writing
```

**Journey 5: Add Universe Element**
```
Story Editor
→ Right panel
→ Click "[+ Link Element]"
→ Search existing or "Create New"
→ (If create) Element Creation Modal
→ Save
→ Element auto-linked to story
→ Back to Story Editor
```

**Journey 6: Browse Universe**
```
Stories List
→ Click "Universe" tab
→ Universe Elements List
→ Filter by type / search
→ Click element card
→ Element Detail
```

**Journey 7: Cross-Reference**
```
Universe Element Detail
→ "Appears In" section
→ Click story name
→ Story Editor (jumps to that story)
```

---

## Implementation Phases

### Phase 1: Foundation (Implement First)
1. Top Bar navigation with universe selector
2. Stories List screen (Grouped View only)
3. Basic Story Editor (no sidebars, just editor + auto-save)
4. Universe Elements List screen (Grid View only)
5. Basic Element Detail screen

### Phase 2: Story Organization
6. Chapter Manager screen
7. Drag-and-drop reordering
8. Story creation flow

### Phase 3: Enhanced Editing
9. Story Editor sidebars (Outline, Notes, Universe panel)
10. Collapsible UI
11. Element linking from editor

### Phase 4: Enhanced Universe
12. Element creation flow with templates
13. Relationship management
14. Element Detail edit mode

### Phase 5: Alternative Views
15. Flat View for Stories List
16. List View for Universe Elements
17. Filters and sorting refinements

### Phase 6: Version Control
18. Version History screen
19. Diff viewer
20. Branch/variation management

---

## Design System Integration

All screens use components from the design system (implementation should create new reusable components if needed):

- **Top Bar**: MinimalTopBar component (48px, distraction-free)
- **Cards**: Elevated Shadow cards (shadow-based depth, 8px radius)
- **Buttons**: Minimal Squared buttons (4px radius, compact)
- **Inputs**: Filled Background inputs (Material Design inspired)
- **Icons**: Phosphor icons (regular weight by default)
- **Colors**: Ink & Paper palette (warm ink surfaces with marigold accents)
- **Typography**: Newsreader + Geist (editorial headings with clean UI body text)

---

## Open Questions / Future Decisions

1. **Rich Text Editor**: Which library? (TipTap, ProseMirror, Slate, Lexical) > Lexical (React)
2. **State Management**: Context, Zustand, Redux, or other? > We need to analize this further (Redux or Zustand?)
3. **Sidebar Behavior**: Should sidebars remember collapsed state per user preference? > yes
4. **Auto-save Frequency**: How often to commit to Git automatically? > could be use events and callbacks for this maybe?
5. **Element Quick View**: Modal vs slide-out panel for viewing element details from editor? > modal
6. **Search**: Global search across stories AND elements, or separate per section? > global with filtering
7. **Keyboard Shortcuts**: Full list of shortcuts to implement > TBD
8. **Mobile/Tablet**: Should we support responsive layouts, or desktop-only? > basic responsive, optimzing for tablet+ sizes

---

## Rationale & Principles

### Why Writing-First Navigation?

1. **User Intent**: Writers open the app to write, not to manage characters
2. **Frequency**: Writing happens 90% of the time, universe management 10%
3. **Flow**: Keeps writers in flow state without distraction
4. **Context**: Universe elements are available when needed, not blocking the view

### Why Grouped View as Default?

1. **Mental Model**: Writers think in terms of "novels" and "chapters", not flat lists
2. **Reduces Clutter**: Hides children until needed
3. **Hierarchy**: Matches the actual parent-child structure in the domain model
4. **Scalability**: Works better with large projects (100+ chapters)

### Why Separate Sections Instead of Unified Dashboard?

1. **Focus**: Each section has a single, clear purpose
2. **Minimalism**: Avoids cramming multiple features into one screen
3. **Performance**: Loads only what's needed
4. **Mental Model**: Clear separation between "writing" and "universe building"

---

**End of Document**
