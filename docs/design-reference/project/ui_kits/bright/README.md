# Bright — Desktop App UI Kit

Pixel-faithful recreation of Bright's five core screens, re-skinned into the **Ink & Paper** design system.

## Screens

1. **Universe selection** — the entry point; chooses which universe to work in.
2. **Stories list** — the home view inside a universe; grid of stories and containers.
3. **Story editor** — distraction-light editor with sidebar metadata, auto-save, word count, version chip.
4. **Universe (elements)** — grid of characters, locations, items, organizations, etc.
5. **Version history** — drawer showing named versions and auto-snapshots.

## Files

- `index.html` — click-through prototype that stitches all screens together. Start here.
- `App.jsx` — top-level shell (top bar + screen router).
- `TopBar.jsx` — 48px app chrome with universe picker.
- `UniverseSelection.jsx` — entry screen.
- `StoriesList.jsx` — grid of story + container cards.
- `StoryEditor.jsx` — editor with sidebar + save chip + word count.
- `UniverseElements.jsx` — elements grid (characters, locations, etc.).
- `VersionsDrawer.jsx` — right-side drawer with versions & snapshots.
- `primitives.jsx` — shared Button, Input, Select, Icon, Badge.
- `data.js` — fake universe/story/element data for the prototype.

## Codebase mapping

| This kit | Source in `bright-tauri/` |
|---|---|
| `TopBar.jsx` | `src/shared/components/TopBar.tsx` |
| `UniverseSelection.jsx` | `src/features/universe/views/UniverseSelection.tsx` |
| `StoriesList.jsx` | `src/features/stories/views/StoriesList.tsx` + `components/StoryCard.tsx` |
| `StoryEditor.jsx` | `src/features/stories/views/StoryEditor.tsx` |
| `UniverseElements.jsx` | `src/features/elements/components/ElementCard.tsx` + `views/ElementsList.tsx` |
| `VersionsDrawer.jsx` | `src/features/stories/views/StoryVersions.tsx` + `StoryHistory.tsx` |

Replaces the legacy color, typography, and elevated-shadow tokens with the Ink & Paper foundations (`../../colors_and_type.css`).
