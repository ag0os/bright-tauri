# Universe Selection UI Design

## Overview

The Universe Selection interface is the entry point to the application. It allows users to create their first universe or select from existing universes to work in. This view establishes the visual tone for the entire application with a distinctive purple gradient background and elevated card design.

## Visual Design

### Background
- **Purple gradient background** - Creates a distinctive, creative atmosphere
- Soft, smooth gradient transition
- Should feel immersive but not overwhelming
- Gradient direction: TBD (top-to-bottom, radial, or diagonal)

### Universe Cards
- **Rounded square objects** with soft shadows
- Each card represents one universe
- Contains:
  - Universe name prominently displayed
  - Background element (color, pattern, or image)
  - Visual distinction between cards
- **Elevation**: Cards appear to float above the purple background via soft shadow
- Hover state: Slight lift effect (consistent with design system's Elevated Shadow pattern)
- Active/selected state: Visual feedback for keyboard navigation

### Layout
- Grid or flexbox layout of universe cards
- Responsive spacing between cards
- "Create New Universe" card always visible when universes exist
- Centered layout with appropriate padding/margins

## User Flows

### Flow 1: No Universes (First-time User)
```
1. User opens app for first time
2. Purple gradient background fills screen
3. Central prompt appears: "Create your first universe"
4. Single action button or card to create first universe
5. On click/Enter → Opens universe creation form
```

### Flow 2: Has Universes (Returning User)
```
1. User opens app
2. Purple gradient background fills screen
3. Grid of universe cards displayed
4. "Create New Universe" card visible among existing universes
5. User can:
   - Click on universe card → Select and enter that universe
   - Click "Create New" card → Opens universe creation form
   - Use keyboard navigation (arrows) to select
   - Press Enter to confirm selection
```

## Keyboard Navigation Requirements

### Navigation Keys
- **Arrow Keys** (↑ ↓ ← →): Navigate between universe cards
- **Enter**: Select focused universe or create new
- **Tab**: Alternative navigation (optional)
- **Escape**: Cancel creation dialog (if modal)

### Visual Feedback
- Focused card should have clear visual indicator (border, glow, or highlight)
- Focus state should be distinct from hover state
- Focus indicator should work with purple background

### Accessibility
- Keyboard navigation should be intuitive and discoverable
- Screen reader support for card contents
- Focus trap in creation modal if applicable

## Relationship to Design System

### Colors
- Background: Custom purple gradient (outside existing design system)
- Cards: Use design system elevation shadows (shadow-sm, shadow-base, shadow-lg)
- Text: Ensure WCAG AA contrast against purple background
- Consider adding purple tokens to design system if needed

### Components
- Cards: Leverage existing **Elevated Shadow** card pattern
- Buttons: Use **Minimal Squared** button style for actions
- Inputs: Use **Filled Background** inputs for universe creation form
- Typography: **Classic Serif** for universe names (Playfair Display)

### Spacing & Sizing
- Card border radius: Consider existing 8px from card pattern or adjust for "rounded square" feel (12px-16px?)
- Grid gap: Use design system spacing tokens
- Card size: Large enough to be prominent, small enough for grid layout (e.g., 240x180px?)

## Technical Considerations

### State Management
- Track selected universe (for keyboard navigation)
- Track focus state for accessibility
- Handle empty state vs populated state

### Data Fetching
- Query universes on mount using Tauri command: `list_universes()`
- Real-time updates if universes are created/deleted elsewhere?

### Navigation
- Selecting a universe should navigate to main app view (universe workspace)
- URL/route structure: `/` (selection) → `/universe/:id` (workspace)

### Performance
- Lazy load universe backgrounds if using images
- Optimize for many universes (virtual scrolling if >50 universes?)

## Universe Creation Flow

### Trigger Points
- "Create your first universe" (empty state)
- "Create New Universe" card (populated state)
- Keyboard shortcut? (e.g., Ctrl+N)

### Creation Form
- **Minimal form fields** initially:
  - Universe name (required)
  - Optional: description, color/theme picker, icon
- Consider modal vs inline form
- Validation: Unique universe name, non-empty
- Success: Automatically select newly created universe

### Creation UI Options
1. **Modal Dialog**: Overlay on purple background, form in center
2. **Inline Card**: Expand "Create New" card to show form
3. **Dedicated Screen**: Navigate to creation screen, return to selection after

Recommended: **Modal Dialog** for quick creation without losing context

## Open Questions

### Visual Details
1. Gradient colors: Which shades of purple? (Light-to-dark, purple-to-pink, purple-to-blue?)
2. Card background: Solid color, subtle pattern, user-customizable, or random generated?
3. Shadow intensity: How prominent should the elevation be?
4. Animation: Fade in on load? Transition between cards?

### Interaction Details
1. Double-click to open universe or single click?
2. Right-click context menu for universe options (rename, delete, duplicate)?
3. Drag to reorder universes?
4. Search/filter for many universes?

### Data & Functionality
1. Universe metadata to display: Last modified date? Story count? Element count?
2. Universe icons/avatars?
3. Color themes per universe?
4. Recently used universe highlighted/pinned at top?

## Implementation Phases

### Phase 1: Basic Selection (MVP)
- Purple gradient background
- Simple card grid layout
- List universes from backend
- Click to select universe
- Basic "Create New" functionality

### Phase 2: Keyboard Navigation
- Arrow key navigation
- Focus states
- Enter to confirm
- Accessibility improvements

### Phase 3: Enhanced Creation
- Polished creation modal
- Form validation
- Better visual feedback

### Phase 4: Polish & Features
- Animations and transitions
- Universe card backgrounds
- Context menu options
- Search/filter (if needed)

## Related Files & References

### Backend (Existing)
- `src-tauri/src/models/universe.rs`: Universe model
- `src-tauri/src/repositories/universe_repository.rs`: CRUD operations
- Tauri commands: `create_universe`, `list_universes`, `get_universe`, `update_universe`, `delete_universe`

### Frontend (To Be Created)
- `src/views/UniverseSelection.tsx`: Main component
- `src/components/UniverseCard.tsx`: Individual universe card
- `src/components/CreateUniverseModal.tsx`: Creation dialog
- `src/styles/universe-selection.css`: Custom purple gradient styles

### Design System
- `src/design-system/organisms/card/Card.tsx`: Base card component
- `src/design-system/tokens/colors/modern-indigo.css`: Existing color tokens
- May need: `src/design-system/tokens/colors/purple-gradient.css`: New purple tokens

## Success Criteria

A successful Universe Selection UI should:
- ✅ Make universe selection obvious and delightful
- ✅ Support keyboard-only navigation completely
- ✅ Handle empty state gracefully with clear call-to-action
- ✅ Scale well from 1 to many universes
- ✅ Establish the visual identity of the app (purple, elevated, creative)
- ✅ Be fast and responsive (<100ms to render)
- ✅ Meet WCAG AA accessibility standards
