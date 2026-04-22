# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

**bright-tauri** — a Tauri v2 desktop app for writers and creators to develop series of books, scripts, and stories. Writers build a **universe** (characters, locations, vehicles, custom elements) that provides context for AI-assisted writing, voice dictation, and a rich-text editor.

**Current phase**: Foundation Complete → Frontend Development. Backend (~95%) and design system (100%) are done. Next up: chapter/child-story management UI, version & snapshot UI, history timeline and diff viewer. AI integration and voice dictation are not yet started.

See `docs/ui-navigation.md`, `docs/implementation-plan.md`, and `docs/decisions/` for current product direction and ADRs.

## Stack

- **Frontend**: React 19 + TypeScript (~5.8), Vite 7, Zustand, Lexical editor, dnd-kit, Phosphor + Lucide icons, custom token-first design system, Storybook
- **Backend**: Rust (Tauri 2), SQLite via `rusqlite` (bundled), `ts-rs` for auto-generated TS types, `uuid`, `chrono`
- **Testing**: Vitest + React Testing Library + jsdom; Playwright available

## Commands

```bash
npm run tauri dev          # full app with hot reload
npm run dev                # frontend only (UI iteration)
npm run storybook          # component workbench at :6006
npm run build              # tsc + vite build
npm run tauri build        # native executable

npm test                   # vitest watch
npm run test:run           # vitest once (CI)
npm run test:coverage      # coverage report
npx tsc                    # typecheck only

npm run lint               # Biome lint + format check (frontend)
npm run lint:fix           # Biome auto-fix + format
npm run lint:rust          # cargo fmt --check + cargo clippy -D warnings
npm run lint:rust:fix      # cargo fmt + cargo clippy --fix
npm run lint:all           # frontend + Rust lint in one shot

cd src-tauri && cargo test --lib   # runs Rust tests AND regenerates src/types/*.ts via ts-rs
```

## Architecture

### Frontend layout (`src/`)
- `features/{universe,containers,stories,elements,settings}` — feature-first modules
- `pages/` — top-level routes/screens
- `design-system/{tokens,organisms,templates,stories}` — token-first design system (see `docs/design-system.md`)
- `editor/` — Lexical-based editor
- `shared/`, `test/`, `test-utils/`
- `types/` — **auto-generated from Rust via ts-rs. Do not edit.**

### Backend layout (`src-tauri/src/`)
- `commands/` — `#[tauri::command]` handlers exposed to the frontend
- `models/` — domain entities (annotated with `#[derive(TS)]` for type export)
- `repositories/` — CRUD + transactions
- `services/` — domain logic
- `db/` — SQLite setup + migrations
- `lib.rs` — registers commands in `invoke_handler(tauri::generate_handler![...])`

### Domain model

**Container / Story separation** — the core architectural decision:

- **Container** (`models/container.rs`): organizational entity. Types: `novel`, `series`, `collection`. Can nest other containers **or** contain stories, but **not both** (leaf protection enforced in `ContainerRepository::create()`).
- **Story** (`models/story.rs`): content entity. Types: `chapter`, `scene`, `short-story`, `episode`, `poem`, `outline`, `treatment`, `screenplay`. Stories never contain other stories.

**Database-Only Versioning (DBV)** — see `docs/decisions/002-database-only-versioning.md`:
- `StoryVersion` — named alternate versions (e.g., "Alternate Ending") with independent content
- `StorySnapshot` — automatic save points per version for history/undo, created on character-count or time threshold

### Element templates (`src/config/element-templates.json`)

Core fields `name`, `description`, `details` exist for every element. Templates (Character, Location, Vehicle, Item, Organization, Creature, Event, Concept) are **suggestions, not requirements** — writers pick, skip, or extend attributes freely.

## Working conventions

### UI philosophy: minimalism over feature density

This is a focused writing app. Prefer multiple clean, focused screens over one bloated view.

- Each view has a single, clear purpose.
- Use navigation to separate concerns (editor / settings / history as separate screens).
- Progressive disclosure — reveal complexity only when needed.
- When in doubt, split into a new screen.

✅ Separate screens for editor, settings, history, diff viewer.
❌ Tabs or side panels cramming multiple features into one screen.

### Design system

- Token-first, CSS custom properties, WCAG AA. Do not introduce external component libraries.
- The system is **Ink & Paper**: warm ink + marigold, Newsreader + Geist, Phosphor regular weight, flat cards with hairline borders.
- **For any UI/CSS/component work, load `/skill:ink-and-paper` first** — it has the native token table, iconography policy, editor reading values, and alias-retirement status.
- Full reference: `docs/design-system.md`. Exported source of truth: `docs/design-reference/`.

### Adding a Tauri command

1. Define `#[tauri::command]` function in the appropriate `src-tauri/src/commands/*` module.
2. Register it in `generate_handler![...]` in `src-tauri/src/lib.rs`.
3. Invoke from the frontend via `@tauri-apps/api/core` `invoke("name", { args })`.
4. If return/arg types are new, annotate the Rust struct with `#[derive(TS)] #[ts(export, export_to = "../../src/types/")]` and run `cd src-tauri && cargo test --lib` to regenerate TS types.

### Adding a Tauri plugin

1. Add to `src-tauri/Cargo.toml` and register with `.plugin(name::init())` in the builder chain in `lib.rs`.
2. Add the matching `@tauri-apps/plugin-*` npm package if the plugin needs a JS side.

### Testing

- Use `renderWithProviders` from `src/test/utils.tsx` and the `mockTauriInvoke` helper for Tauri calls.
- Query by role / label / text, not by class or test id.
- Prefer `findBy*` and `waitFor` for async UI.
- Vitest config: `vitest.config.ts`. Setup + Tauri mocks: `src/test/setup.ts`.
- Example tests: `src/App.test.tsx`, `src/design-system/tokens/atoms/button/Button.test.tsx`.

## Warnings

- **Never hand-edit `src/types/*.ts`** — generated by ts-rs.
- **Leaf protection**: creating a child container fails if the parent already has stories. Do not work around this; it is enforced by design.
- **Schema changes**: the Container/Story split required a clean-slate DB drop. Future schema changes should add a proper migration in `src-tauri/src/db/migrations.rs`.
- **Crate name quirk**: the Rust library crate is `bright_tauri_lib` (the `_lib` suffix avoids a Windows conflict — see `src-tauri/Cargo.toml`).
- Dev server is pinned to `http://localhost:1420` (`tauri.conf.json`).

## Key docs

- `docs/design-system.md` — design system reference
- `docs/design-reference/` — Ink & Paper source of truth (tokens, preview HTML, voice). Read-only; do not edit.
- `docs/decisions/002-database-only-versioning.md` — DBV rationale
- `docs/ui-navigation.md`, `docs/implementation-plan.md`
