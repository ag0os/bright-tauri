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

### Backend (Rust)
- **Library Crate**: `src-tauri/src/lib.rs` - Contains Tauri commands and app initialization
  - Commands are defined with `#[tauri::command]` macro
  - Commands must be registered in `invoke_handler(tauri::generate_handler![...])`
  - Plugins are registered in the builder chain
- **Binary Entry**: `src-tauri/src/main.rs` - Minimal entry point that calls `bright_tauri_lib::run()`
- **Crate Name**: `bright_tauri_lib` (note the `_lib` suffix to avoid Windows conflicts)

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

## Adding New Tauri Commands

1. Define command function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Add command to `generate_handler![]` macro in the builder
3. Call from frontend using `invoke("command_name", { args })`

## Adding New Tauri Plugins

1. Add dependency to `src-tauri/Cargo.toml`
2. Add corresponding npm package if needed
3. Register plugin with `.plugin(plugin_name::init())` in builder chain
