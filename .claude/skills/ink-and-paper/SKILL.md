---
name: ink-and-paper
description: Use when editing UI, CSS, React components, Storybook stories, design tokens, editor styling, or frontend visuals under src/design-system/, src/editor/, src/features/**/*.css, or *.tsx files that change layout, color, typography, spacing, cards, buttons, inputs, icons, or themes. Triggers on Ink & Paper, tokens, theme, Newsreader, Geist, marigold, Phosphor, typography, radius, surface, accent, component styling, and dark/light mode. Do not load for Rust, Tauri commands, repositories, migrations, or backend-only work.
allowed-tools: Bash, Read, Edit, Write
---

# Ink & Paper

## Objective

Keep Bright's UI aligned with the Ink & Paper system: warm ink surfaces, a single marigold accent, Newsreader for reading, Geist for chrome, flat components, restrained motion, and native tokens only.

## Source of truth

- Canonical prose reference: `docs/design-system.md`
- Exported design package: `docs/design-reference/`
- Token source: `docs/design-reference/project/colors_and_type.css`
- Voice and tone source: `docs/design-reference/README.md` → `docs/design-reference/project/README.md`

## Alias-retirement status

**aliases frozen, migration in progress — do not introduce `var(--color-*)`, `var(--typography-*)`, `var(--font-family-*)`, `var(--font-size-*)`, `var(--line-height-*)`, or `var(--font-weight-*)`.** New code uses native Ink & Paper tokens only. Stage 5 removes the legacy alias layer.

## Theme modes

- Dark is the default mode from `:root`.
- Light mode is enabled with `:root[data-theme="light"]` or `.theme-light`.
- QA every visual change in both modes. At minimum: page background, cards, borders, focus ring, hover state, selected state, empty states, and editor selection.
- When testing manually, toggle the root theme attribute instead of introducing one-off component overrides.

## Native token table

### Color and surface tokens

| Token | Value / role | Use |
| --- | --- | --- |
| `--bg` | dark `#15120E`, light `#FAF7F1` | App background |
| `--bg-deep` | dark `#0C0A07`, light `#F5EFE4` | Deepest backdrop areas |
| `--surface` | dark `#1F1B15`, light `#FFFFFF` | Default cards, panels, inputs |
| `--surface-2` | dark `#2A251D`, light `#F5EFE4` | Nested surfaces |
| `--surface-raised` | dark `#3A3328`, light `#FFFFFF` | Raised panels, menus |
| `--surface-hover` | mode-aware color-mix | Hover fill |
| `--surface-active` | mode-aware color-mix | Pressed/selected fill |
| `--scrim` | dark `rgba(12, 10, 7, 0.6)`, light `rgba(21, 18, 14, 0.4)` | Modal backdrop |
| `--fg1` | primary text | Main text |
| `--fg2` | secondary text | Supporting text |
| `--fg3` | tertiary text | Metadata |
| `--fg-muted` | muted text | Placeholder, subtle labels |
| `--fg-disabled` | disabled text | Disabled controls |
| `--fg-on-accent` | text on accent | Primary buttons |
| `--accent` | dark `#D97706`, light `#B45309` | Primary accent |
| `--accent-hover` | lighter/darker accent per mode | Hovered primary actions |
| `--accent-active` | pressed accent | Pressed primary actions |
| `--accent-soft` | translucent accent mix | Selected fills, chips |
| `--accent-subtle` | lighter translucent accent mix | Very light emphasis |
| `--success` | moss green | Success state |
| `--success-soft` | translucent success | Success background |
| `--error` | terracotta | Error state |
| `--error-soft` | translucent error | Error background |
| `--warning` | warm amber | Warning state |
| `--warning-soft` | translucent warning | Warning background |
| `--info` | ink blue | Informational state |
| `--info-soft` | translucent info | Informational background |
| `--border` | hairline border | Default borders |
| `--border-strong` | stronger hairline border | Section separators |
| `--border-accent` | accent border | Accent-emphasis border |
| `--ring` | accent ring | Focus-visible ring |
| `--selection` | translucent marigold mix | Text selection |

### Font families and weights

| Token | Value | Use |
| --- | --- | --- |
| `--font-display` | Newsreader | Reading surface, editorial headings |
| `--font-body` | Geist | App chrome, labels, controls |
| `--font-mono` | JetBrains Mono | Counts, timestamps, code-like data |
| `--fw-regular` | `400` | Default |
| `--fw-medium` | `500` | Controls, emphasized UI text |
| `--fw-semibold` | `600` | Section headings |
| `--fw-bold` | `700` | Strong emphasis |

### Font-size scale

| Token | Value |
| --- | --- |
| `--fs-2xs` | `12px` |
| `--fs-xs` | `13px` |
| `--fs-sm` | `14px` |
| `--fs-base` | `15px` |
| `--fs-md` | `17px` |
| `--fs-lg` | `19px` |
| `--fs-xl` | `22px` |
| `--fs-2xl` | `28px` |
| `--fs-3xl` | `36px` |
| `--fs-4xl` | `48px` |
| `--fs-5xl` | `64px` |

### Line-height scale

| Token | Value | Use |
| --- | --- | --- |
| `--lh-tight` | `1.15` | Display headings |
| `--lh-snug` | `1.3` | Secondary headings |
| `--lh-normal` | `1.5` | UI body copy |
| `--lh-reading` | `1.7` | Reading/editor text |

### Radius tokens

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | `4px` | Small pills, tags |
| `--radius-sm` | `6px` | Compact controls |
| `--radius-md` | `8px` | Buttons, inputs, menus |
| `--radius-lg` | `12px` | Cards, modals |
| `--radius-xl` | `16px` | Major panels |
| `--radius-full` | `999px` | Capsule chips |

### Shadow and layout tokens

| Token | Value / role | Use |
| --- | --- | --- |
| `--shadow-xs` | minimal seat shadow | Header seams |
| `--shadow-sm` | subtle lift | Hovered interactive cards |
| `--shadow-md` | menu/popover depth | Popovers |
| `--shadow-lg` | modal depth | Modals |
| `--shadow-inset` | inset line | Filled inputs |
| `--layout-topbar-h` | `48px` | Top bar height |
| `--layout-sidebar-w` | `280px` | Sidebar width |
| `--layout-content-w` | `1200px` | Wide content max width |
| `--layout-reading-w` | `720px` | Reading/editor column |
| `--layout-gutter` | `24px` | Standard page gutter |

## Typography rules

- UI chrome uses `var(--font-body)` (Geist) with the UI scale around `--fs-base` / `--lh-normal`.
- Reading surfaces use `var(--font-display)` (Newsreader) at `var(--fs-md)` with `var(--lh-reading)` and `max-width: var(--layout-reading-w)`.
- Headings H1-H3 use Newsreader; H4 and smaller chrome labels stay on Geist.
- Keep story text visibly distinct from surrounding controls.

## Iconography

- Use Phosphor icons.
- Default weight is regular; omit the `weight` prop unless you need a stateful exception.
- `weight="fill"` is for active or selected states only.
- Never use `weight="duotone"`.
- Icons inherit `currentColor`; use text color changes, not custom decorative fills.

## Component patterns

- Cards are flat by default: hairline border, warm surface, no resting elevation.
- Hover changes fill and border strength; no hover transform, no scale, no lift animation.
- Prefer `--radius-md`, `--radius-lg`, and `--radius-xl` for most work: 8 / 12 / 16.
- Use the paper-grain background treatment on app-level surfaces, not on every nested component.
- Keep motion restrained: short fades and color transitions, not bouncy transforms.

## Voice and tone

Follow `docs/design-reference/README.md`, which points to the exported package's content rules in `docs/design-reference/project/README.md`.

- Quiet, warm, craft-oriented.
- Sentence case everywhere.
- Conversational, never chirpy.
- Present tense, active voice.
- No emoji in product UI.
- Treat the user as a working writer, not a generic SaaS user.

## Working checklist

1. Start from native tokens, not aliases.
2. Verify dark and light mode.
3. Keep chrome in Geist and reading text in Newsreader.
4. Keep icons regular; `fill` only for active state.
5. Prefer flat surfaces with hairline borders.
6. Re-check `docs/design-system.md` before introducing a new visual pattern.
