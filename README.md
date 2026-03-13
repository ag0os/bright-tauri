# Bright

A desktop creation app for writers and creators to develop series of books, scripts, and stories. Built with Tauri v2 (Rust backend + React/TypeScript frontend).

## Features

- **Rich Text Editor** for writing chapters, scenes, screenplays, and more
- **Universe Building** -- create and manage characters, locations, vehicles, items, organizations, creatures, events, and custom entities that provide context across your stories
- **Container/Story Organization** -- nest content freely (Series > Novels > Chapters) with clear separation between organizational structure and written content
- **Database-Only Versioning (DBV)** -- named versions (e.g., "Alternate Ending") and automatic snapshots for history/undo, all stored in SQLite
- **AI-Assisted Creation** -- integration with AI for brainstorming, refinement, and consistency (planned)
- **Voice Dictation** -- dictate content by voice (planned)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust (Tauri v2), SQLite
- **Design System**: Custom token-first system with CSS custom properties (no external component libraries)
- **Testing**: Vitest + React Testing Library (frontend), Cargo tests (backend)
- **Type Bridge**: `ts-rs` auto-generates TypeScript types from Rust structs

## Development

```bash
# Install dependencies
npm install

# Start dev server (frontend + Tauri backend with hot reload)
npm run tauri dev

# Frontend only (UI development)
npm run dev

# Storybook (component development)
npm run storybook
```

## Building

```bash
# Production build (creates native executable)
npm run tauri build

# Frontend build only
npm run build
```

## Testing

```bash
# Frontend tests (watch mode)
npm test

# Frontend tests (single run)
npm run test:run

# Coverage report
npm run test:coverage

# Generate TypeScript types from Rust structs
cd src-tauri && cargo test --lib
```

## Architecture

```
src/                    # React frontend
├── design-system/      #   Token-first design system (tokens, organisms, templates)
├── types/              #   Auto-generated TypeScript types (from Rust via ts-rs)
└── test/               #   Test setup and utilities

src-tauri/              # Rust backend
├── src/
│   ├── models/         #   Domain models (Universe, Container, Story, Element)
│   ├── db/             #   SQLite database and migrations
│   └── lib.rs          #   Tauri commands and app initialization
└── Cargo.toml
```

**Key concepts:**

- **Containers** are organizational -- novels, series, collections. They form a hierarchy (containers nest containers or hold stories, never both).
- **Stories** are content -- chapters, scenes, poems, screenplays. They hold the actual writing.
- **Elements** are universe entities -- characters, locations, items, etc. They provide context for AI assistance and consistency.
- **Versions** are named alternate takes on a story. **Snapshots** are automatic save points within a version.

For deeper architectural details, see [CLAUDE.md](./CLAUDE.md).
