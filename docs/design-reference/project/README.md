# Bright — Design System

> A calmer, more literary, more grown-up interface for a desktop creation app built for writers.

Bright is a desktop app (Tauri v2 + React + TypeScript, SQLite backend) that helps writers and creators develop long-form work — novels, series, screenplays, scenes, poems — alongside a "universe" of supporting context (characters, locations, vehicles, items, organizations, creatures, events, concepts). Content is organized by **Containers** (Series → Novels → Chapters) and **Stories** (the actual writing), with a database-versioning model that treats named alternate takes ("Alternate Ending") and automatic snapshots as first-class citizens.

This design system modernizes Bright's original look. The old system — deep indigo dark theme, Playfair Display headings, small-radius buttons — read as generic SaaS. The new system is **Ink & Paper**: warm neutrals, a single saturated marigold accent, a distinctive editorial serif, and restrained motion. It's meant to feel like a fountain pen rather than a dashboard.

---

## Sources

All design context was read from the attached codebase (read-only, mounted locally):

- **Codebase:** `bright-tauri/` (not included in this project)
- **Key files read:**
  - `bright-tauri/README.md`, `bright-tauri/CLAUDE.md` — product & architecture
  - `bright-tauri/design-system-state.json` — the prior system's selections
  - `bright-tauri/src/design-system/tokens/colors/modern-indigo.css`
  - `bright-tauri/src/design-system/tokens/typography/classic-serif.css`
  - `bright-tauri/src/design-system/tokens/spacing.css`
  - `bright-tauri/src/design-system/tokens/atoms/button/minimal-squared.css`
  - `bright-tauri/src/design-system/tokens/atoms/input/filled-background.css`
  - `bright-tauri/src/design-system/tokens/organisms/card/elevated-shadow.css`
  - `bright-tauri/src/features/universe/**` — universe selection + cards
  - `bright-tauri/src/features/stories/**` — story editor, list, versions, history
  - `bright-tauri/src/features/elements/**` — element cards & detail
  - `bright-tauri/src/features/containers/**` — container views
  - `bright-tauri/src/shared/components/TopBar.{tsx,css}`, `PageLayout.tsx`

No Figma was provided.

---

## What this system replaces (and why)

| Old | Why it was tired | New |
|---|---|---|
| `#1e1b4b` indigo-950 background + indigo-400 primary | Generic "dark SaaS" — every startup has this palette | Warm ink (`#15120E`) background, marigold (`#D97706`) as the single accent |
| Playfair Display headings | Over-indexed on "creative writing app" cliché; high-contrast strokes feel dated | **Newsreader** (Google's variable serif) — optically refined, distinctively editorial |
| System sans body | Default-feeling | **Geist** — modern, open, pairs cleanly with a serif |
| 4px button radius | Jagged against a soft content surface | 8px standard, 12px cards, 999px pills |
| Purple focus rings, purple status pills, purple hover | Monochromatic fatigue | Neutral hovers, accent only for primary actions and focus |
| Elevated shadow cards with 2px lift on hover | Floating-card trope; distracting during long writing sessions | Flat surfaces with a hairline border; hover shifts fill, not elevation |

---

## Index

- [`colors_and_type.css`](./colors_and_type.css) — CSS custom properties for color, type, spacing, shadow, radius
- [`fonts/`](./fonts/) — webfont declarations (loaded from Google Fonts CDN; see "Font substitutions" below)
- [`assets/`](./assets/) — logos, wordmarks, generic imagery
- [`preview/`](./preview/) — design system cards registered for review
- [`ui_kits/bright/`](./ui_kits/bright/) — Bright desktop app UI kit (React/JSX)
- [`SKILL.md`](./SKILL.md) — skill entry point for Claude Code / agent use

Because Bright has **one product surface** (the desktop app), there is one UI kit. No marketing site, no docs site, no mobile.

---

## Content fundamentals

Bright's copy is **quiet, warm, and craft-oriented**. It treats the user as a working writer, not a consumer. Read and follow these when writing any new copy.

**Voice**
- Conversational but never chirpy. No "Let's get started!" or "Awesome!".
- **You** over "we". The user is the author; Bright is the tool on the desk.
- Present tense, active voice.
- Light editorial confidence. A touch of warmth. Never exclamatory.

**Casing**
- **Sentence case** everywhere — titles, buttons, menu items, headings. Never Title Case, never ALL CAPS (except small-caps micro-labels, which we avoid).
- Proper nouns keep their caps: "Bright", "Universe", "Snapshot", "Version" are domain nouns and stay capitalized when they refer to the concept.

**Punctuation**
- Em-dashes — preferred over parentheses for asides.
- Oxford commas, always.
- Single spaces after periods.
- Use real curly quotes: "like this", 'not this'. Real apostrophes: it's, not it's.
- Numerals for counts (1 chapter, 12 versions), words under 10 in prose ("three acts").

**Labels & microcopy — specific examples**

| Instead of | Write |
|---|---|
| "Create New Story" | "New story" |
| "Stories" (empty state) "You haven't created any stories yet. Click the button below to get started!" | "No stories yet. Start with a chapter, a scene, or an outline — whatever gets you moving." |
| "Loading universes..." | "Loading universes." (period, not ellipsis — ellipsis implies thinking) |
| "Saved ✓" | "Saved" (no icon needed in microcopy, icon is separate) |
| "Are you sure you want to delete this?" | "Delete *The Last Light*? This can't be undone." |
| "Your work has been saved successfully." | "Saved 2 seconds ago." |
| "Settings" (section header) | "Settings" |

**Emoji:** never. The brand uses Phosphor icons (duotone) for everything that needs an icon. Emoji appearing in the original element-template config (👤, 📍, 🚗, etc.) should be replaced with Phosphor icons in UI.

**Tone samples (approved)**
- *Empty dashboard:* "Your universe is empty. Add a character, a place, or anything else that matters to the story."
- *Auto-save confirmation:* "Saved. Version 3 — *First draft*."
- *Version created:* "*Alternate ending* saved as a new version."
- *Destructive confirm:* "Delete the snapshot from 2:14 PM? It won't be recoverable."

---

## Visual foundations

**Color philosophy.** Two surface systems (warm ink dark, warm paper light), one saturated accent (marigold), a restrained set of semantic colors. No gradients on UI chrome. Imagery, when used, skews warm with a mild film grain — never neon, never cool blue.

- **Dark theme (default).** Background `#15120E` (warm ink), surface `#1F1B15`, raised surface `#2A251D`. Text `#F5EFE4` (paper white). The warmth prevents the "cold terminal" feel of pure grayscale dark mode.
- **Light theme.** Background `#FAF7F1` (warm paper), surface `#FFFFFF`, muted surface `#F0EBDF`. Text `#1A1712` (deep ink).
- **Accent.** `#D97706` marigold. Used for: primary buttons, active tab state, focus rings, one-at-a-time accents. Never as a background on large surfaces.
- **Semantic.** `#B45309` warning/amber-deep, `#2F7A53` success/moss, `#B0391F` error/terracotta, `#4C6EA8` info/ink-blue. All chosen to harmonize with the warm palette — no stock Tailwind green/red.

**Type.**
- **Display serif:** Newsreader (variable, loaded from Google Fonts). Used for H1–H3, story titles, big editorial moments. Optical size is tuned per usage (see `colors_and_type.css`).
- **UI / body:** Geist (variable, loaded from Google Fonts). 15px base in UI chrome, 17px in reading body, 18–20px in the editor.
- **Monospace:** JetBrains Mono. Used for code, word counts (tabular figures), timestamps.
- Writers compose in a **reading serif** (Newsreader) inside the editor, at 18–20px, 1.7 line height, max 68ch column. UI chrome stays in Geist so the reading context is distinct from the interface.

**Backgrounds.**
- Mostly solid warm surfaces.
- A subtle **paper grain** SVG/noise layer sits at 3% opacity on the main app background in dark mode (adds warmth, hides banding).
- No hand-drawn illustrations, no repeating patterns beyond the grain, no full-bleed hero gradients.

**Corners.**
- 4px: tags, small pills
- 8px: buttons, inputs, menus
- 12px: cards, modals
- 16px: major panels (sidebar, editor frame)
- 999px: capsule pills (save indicator, status chip)

**Shadows & elevation.** Minimal.
- `--shadow-xs`: `0 1px 0 rgba(0,0,0,0.04)` — hairline seat under headers
- `--shadow-sm`: `0 1px 2px rgba(0,0,0,0.06)` — subtle lift on hovered cards
- `--shadow-md`: `0 6px 18px -6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)` — menus, popovers
- `--shadow-lg`: `0 18px 40px -12px rgba(0,0,0,0.22)` — modals
- No glow shadows, no colored shadows.

**Borders.**
- Hairlines: 1px at 8% of the foreground color (uses `color-mix`).
- No thick outline borders. No double borders.
- Focus uses a 2px accent ring with 2px offset — never a colored border-replace.

**Hover & press.**
- **Hover:** surface darkens in light mode, lightens in dark mode (a single `--surface-hover` token, no per-component tuning). Icons and links shift color from secondary to primary text on hover — never change saturation or hue.
- **Press:** 40ms opacity dip to 0.85 and a 1px translate down on buttons. No scale transforms.
- **Focus-visible:** 2px `--color-accent` ring, 2px offset, radius matches the component. Always visible for keyboard users.

**Motion.**
- Default: 150ms, `cubic-bezier(0.2, 0, 0, 1)` (fast start, soft land). Fades and color transitions only.
- Modals: 200ms fade + 4px translate up.
- No bounces, no springs, no page-level transitions.
- Respects `prefers-reduced-motion` — all transforms become opacity only.

**Transparency & blur.**
- The top bar uses `backdrop-filter: blur(12px)` over a 85%-opaque surface token so content scrolls behind it.
- Modals use a 40% opacity ink scrim — no blur (blur during a delete-confirm feels flashy).
- No frosted-glass sidebars, no transparent cards.

**Layout.**
- Fixed 48px top bar.
- Optional sidebar at 280px (universe context).
- Editor column is centered with a 720px max content width and 1.7 line height.
- 4px grid underpins all spacing; 8px is the smallest visible unit.

**Cards.**
- 12px radius.
- 1px hairline border (no shadow at rest).
- On hover (interactive cards only): `--shadow-sm` fades in, border gets very slightly darker. **No transform.**
- Internal padding: 20px base, 24px large.
- Title on first line, metadata row at bottom with a hairline separator above it.

**Imagery.**
- Bright has minimal imagery on purpose. When used (splash / empty states / potential future marketing), prefer warm black-and-white photography with a slight sepia lift — paper, fountain pens, type cases, desks.
- No stock "creative" imagery (people laughing with laptops). No illustration.
- Avatars and element thumbnails use a solid warm tint with initials in the display serif. Never emoji.

---

## Iconography

**Primary:** Phosphor Icons, **regular** weight (flat, single-stroke) — loaded via `@phosphor-icons/react` as in the original codebase. The single-stroke style reads cleanly at small sizes and stays quiet against the warm type, without the visual weight of duotone fills.

- **Sizes:** 14px (micro), 16px (inline), 20px (default UI), 24px (card header), 32–48px (empty states, onboarding).
- **Color:** inherits `currentColor`. Use `--color-text-secondary` at rest, `--color-primary` on active/hover.
- **Weight override:** regular by default. Use `weight="fill"` only for selected/active state on favorites and completed states; `weight="duotone"` is avoided — the two-tone fill competes with the warm type.

**Usage rules:**
- Every action button has an icon on the left, label on the right. The label is never dropped on desktop (the app has space; no icon-only buttons except for single-glyph controls like close/back).
- Empty states always get a 48px duotone icon at 40% opacity in `--color-text-secondary`.
- Element types have a fixed icon map (see `ui_kits/bright/ElementTypeIcon.jsx`). **Replace the emoji in `element-templates.json` with these mappings.**

**Element-type icon map (codifying what the codebase already does):**

| Element type | Icon | Phosphor name |
|---|---|---|
| Character | 👤 → | `User` |
| Location | 📍 → | `MapPin` |
| Vehicle | 🚗 → | `Car` |
| Item | 📦 → | `Package` |
| Organization | 🏛️ → | `Buildings` |
| Creature | 🐉 → | `Bird` |
| Event | 📅 → | `Calendar` |
| Concept | 💡 → | `Lightbulb` |

**Emoji:** never used in the UI chrome. Users may type emoji into their own writing — that's their content. Bright itself uses zero emoji.

**Unicode chars:** used sparingly. Bullet `•` separator is accepted. Em-dash `—` and en-dash `–` are expected in copy. Math/currency symbols may appear in the editor as user content. No decorative unicode.

**Logo / wordmark:** see `assets/`. The wordmark is "Bright" set in Newsreader Italic 600 — the italic differentiates it from generic brand-in-sans.

---

## Font substitutions

No font files were shipped with the codebase — typography was stack-based (`"Playfair Display", Georgia, serif` and `-apple-system, ...`). The new system loads **Newsreader**, **Geist**, and **JetBrains Mono** from Google Fonts CDN. No local `.ttf` files are needed unless the user wants offline builds.

⚠️ **If you want offline/embedded fonts**, drop the following TTF/WOFF2 files into `fonts/` and uncomment the local `@font-face` blocks in `colors_and_type.css`:
- Newsreader (Regular 400, Italic 400, Medium 500, SemiBold 600, Bold 700)
- Geist (Regular 400, Medium 500, SemiBold 600)
- JetBrains Mono (Regular 400, Medium 500)

For now, all three load from `fonts.googleapis.com`.
