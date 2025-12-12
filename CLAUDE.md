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
- Domain models: Universe, Story (with hierarchy & variations), Element
- Full CRUD operations via repository layer
- Story hierarchy support: chapters, child stories, reordering (`list_children`, `reorder_children`, `get_with_children`)
- Git integration complete: init, commit, branch, diff, merge, history
- File management: naming strategy (001-title.md), creation, reordering, metadata.json
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
- **Story Hierarchy**: Stories can have child stories (chapters) stored as numbered markdown files (001-title.md)
- **Metadata Sync**: metadata.json in each story's Git repo keeps SQLite and filesystem in sync
- **Design System**: Custom token-first system (not using external component libraries)

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

<!-- BACKLOG.MD GUIDELINES START -->
# Instructions for the usage of Backlog.md CLI Tool

## Backlog.md: Comprehensive Project Management Tool via CLI

### Assistant Objective

Efficiently manage all project tasks, status, and documentation using the Backlog.md CLI, ensuring all project metadata
remains fully synchronized and up-to-date.

### Core Capabilities

- ✅ **Task Management**: Create, edit, assign, prioritize, and track tasks with full metadata
- ✅ **Acceptance Criteria**: Granular control with add/remove/check/uncheck by index
- ✅ **Board Visualization**: Terminal-based Kanban board (`backlog board`) and web UI (`backlog browser`)
- ✅ **Git Integration**: Automatic tracking of task states across branches
- ✅ **Dependencies**: Task relationships and subtask hierarchies
- ✅ **Documentation & Decisions**: Structured docs and architectural decision records
- ✅ **Export & Reporting**: Generate markdown reports and board snapshots
- ✅ **AI-Optimized**: `--plain` flag provides clean text output for AI processing

### Why This Matters to You (AI Agent)

1. **Comprehensive system** - Full project management capabilities through CLI
2. **The CLI is the interface** - All operations go through `backlog` commands
3. **Unified interaction model** - You can use CLI for both reading (`backlog task 1 --plain`) and writing (
   `backlog task edit 1`)
4. **Metadata stays synchronized** - The CLI handles all the complex relationships

### Key Understanding

- **Tasks** live in `backlog/tasks/` as `task-<id> - <title>.md` files
- **You interact via CLI only**: `backlog task create`, `backlog task edit`, etc.
- **Use `--plain` flag** for AI-friendly output when viewing/listing
- **Never bypass the CLI** - It handles Git, metadata, file naming, and relationships

---

# ⚠️ CRITICAL: NEVER EDIT TASK FILES DIRECTLY. Edit Only via CLI

**ALL task operations MUST use the Backlog.md CLI commands**

- ✅ **DO**: Use `backlog task edit` and other CLI commands
- ✅ **DO**: Use `backlog task create` to create new tasks
- ✅ **DO**: Use `backlog task edit <id> --check-ac <index>` to mark acceptance criteria
- ❌ **DON'T**: Edit markdown files directly
- ❌ **DON'T**: Manually change checkboxes in files
- ❌ **DON'T**: Add or modify text in task files without using CLI

**Why?** Direct file editing breaks metadata synchronization, Git tracking, and task relationships.

---

## 1. Source of Truth & File Structure

### 📖 **UNDERSTANDING** (What you'll see when reading)

- Markdown task files live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**)
- Files are named: `task-<id> - <title>.md` (e.g., `task-42 - Add GraphQL resolver.md`)
- Project documentation is in **`backlog/docs/`**
- Project decisions are in **`backlog/decisions/`**

### 🔧 **ACTING** (How to change things)

- **All task operations MUST use the Backlog.md CLI tool**
- This ensures metadata is correctly updated and the project stays in sync
- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output

---

## 2. Common Mistakes to Avoid

### ❌ **WRONG: Direct File Editing**

```markdown
# DON'T DO THIS:

1. Open backlog/tasks/task-7 - Feature.md in editor
2. Change "- [ ]" to "- [x]" manually
3. Add notes directly to the file
4. Save the file
```

### ✅ **CORRECT: Using CLI Commands**

```bash
# DO THIS INSTEAD:
backlog task edit 7 --check-ac 1  # Mark AC #1 as complete
backlog task edit 7 --notes "Implementation complete"  # Add notes
backlog task edit 7 -s "In Progress" -a @agent-k  # Multiple commands: change status and assign the task when you start working on the task
```

---

## 3. Understanding Task Format (Read-Only Reference)

⚠️ **FORMAT REFERENCE ONLY** - The following sections show what you'll SEE in task files.
**Never edit these directly! Use CLI commands to make changes.**

### Task Structure You'll See

```markdown
---
id: task-42
title: Add GraphQL resolver
status: To Do
assignee: [@sara]
labels: [backend, api]
---

## Description

Brief explanation of the task purpose.

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 First criterion
- [x] #2 Second criterion (completed)
- [ ] #3 Third criterion

<!-- AC:END -->

## Implementation Plan

1. Research approach
2. Implement solution

## Implementation Notes

Summary of what was done.
```

### How to Modify Each Section

| What You Want to Change | CLI Command to Use                                       |
|-------------------------|----------------------------------------------------------|
| Title                   | `backlog task edit 42 -t "New Title"`                    |
| Status                  | `backlog task edit 42 -s "In Progress"`                  |
| Assignee                | `backlog task edit 42 -a @sara`                          |
| Labels                  | `backlog task edit 42 -l backend,api`                    |
| Description             | `backlog task edit 42 -d "New description"`              |
| Add AC                  | `backlog task edit 42 --ac "New criterion"`              |
| Check AC #1             | `backlog task edit 42 --check-ac 1`                      |
| Uncheck AC #2           | `backlog task edit 42 --uncheck-ac 2`                    |
| Remove AC #3            | `backlog task edit 42 --remove-ac 3`                     |
| Add Plan                | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add Notes (replace)     | `backlog task edit 42 --notes "What I did"`              |
| Append Notes            | `backlog task edit 42 --append-notes "Another note"` |

---

## 4. Defining Tasks

### Creating New Tasks

**Always use CLI to create tasks:**

```bash
# Example
backlog task create "Task title" -d "Description" --ac "First criterion" --ac "Second criterion"
```

### Title (one liner)

Use a clear brief title that summarizes the task.

### Description (The "why")

Provide a concise summary of the task purpose and its goal. Explains the context without implementation details.

### Acceptance Criteria (The "what")

**Understanding the Format:**

- Acceptance criteria appear as numbered checkboxes in the markdown files
- Format: `- [ ] #1 Criterion text` (unchecked) or `- [x] #1 Criterion text` (checked)

**Managing Acceptance Criteria via CLI:**

⚠️ **IMPORTANT: How AC Commands Work**

- **Adding criteria (`--ac`)** accepts multiple flags: `--ac "First" --ac "Second"` ✅
- **Checking/unchecking/removing** accept multiple flags too: `--check-ac 1 --check-ac 2` ✅
- **Mixed operations** work in a single command: `--check-ac 1 --uncheck-ac 2 --remove-ac 3` ✅

```bash
# Examples

# Add new criteria (MULTIPLE values allowed)
backlog task edit 42 --ac "User can login" --ac "Session persists"

# Check specific criteria by index (MULTIPLE values supported)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check multiple ACs
# Or check them individually if you prefer:
backlog task edit 42 --check-ac 1    # Mark #1 as complete
backlog task edit 42 --check-ac 2    # Mark #2 as complete

# Mixed operations in single command
backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3

# ❌ STILL WRONG - These formats don't work:
# backlog task edit 42 --check-ac 1,2,3  # No comma-separated values
# backlog task edit 42 --check-ac 1-3    # No ranges
# backlog task edit 42 --check 1         # Wrong flag name

# Multiple operations of same type
backlog task edit 42 --uncheck-ac 1 --uncheck-ac 2  # Uncheck multiple ACs
backlog task edit 42 --remove-ac 2 --remove-ac 4    # Remove multiple ACs (processed high-to-low)
```

**Key Principles for Good ACs:**

- **Outcome-Oriented:** Focus on the result, not the method.
- **Testable/Verifiable:** Each criterion should be objectively testable
- **Clear and Concise:** Unambiguous language
- **Complete:** Collectively cover the task scope
- **User-Focused:** Frame from end-user or system behavior perspective

Good Examples:

- "User can successfully log in with valid credentials"
- "System processes 1000 requests per second without errors"
- "CLI preserves literal newlines in description/plan/notes; `\\n` sequences are not auto‑converted"

Bad Example (Implementation Step):

- "Add a new function handleLogin() in auth.ts"
- "Define expected behavior and document supported input patterns"

### Task Breakdown Strategy

1. Identify foundational components first
2. Create tasks in dependency order (foundations before features)
3. Ensure each task delivers value independently
4. Avoid creating tasks that block each other

### Task Requirements

- Tasks must be **atomic** and **testable** or **verifiable**
- Each task should represent a single unit of work for one PR
- **Never** reference future tasks (only tasks with id < current task id)
- Ensure tasks are **independent** and don't depend on future work

---

## 5. Implementing Tasks

### 5.1. First step when implementing a task

The very first things you must do when you take over a task are:

* set the task in progress
* assign it to yourself

```bash
# Example
backlog task edit 42 -s "In Progress" -a @{myself}
```

### 5.2. Create an Implementation Plan (The "how")

Previously created tasks contain the why and the what. Once you are familiar with that part you should think about a
plan on **HOW** to tackle the task and all its acceptance criteria. This is your **Implementation Plan**.
First do a quick check to see if all the tools that you are planning to use are available in the environment you are
working in.   
When you are ready, write it down in the task so that you can refer to it later.

```bash
# Example
backlog task edit 42 --plan "1. Research codebase for references\n2Research on internet for similar cases\n3. Implement\n4. Test"
```

## 5.3. Implementation

Once you have a plan, you can start implementing the task. This is where you write code, run tests, and make sure
everything works as expected. Follow the acceptance criteria one by one and MARK THEM AS COMPLETE as soon as you
finish them.

### 5.4 Implementation Notes (PR description)

When you are done implementing a tasks you need to prepare a PR description for it.
Because you cannot create PRs directly, write the PR as a clean description in the task notes.
Append notes progressively during implementation using `--append-notes`:

```
backlog task edit 42 --append-notes "Implemented X" --append-notes "Added tests"
```

```bash
# Example
backlog task edit 42 --notes "Implemented using pattern X because Reason Y, modified files Z and W"
```

**IMPORTANT**: Do NOT include an Implementation Plan when creating a task. The plan is added only after you start the
implementation.

- Creation phase: provide Title, Description, Acceptance Criteria, and optionally labels/priority/assignee.
- When you begin work, switch to edit, set the task in progress and assign to yourself
  `backlog task edit <id> -s "In Progress" -a "..."`.
- Think about how you would solve the task and add the plan: `backlog task edit <id> --plan "..."`.
- Add Implementation Notes only after completing the work: `backlog task edit <id> --notes "..."` (replace) or append progressively using `--append-notes`.

## Phase discipline: What goes where

- Creation: Title, Description, Acceptance Criteria, labels/priority/assignee.
- Implementation: Implementation Plan (after moving to In Progress and assigning to yourself).
- Wrap-up: Implementation Notes (Like a PR description), AC and Definition of Done checks.

**IMPORTANT**: Only implement what's in the Acceptance Criteria. If you need to do more, either:

1. Update the AC first: `backlog task edit 42 --ac "New requirement"`
2. Or create a new follow up task: `backlog task create "Additional feature"`

---

## 6. Typical Workflow

```bash
# 1. Identify work
backlog task list -s "To Do" --plain

# 2. Read task details
backlog task 42 --plain

# 3. Start work: assign yourself & change status
backlog task edit 42 -s "In Progress" -a @myself

# 4. Add implementation plan
backlog task edit 42 --plan "1. Analyze\n2. Refactor\n3. Test"

# 5. Work on the task (write code, test, etc.)

# 6. Mark acceptance criteria as complete (supports multiple in one command)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check all at once
# Or check them individually if preferred:
# backlog task edit 42 --check-ac 1
# backlog task edit 42 --check-ac 2
# backlog task edit 42 --check-ac 3

# 7. Add implementation notes (PR Description)
backlog task edit 42 --notes "Refactored using strategy pattern, updated tests"

# 8. Mark task as done
backlog task edit 42 -s Done
```

---

## 7. Definition of Done (DoD)

A task is **Done** only when **ALL** of the following are complete:

### ✅ Via CLI Commands:

1. **All acceptance criteria checked**: Use `backlog task edit <id> --check-ac <index>` for each
2. **Implementation notes added**: Use `backlog task edit <id> --notes "..."`
3. **Status set to Done**: Use `backlog task edit <id> -s Done`

### ✅ Via Code/Testing:

4. **Tests pass**: Run test suite and linting
5. **Documentation updated**: Update relevant docs if needed
6. **Code reviewed**: Self-review your changes
7. **No regressions**: Performance, security checks pass

⚠️ **NEVER mark a task as Done without completing ALL items above**

---

## 8. Quick Reference: DO vs DON'T

### Viewing Tasks

| Task         | ✅ DO                        | ❌ DON'T                         |
|--------------|-----------------------------|---------------------------------|
| View task    | `backlog task 42 --plain`   | Open and read .md file directly |
| List tasks   | `backlog task list --plain` | Browse backlog/tasks folder     |
| Check status | `backlog task 42 --plain`   | Look at file content            |

### Modifying Tasks

| Task          | ✅ DO                                 | ❌ DON'T                           |
|---------------|--------------------------------------|-----------------------------------|
| Check AC      | `backlog task edit 42 --check-ac 1`  | Change `- [ ]` to `- [x]` in file |
| Add notes     | `backlog task edit 42 --notes "..."` | Type notes into .md file          |
| Change status | `backlog task edit 42 -s Done`       | Edit status in frontmatter        |
| Add AC        | `backlog task edit 42 --ac "New"`    | Add `- [ ] New` to file           |

---

## 9. Complete CLI Command Reference

### Task Creation

| Action           | Command                                                                             |
|------------------|-------------------------------------------------------------------------------------|
| Create task      | `backlog task create "Title"`                                                       |
| With description | `backlog task create "Title" -d "Description"`                                      |
| With AC          | `backlog task create "Title" --ac "Criterion 1" --ac "Criterion 2"`                 |
| With all options | `backlog task create "Title" -d "Desc" -a @sara -s "To Do" -l auth --priority high` |
| Create draft     | `backlog task create "Title" --draft`                                               |
| Create subtask   | `backlog task create "Title" -p 42`                                                 |

### Task Modification

| Action           | Command                                     |
|------------------|---------------------------------------------|
| Edit title       | `backlog task edit 42 -t "New Title"`       |
| Edit description | `backlog task edit 42 -d "New description"` |
| Change status    | `backlog task edit 42 -s "In Progress"`     |
| Assign           | `backlog task edit 42 -a @sara`             |
| Add labels       | `backlog task edit 42 -l backend,api`       |
| Set priority     | `backlog task edit 42 --priority high`      |

### Acceptance Criteria Management

| Action              | Command                                                                     |
|---------------------|-----------------------------------------------------------------------------|
| Add AC              | `backlog task edit 42 --ac "New criterion" --ac "Another"`                  |
| Remove AC #2        | `backlog task edit 42 --remove-ac 2`                                        |
| Remove multiple ACs | `backlog task edit 42 --remove-ac 2 --remove-ac 4`                          |
| Check AC #1         | `backlog task edit 42 --check-ac 1`                                         |
| Check multiple ACs  | `backlog task edit 42 --check-ac 1 --check-ac 3`                            |
| Uncheck AC #3       | `backlog task edit 42 --uncheck-ac 3`                                       |
| Mixed operations    | `backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3 --ac "New"` |

### Task Content

| Action           | Command                                                  |
|------------------|----------------------------------------------------------|
| Add plan         | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add notes        | `backlog task edit 42 --notes "Implementation details"`  |
| Add dependencies | `backlog task edit 42 --dep task-1 --dep task-2`         |

### Multi‑line Input (Description/Plan/Notes)

The CLI preserves input literally. Shells do not convert `\n` inside normal quotes. Use one of the following to insert real newlines:

- Bash/Zsh (ANSI‑C quoting):
  - Description: `backlog task edit 42 --desc $'Line1\nLine2\n\nFinal'`
  - Plan: `backlog task edit 42 --plan $'1. A\n2. B'`
  - Notes: `backlog task edit 42 --notes $'Done A\nDoing B'`
  - Append notes: `backlog task edit 42 --append-notes $'Progress update line 1\nLine 2'`
- POSIX portable (printf):
  - `backlog task edit 42 --notes "$(printf 'Line1\nLine2')"`
- PowerShell (backtick n):
  - `backlog task edit 42 --notes "Line1`nLine2"`

Do not expect `"...\n..."` to become a newline. That passes the literal backslash + n to the CLI by design.

Descriptions support literal newlines; shell examples may show escaped `\\n`, but enter a single `\n` to create a newline.

### Task Operations

| Action             | Command                                      |
|--------------------|----------------------------------------------|
| View task          | `backlog task 42 --plain`                    |
| List tasks         | `backlog task list --plain`                  |
| Filter by status   | `backlog task list -s "In Progress" --plain` |
| Filter by assignee | `backlog task list -a @sara --plain`         |
| Archive task       | `backlog task archive 42`                    |
| Demote to draft    | `backlog task demote 42`                     |

---

## Common Issues

| Problem              | Solution                                                           |
|----------------------|--------------------------------------------------------------------|
| Task not found       | Check task ID with `backlog task list --plain`                     |
| AC won't check       | Use correct index: `backlog task 42 --plain` to see AC numbers     |
| Changes not saving   | Ensure you're using CLI, not editing files                         |
| Metadata out of sync | Re-edit via CLI to fix: `backlog task edit 42 -s <current-status>` |

---

## Remember: The Golden Rule

**🎯 If you want to change ANYTHING in a task, use the `backlog task edit` command.**
**📖 Use CLI to read tasks, exceptionally READ task files directly, never WRITE to them.**

Full help available: `backlog --help`

<!-- BACKLOG.MD GUIDELINES END -->
