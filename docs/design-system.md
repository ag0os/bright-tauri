# Ink & Paper design system

Bright uses **Ink & Paper**: warm ink surfaces, a single marigold accent, Newsreader for editorial reading, Geist for UI chrome, flat components, restrained motion, and hairline borders.

## References

- Agent skill: `.claude/skills/ink-and-paper/SKILL.md`
- Exported source package: `docs/design-reference/`
- Token source: `docs/design-reference/project/colors_and_type.css`

`docs/design-reference/` is read-only. Re-export it if the upstream package changes. This document is the canonical prose reference for the production app.

## Theme modes

- **Dark** is the default mode from `:root`.
- **Light** mode is enabled with `:root[data-theme="light"]` or `.theme-light`.
- Every visual change must be checked in both modes: page background, surfaces, text hierarchy, borders, focus rings, selection color, and interactive states.
- Use the shared theme tokens. Do not hard-code one-off dark or light values inside components.

## Native token table

### Surfaces, text, accent, and state

| Token | Dark default | Light mode | Purpose |
| --- | --- | --- | --- |
| `--bg` | `#15120E` | `#FAF7F1` | App background |
| `--bg-deep` | `#0C0A07` | `#F5EFE4` | Deep backdrop areas |
| `--surface` | `#1F1B15` | `#FFFFFF` | Default panel/card surface |
| `--surface-2` | `#2A251D` | `#F5EFE4` | Nested surface |
| `--surface-raised` | `#3A3328` | `#FFFFFF` | Raised panels and menus |
| `--surface-hover` | color-mix from `--surface-2` | color-mix from `--ink-100` | Hover fill |
| `--surface-active` | color-mix from `--surface-2` | color-mix from `--ink-100` | Pressed/selected fill |
| `--scrim` | `rgba(12, 10, 7, 0.6)` | `rgba(21, 18, 14, 0.4)` | Modal backdrop |
| `--fg1` | `var(--ink-100)` | `#1A1712` | Primary text |
| `--fg2` | `var(--ink-300)` | `var(--ink-600)` | Secondary text |
| `--fg3` | `var(--ink-400)` | `var(--ink-500)` | Tertiary/meta text |
| `--fg-muted` | `var(--ink-500)` | `var(--ink-400)` | Placeholder/subtle text |
| `--fg-disabled` | `var(--ink-600)` | `var(--ink-300)` | Disabled text |
| `--fg-on-accent` | `var(--ink-950)` | `#FFFFFF` | Text on primary accent |
| `--accent` | `#D97706` | `#B45309` | Primary accent |
| `--accent-hover` | `#E29A22` | `#D97706` | Hovered primary action |
| `--accent-active` | `#B45309` | `#8B3F0A` | Pressed primary action |
| `--accent-soft` | marigold at `18%` | marigold at `14%` | Selected/soft fill |
| `--accent-subtle` | marigold at `10%` | marigold at `8%` | Very light emphasis |
| `--success` | `#4A9C73` | `#2F7A53` | Success text/icon |
| `--success-soft` | moss at `18%` | moss at `18%` | Success fill |
| `--error` | `#D15A3C` | `#B0391F` | Error text/icon |
| `--error-soft` | terracotta at `18%` | terracotta at `18%` | Error fill |
| `--warning` | `#D99944` | `#B45309` | Warning text/icon |
| `--warning-soft` | amber at `18%` | amber at `18%` | Warning fill |
| `--info` | `#6E8CC0` | `#4C6EA8` | Informational text/icon |
| `--info-soft` | ink blue at `18%` | ink blue at `18%` | Informational fill |
| `--border` | `var(--fg1)` at `8%` | `var(--fg1)` at `10%` | Default hairline border |
| `--border-strong` | `var(--fg1)` at `16%` | `var(--fg1)` at `20%` | Stronger separator |
| `--border-accent` | `var(--accent)` | `var(--accent)` | Accent border |
| `--ring` | `var(--accent)` | `var(--accent)` | Focus ring |
| `--selection` | marigold at `30%` | marigold at `25%` | Text selection |

### Fonts and weights

| Token | Value | Use |
| --- | --- | --- |
| `--font-display` | `"Newsreader", "Iowan Old Style", "Hoefler Text", Georgia, serif` | Reading text and editorial headings |
| `--font-body` | `"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif` | UI chrome, labels, controls |
| `--font-mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | Counts, timestamps, code-like data |
| `--fw-regular` | `400` | Default body weight |
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

### Line-height and tracking scale

| Token | Value | Use |
| --- | --- | --- |
| `--lh-tight` | `1.15` | H1/H2 |
| `--lh-snug` | `1.3` | H3/H4 |
| `--lh-normal` | `1.5` | UI body copy |
| `--lh-reading` | `1.7` | Reading/editor text |
| `--tracking-tight` | `-0.02em` | Display headings |
| `--tracking-normal` | `0` | Default |
| `--tracking-wide` | `0.04em` | Rare wide-label use |

### Layout scale

| Token | Value | Use |
| --- | --- | --- |
| `--layout-topbar-h` | `48px` | Top bar height |
| `--layout-sidebar-w` | `280px` | Sidebar width |
| `--layout-content-w` | `1200px` | Wide content max width |
| `--layout-reading-w` | `720px` | Reading/editor column width |
| `--layout-gutter` | `24px` | Standard page gutter |

### Radius scale

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | `4px` | Tags and small pills |
| `--radius-sm` | `6px` | Compact controls |
| `--radius-md` | `8px` | Buttons, inputs, menus |
| `--radius-lg` | `12px` | Cards, modals |
| `--radius-xl` | `16px` | Major panels |
| `--radius-full` | `999px` | Capsule chips |

### Shadow scale

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-xs` | `0 1px 0 rgba(0, 0, 0, 0.04)` | Header seam |
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.06)` | Subtle hover depth |
| `--shadow-md` | `0 6px 18px -6px rgba(0, 0, 0, 0.30), 0 2px 4px rgba(0, 0, 0, 0.12)` | Menus and popovers |
| `--shadow-lg` | `0 18px 40px -12px rgba(0, 0, 0, 0.45), 0 6px 12px rgba(0, 0, 0, 0.18)` | Modals |
| `--shadow-inset` | `inset 0 1px 0 rgba(0, 0, 0, 0.08)` | Filled inputs |

## Typography

### UI chrome

- Use `var(--font-body)` (Geist) for controls, navigation, metadata, and app chrome.
- UI body copy sits on the main UI scale: `var(--fs-base)` with `var(--lh-normal)`.
- H4 and smaller utility headings stay on Geist to keep the interface quiet and functional.

### Reading surface

- Use `var(--font-display)` (Newsreader) for story text and editorial headings.
- Canonical reading values:
  - `font-family: var(--font-display)`
  - `font-size: var(--fs-md)`
  - `line-height: var(--lh-reading)`
  - `max-width: var(--layout-reading-w)`
- Keep the reading column visibly distinct from chrome so writing feels like paper on a desk, not text inside a dashboard.

## Iconography

- Use **Phosphor** icons.
- Default to regular weight; omit `weight` unless a stateful exception is needed.
- Use `weight="fill"` only for active or selected states.
- Do **not** use `weight="duotone"`.
- Icons inherit `currentColor`; state changes come from text/color tokens, not decorative multicolor fills.

## Component patterns

### Surfaces and cards

- Cards are flat by default.
- Use a warm surface token plus a `1px` hairline border.
- Interactive cards may add `--shadow-sm` on hover, but **do not** translate or scale on hover.
- Use `12px` radius for cards and `16px` for major panels.

### Buttons, inputs, and controls

- Use `8px` radius for most controls.
- Focus-visible uses the accent ring; do not replace focus with a border-only treatment.
- Hover and press should change fill, border, or opacity first. Avoid dramatic motion.

### Background treatment

- The app-level background can carry the paper-grain treatment from the Ink & Paper package.
- Do not apply grain to every nested component.
- No glossy gradients or cold SaaS-style chrome.

## Voice and tone

Voice and tone rules live in `docs/design-reference/README.md`, which points to the exported package guidance in `docs/design-reference/project/README.md`.

Use these defaults in UI copy:

- Quiet, warm, and craft-oriented.
- Sentence case everywhere.
- Conversational, but never chirpy.
- Present tense and active voice.
- No emoji in product UI.
- Treat the user as a working writer, not a generic SaaS customer.

## Alias retirement

Legacy aliases from the previous token layer are being retired in **Stage 5** of the Ink & Paper migration cleanup.

- Do not introduce new `var(--color-*)`, `var(--typography-*)`, `var(--font-family-*)`, `var(--font-size-*)`, `var(--line-height-*)`, or `var(--font-weight-*)` references.
- New code should use the native tokens documented above.
- For current status and agent-specific guidance, load `.claude/skills/ink-and-paper/SKILL.md`.

## Working rules

1. Start with native tokens.
2. Test both theme modes.
3. Keep UI chrome in Geist and reading text in Newsreader.
4. Keep icons regular; reserve `fill` for active state.
5. Prefer flat surfaces, hairline borders, and restrained motion.
6. If a new pattern is needed, align it with the exported reference package before implementation.
