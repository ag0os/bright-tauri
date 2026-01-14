# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application with a React + TypeScript frontend built with Vite. Tauri combines a Rust backend with a web frontend to create native cross-platform desktop applications.

### Purpose

This is a brand new project building a creation app for writers and creators to develop series of books, scripts, or any type of stories. Key features planned:

- **Text Editor Interface**: The main interface will be a rich text editor for writing
- **AI-Assisted Creation**: Integration with AI to help refine ideas, brainstorm, and assist in the creative process
- **Voice Dictation**: Support for voice input to dictate content
- **Universe Building**: Users can create and manage a universe with:
  - Characters
  - Locations
  - Vehicles
  - Any custom entities that serve as context for their stories
- **Contextual Writing**: The universe elements provide context to enhance AI assistance and maintain consistency across stories

## Element Templates

The app provides pre-configured templates for common element types to help writers get started quickly. Templates suggest optional attributes that can be used, customized, or ignored.

**Core Fields** (always present for every element):
- `name` - Element name (required)
- `description` - Brief description (required)
- `details` - Longer-form text content (optional)

**Template Configuration**: `src/config/element-templates.json`

**Available Templates**:
1. **Character** (👤): age, gender, occupation, personality, physical_description, backstory, motivation, strengths, weaknesses, affiliation
2. **Location** (📍): type, population, climate, geography, culture, government, economy, history, notable_features
3. **Vehicle** (🚗): type, manufacturer, model, crew_capacity, passenger_capacity, dimensions, speed, armament, special_features
4. **Item** (📦): type, rarity, origin, powers, appearance, owner, history, condition
5. **Organization** (🏛️): type, size, founded, headquarters, purpose, leadership, membership, reputation, resources
6. **Creature** (🐉): species, habitat, diet, size, intelligence, behavior, abilities, lifespan, rarity
7. **Event** (📅): date, location, participants, duration, cause, outcome, significance
8. **Concept** (💡): type, origin, principles, practitioners, limitations, applications, history

**Philosophy**: Templates are suggestions, not requirements. Writers can:
- Use suggested attributes that fit their element
- Skip attributes that don't apply (e.g., a comic vehicle doesn't need "manufacturer" or "model")
- Add custom attributes not in the template
- Rely on core fields (name, description, details) for simple elements

**Example**: A fantasy sword might only use `name: "Excalibur"`, `description: "Legendary sword"`, and template attributes `origin: "Lady of the Lake"` and `powers: "Unbreakable"`, skipping rarity, owner, history, etc.

## Project Status

**Current Phase**: Foundation Complete → Frontend Development

### What's Implemented ✅

**Backend (95% Complete)**:
- Domain models: Universe, Container (organizational), Story (content), Element
- Container/Story separation with leaf protection and transaction handling
- Full CRUD operations via repository layer
- Container hierarchy support with unlimited nesting depth
- Git integration complete: init, commit, branch, diff, merge, history
- File management: naming strategy, creation, reordering, metadata.json
- All features exposed via Tauri commands to frontend

**Design System (100% Complete)**:
- Token-first design system ready to use (`src/design-system/`)
- All phases complete: Foundations → Atoms → Organisms → Templates
- Storybook documentation with 100+ component variants
- See Design System section below for details

**What's Next**: Frontend UI implementation (tasks 20-26)
- Chapter/child story management UI (task-21, MEDIUM priority)
- Auto-save with debouncing (task-20)
- Git UI: branch management, diff viewer, merge conflict resolution, history timeline (tasks 23-26)

**Not Yet Started**: AI integration, Voice dictation

### Key Architectural Decisions

- **Git Backend**: Using `git2` Rust library for version control
- **Container/Story Separation**: Clear distinction between organizational entities (Containers) and content entities (Stories)
- **Leaf Protection**: Containers can contain either child containers OR stories, but not both (enforced at creation)
- **Git Repository Ownership**: Only leaf containers and standalone stories have Git repositories
- **Metadata Sync**: metadata.json in each Git repo keeps SQLite and filesystem in sync
- **Design System**: Custom token-first system (not using external component libraries)

**Git Repository Lifecycle**: See `docs/git-repository-lifecycle.md` for detailed documentation on initialization, ownership, transactions, and cleanup.

**Full Roadmap**: See `docs/ideas/roadmap.md` for complete feature list and progress tracking.

## Architecture

### Frontend (React + Vite)
- **Entry Point**: `src/main.tsx` - React 19 entry point with StrictMode
- **Main App**: `src/App.tsx` - Main application component
- **Build Tool**: Vite for fast HMR and bundling
- **Tauri API Integration**: Uses `@tauri-apps/api/core` to invoke Rust backend commands
- **TypeScript Types**: Auto-generated from Rust using `ts-rs` (see Type Generation section)

### Backend (Rust)
- **Library Crate**: `src-tauri/src/lib.rs` - Contains Tauri commands and app initialization
  - Commands are defined with `#[tauri::command]` macro
  - Commands must be registered in `invoke_handler(tauri::generate_handler![...])`
  - Plugins are registered in the builder chain
- **Binary Entry**: `src-tauri/src/main.rs` - Minimal entry point that calls `bright_tauri_lib::run()`
- **Crate Name**: `bright_tauri_lib` (note the `_lib` suffix to avoid Windows conflicts)
- **Domain Models**: Located in `src-tauri/src/models/` directory
- **Database Layer**: SQLite database with migrations in `src-tauri/src/db/`

### Container/Story Architecture

The application uses a clear separation between organizational entities (Containers) and content entities (Stories):

#### Container Entity
**Purpose**: Organizational structure for grouping and nesting content

**Model**: `src-tauri/src/models/container.rs`

**Container Types** (stored as strings):
- `novel` - A novel that contains chapters
- `series` - A series that contains novels or collections
- `collection` - A collection of stories or other containers

**Key Characteristics**:
- Containers can nest other containers (e.g., Series → Novels → Chapters)
- Containers are classified as either **leaf** or **non-leaf**:
  - **Leaf containers**: Contain stories, have their own Git repository
  - **Non-leaf containers**: Contain child containers, no Git repository
- Leaf status is determined by presence of `git_repo_path`

**Hierarchy Rules**:
1. A container can contain either child containers OR stories, but not both (enforced by leaf protection)
2. Only leaf containers (containing stories) have Git repositories
3. Non-leaf containers (containing child containers) do NOT have Git repositories
4. Containers support unlimited nesting depth

**Leaf Protection Validation (PREVENT approach)**:
- When creating a child container, the system validates the parent doesn't already have stories
- If the parent has stories, creation fails with error: "Cannot add child container to a container that already has stories"
- This prevents breaking the Git repository structure
- Implemented in `ContainerRepository::create()` with `get_story_count()` validation

**Example Hierarchy**:
```
Series (non-leaf, no git repo)
├── Novel 1 (leaf, has git repo)
│   ├── Chapter 1 (story)
│   ├── Chapter 2 (story)
│   └── Chapter 3 (story)
└── Novel 2 (leaf, has git repo)
    ├── Chapter 1 (story)
    └── Chapter 2 (story)
```

#### Story Entity
**Purpose**: Actual written content (chapters, scenes, poems, etc.)

**Model**: `src-tauri/src/models/story.rs`

**Story Types** (enum `StoryType`):
- `chapter` - A chapter of a larger work
- `scene` - A scene within a story
- `short-story` - Standalone short story
- `episode` - An episode (for series/TV format)
- `poem` - A poem
- `outline` - Story outline/plan
- `treatment` - Story treatment (film/TV)
- `screenplay` - A screenplay

**Key Characteristics**:
- Stories are pure content entities - they do NOT contain other stories
- Stories can exist standalone or within a container
- Stories support variations (original, alternate-ending, screenplay, etc.)
- Stories have Git versioning for tracking changes

**Git Repository Ownership Rules**:
1. **Standalone stories** (`container_id = None`): Have their own Git repository
2. **Child stories** (`container_id = Some(id)`): Share parent container's Git repository

**Example**:
```rust
// Standalone story - has own git repo
Story {
    container_id: None,
    git_repo_path: "/path/to/story-repo",
    ...
}

// Child story - shares container's git repo
Story {
    container_id: Some("novel-1"),
    git_repo_path: "/path/to/novel-1-repo", // Same as parent container
    ...
}
```

#### Transaction Handling

**Git Repository Creation**:
- Creating a container with Git repo is atomic with database operations
- Uses database transactions: `BEGIN TRANSACTION` → create container → init git → `COMMIT`
- On failure, transaction rolls back automatically
- Ensures data integrity between SQLite and filesystem

**Implementation** (`ContainerRepository::create`):
```rust
conn.execute("BEGIN TRANSACTION", [])?;
// Create container in database
// Initialize Git repository (if leaf)
conn.execute("COMMIT", [])?;
```

#### Migration Strategy

**Clean Slate Approach**:
- The Container/Story refactor required dropping the old schema and starting fresh
- Old `stories` table mixed organizational and content concerns
- New schema cleanly separates:
  - `containers` table: Organizational hierarchy
  - `stories` table: Pure content
- Migration: Drop old database, recreate with new schema (see `src-tauri/src/db/migrations.rs`)

#### Common Patterns

**Creating a Novel with Chapters**:
1. Create container: `type: "novel"` → Gets Git repo (leaf container)
2. Add stories: `container_id: novel.id, story_type: Chapter` → Share container's Git repo

**Creating a Series of Novels**:
1. Create container: `type: "series"` → No Git repo (will contain child containers)
2. Create child containers: `type: "novel", parent_container_id: series.id` → Each gets own Git repo
3. Add chapters to each novel → Share respective novel's Git repo

**Standalone Short Story**:
1. Create story: `container_id: None, story_type: ShortStory` → Gets own Git repo

### Configuration
- **Tauri Config**: `src-tauri/tauri.conf.json`
  - App identifier: `com.cosmos.bright-tauri`
  - Dev server runs on `http://localhost:1420`
  - Build outputs to `dist/` directory
- **Package Config**: Root `package.json` for npm dependencies
- **Cargo Config**: `src-tauri/Cargo.toml` for Rust dependencies

## Design System

The project uses a comprehensive token-first design system built with React, TypeScript, and CSS custom properties.

### Location & Documentation
- **Components**: `src/design-system/`
- **Documentation**: `docs/design-system.md` (comprehensive guide)
- **Storybook**: Run `npm run storybook` to view at `http://localhost:6006`

### Design Decisions
- **CSS Reset**: Modern Reset (Pawel Grzybek's recommendations, auto-imported)
- **Colors**: Modern Indigo (professional blue/indigo with warm amber accents)
- **Typography**: Classic Serif (Playfair Display headings + system sans body, 1.250 scale)
- **Icons**: Phosphor Icons Duotone (modern two-tone style with depth)
- **Buttons**: Minimal Squared (4px radius, compact spacing)
- **Inputs**: Filled Background (Material Design inspired)
- **Cards**: Elevated Shadow (shadow-based depth, no borders)
- **Navigation**: Minimal Top Bar (48px, distraction-free)
- **Dashboard**: Stats Grid (analytics-focused layout)

### Structure
```
src/design-system/
├── tokens/           # Design tokens (reset, colors, typography, icons, atoms)
├── organisms/        # Complex components (cards, navigation)
├── templates/        # Page layouts (dashboard)
└── stories/          # Storybook stories for each component
```

### Usage
1. Import design tokens: `import '../tokens/colors/modern-indigo.css'`
2. Use CSS variables: `color: var(--color-primary)`
3. Apply utility classes: `<button className="btn btn-primary btn-base">`
4. Import components: `import { MinimalTopBar } from '@/design-system/organisms/navigation/Navigation'`

### Key Principles
- Token-first architecture (foundations → atoms → organisms → templates)
- WCAG AA accessibility compliance (4.5:1 contrast for text)
- Desktop-optimized for writing applications
- Distraction-free, minimal chrome design
- Consistent use of design tokens across all components

### UI Philosophy: Minimalism Over Feature Density

**Core Principle**: Prefer multiple clean, focused screens over single bloated views.

**Guidelines**:
- Each view should have a single, clear purpose
- Avoid cramming multiple features into one screen
- Use navigation to separate concerns (e.g., separate screens for editing, settings, history)
- Embrace whitespace and breathing room
- Show only what's essential for the current task
- Progressive disclosure: reveal complexity only when needed
- When in doubt, split into separate views

**Examples**:
- ✅ Separate screens: Story editor, Story settings, Story history
- ❌ Single screen with tabs/panels for all story features
- ✅ Dedicated diff viewer page for comparing versions
- ❌ Inline diff panel squished next to editor
- ✅ Fullscreen writing mode with minimal UI
- ❌ Editor with visible sidebars, toolbars, and panels

**Rationale**: This is a focused writing application. Writers need clarity and freedom from distraction. Clean, purpose-driven screens help users focus on one task at a time without cognitive overload.

See `docs/design-system.md` for complete documentation.

## Common Commands

### Development
```bash
# Start dev server with hot reload (runs both frontend and Tauri)
npm run tauri dev

# Frontend only (for UI development)
npm run dev

# Start Storybook (component development and documentation)
npm run storybook
```

### Building
```bash
# Build frontend TypeScript and bundle
npm run build

# Build complete Tauri application (creates native executable)
npm run tauri build

# Preview production build
npm run preview
```

### Type Checking
```bash
# Run TypeScript compiler
npx tsc
```

### Type Generation
```bash
# Generate TypeScript types from Rust structs
cd src-tauri && cargo test --lib
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI (if @vitest/ui is installed)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Type Generation with ts-rs

This project uses `ts-rs` to automatically generate TypeScript types from Rust structs, eliminating the need to maintain duplicate type definitions.

### How It Works

1. Rust structs in `src-tauri/src/models/` are annotated with `#[derive(TS)]` and `#[ts(export, export_to = "../../src/types/")]`
2. Running `cargo test --lib` triggers type generation
3. TypeScript files are automatically created in `src/types/`
4. These files should NOT be manually edited (they contain a warning comment)

### Adding New Types

When creating new Rust types that need TypeScript equivalents:

1. Add `ts-rs = "10"` to dependencies in `Cargo.toml` (already added)
2. Import the TS trait: `use ts_rs::TS;`
3. Add `TS` to the derive macro: `#[derive(Serialize, Deserialize, TS)]`
4. Add export directive: `#[ts(export, export_to = "../../src/types/")]`
5. Run `cargo test --lib` to generate TypeScript types
6. Import the generated types in your frontend code

### Example

```rust
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
pub struct MyType {
    pub id: String,
    pub name: String,
}
```

This generates `src/types/MyType.ts`:
```typescript
export type MyType = { id: string, name: string };
```

## Frontend Testing with Vitest

The project uses Vitest with React Testing Library for frontend component and integration testing.

### Test Framework Stack

- **Vitest**: Fast Vite-native test runner with watch mode
- **React Testing Library**: User-centric component testing
- **jsdom**: DOM implementation for Node.js
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions

### Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test setup, Tauri mocks
│   └── utils.tsx         # Test utilities and helpers
├── App.test.tsx          # Example: App component test
└── design-system/
    └── tokens/atoms/button/
        └── Button.test.tsx  # Example: Button component test
```

### Configuration

- **Vitest Config**: `vitest.config.ts` - Test environment, coverage, aliases
- **Setup File**: `src/test/setup.ts` - Global mocks, cleanup, ResizeObserver mock
- **Test Utils**: `src/test/utils.tsx` - Custom render functions, Tauri mocking utilities

### Writing Tests

#### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Testing User Interactions

```typescript
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

it('calls onClick when button is clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();

  renderWithProviders(<Button onClick={handleClick}>Click Me</Button>);

  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### Mocking Tauri Commands

```typescript
import { mockTauriInvoke } from '@/test/utils';

it('loads universe data from Tauri backend', async () => {
  mockTauriInvoke('get_universe', { id: '123', name: 'Test Universe' });

  renderWithProviders(<UniverseView />);

  expect(await screen.findByText('Test Universe')).toBeInTheDocument();
});
```

### Best Practices

1. **Test User Behavior, Not Implementation**
   - Query by role, label, or text (not by class or test IDs)
   - Test what users see and do, not internal component state

2. **Use Async Utilities for Async Updates**
   - `await screen.findByText()` for elements that appear later
   - `await waitFor(() => expect(...))` for async state changes

3. **Mock Tauri Commands**
   - All Tauri commands are automatically mocked in `src/test/setup.ts`
   - Use `mockTauriInvoke()` to set up expected responses
   - Use `resetTauriMocks()` to clear mocks between tests

4. **Keep Tests Fast and Isolated**
   - Each test should be independent
   - Use `afterEach` cleanup (already configured)
   - Avoid testing implementation details

5. **Accessibility Testing**
   - Query by roles: `getByRole('button')`, `getByRole('textbox')`
   - Test keyboard interactions: `user.tab()`, `user.keyboard('{Enter}')`
   - Check disabled states: `expect(button).toBeDisabled()`

### Running Tests

```bash
# Watch mode (default)
npm test

# Run once (CI)
npm run test:run

# With coverage
npm run test:coverage

# With UI (if available)
npm run test:ui
```

### Coverage

Coverage reports are generated in `coverage/` directory and exclude:
- Node modules
- Test files (`*.test.tsx`, `*.spec.tsx`)
- Storybook stories (`*.stories.tsx`)
- Configuration files (`*.config.ts`)
- Type definitions (`types/`)
- Build output (`dist/`)
- Rust backend (`src-tauri/`)

### Examples

See example tests:
- `src/App.test.tsx` - Basic component test
- `src/design-system/tokens/atoms/button/Button.test.tsx` - Comprehensive button component test

## Adding New Tauri Commands

1. Define command function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Add command to `generate_handler![]` macro in the builder
3. Call from frontend using `invoke("command_name", { args })`

## Adding New Tauri Plugins

1. Add dependency to `src-tauri/Cargo.toml`
2. Add corresponding npm package if needed
3. Register plugin with `.plugin(plugin_name::init())` in builder chain
