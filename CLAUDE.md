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

### Configuration
- **Tauri Config**: `src-tauri/tauri.conf.json`
  - App identifier: `com.cosmos.bright-tauri`
  - Dev server runs on `http://localhost:1420`
  - Build outputs to `dist/` directory
- **Package Config**: Root `package.json` for npm dependencies
- **Cargo Config**: `src-tauri/Cargo.toml` for Rust dependencies

## Common Commands

### Development
```bash
# Start dev server with hot reload (runs both frontend and Tauri)
npm run tauri dev

# Frontend only (for UI development)
npm run dev
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

## Adding New Tauri Commands

1. Define command function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Add command to `generate_handler![]` macro in the builder
3. Call from frontend using `invoke("command_name", { args })`

## Adding New Tauri Plugins

1. Add dependency to `src-tauri/Cargo.toml`
2. Add corresponding npm package if needed
3. Register plugin with `.plugin(plugin_name::init())` in builder chain
