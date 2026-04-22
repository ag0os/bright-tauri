# Ink & Paper alias map

Authoritative Stage 5 migration reference for the legacy alias layer frozen in:

- `src/design-system/tokens/colors/ink-and-paper.css`
- `src/design-system/tokens/typography/newsreader-geist.css`

Do not add new `--color-*`, `--typography-*`, `--font-family-*`, `--font-size-*`, `--line-height-*`, or `--font-weight-*` tokens. Migrate call sites to native Ink & Paper tokens instead.

## Color aliases

### Neutral and accent scale aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--color-gray-50` | `--ink-50` | Exact replacement. |
| `--color-gray-100` | `--ink-100` | Exact replacement. |
| `--color-gray-200` | `--ink-200` | Exact replacement. |
| `--color-gray-300` | `--ink-300` | Exact replacement. |
| `--color-gray-400` | `--ink-400` | Exact replacement. |
| `--color-gray-500` | `--ink-500` | Exact replacement. |
| `--color-gray-600` | `--ink-600` | Exact replacement. |
| `--color-gray-700` | `--ink-700` | Exact replacement. |
| `--color-gray-800` | `--ink-800` | Exact replacement. |
| `--color-gray-900` | `--ink-900` | Exact replacement. |
| `--color-gray-950` | `--ink-950` | Exact replacement. |
| `--color-indigo-50` | `--ink-50` | Exact replacement. |
| `--color-indigo-100` | `--ink-100` | Exact replacement. |
| `--color-indigo-200` | `--ink-200` | Exact replacement. |
| `--color-indigo-300` | `--ink-300` | Exact replacement. |
| `--color-indigo-400` | `--marigold-400` | Exact replacement. |
| `--color-indigo-500` | `--marigold-500` | Exact replacement. |
| `--color-indigo-600` | `--marigold-600` | Exact replacement. |
| `--color-indigo-700` | `--ink-700` | Exact replacement. |
| `--color-indigo-800` | `--ink-800` | Exact replacement. |
| `--color-indigo-900` | `--ink-850` | Exact replacement. |
| `--color-indigo-950` | `--ink-900` | Exact replacement. |
| `--color-amber-50` | `--marigold-50` | Exact replacement. |
| `--color-amber-100` | `--marigold-100` | Exact replacement. |
| `--color-amber-200` | `--marigold-200` | Exact replacement. |
| `--color-amber-300` | `--marigold-300` | Exact replacement. |
| `--color-amber-400` | `--marigold-400` | Exact replacement. |
| `--color-amber-500` | `--marigold-500` | Exact replacement. |
| `--color-amber-600` | `--marigold-600` | Exact replacement. |
| `--color-amber-700` | `--marigold-700` | Exact replacement. |
| `--color-amber-800` | `--marigold-800` | Exact replacement. |
| `--color-amber-900` | `--marigold-900` | Exact replacement. |
| `--color-red-50` | `--terracotta-500` | Alias is a `color-mix(... 10%, transparent)` soft red; no exact named native token. Prefer `--error-soft` when the intent is a semantic error surface. |
| `--color-red-500` | `--terracotta-400` | Exact replacement. |
| `--color-red-600` | `--terracotta-500` | Exact replacement. |
| `--color-red-700` | `--terracotta-600` | Exact replacement. |
| `--color-red-900` | `--terracotta-600` | Alias is a darker `color-mix` from `--terracotta-600`; no exact named native token. |
| `--color-red-950` | `--terracotta-600` | Alias is a darker `color-mix` from `--terracotta-600`; no exact named native token. |
| `--color-green-50` | `--moss-500` | Alias is a `color-mix(... 10%, transparent)` soft green; no exact named native token. Prefer `--success-soft` when the intent is a semantic success surface. |
| `--color-green-500` | `--moss-400` | Exact replacement. |
| `--color-green-600` | `--moss-500` | Exact replacement. |
| `--color-green-700` | `--moss-600` | Exact replacement. |
| `--color-green-900` | `--moss-600` | Alias is a darker `color-mix` from `--moss-600`; no exact named native token. |
| `--color-green-950` | `--moss-600` | Alias is a darker `color-mix` from `--moss-600`; no exact named native token. |

### Semantic surface, text, accent, state, and border aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--color-background` | `--bg` | Exact replacement. |
| `--color-background-primary` | `--bg` | Exact replacement. |
| `--color-background-secondary` | `--surface` | Exact replacement. |
| `--color-background-hover` | `--surface-hover` | Exact replacement. |
| `--color-surface` | `--surface` | Exact replacement. |
| `--color-surface-secondary` | `--surface-2` | Exact replacement. |
| `--color-surface-hover` | `--surface-hover` | Exact replacement. |
| `--color-hover` | `--surface-hover` | Exact replacement. |
| `--color-text-primary` | `--fg1` | Exact replacement. |
| `--color-text-secondary` | `--fg2` | Exact replacement. |
| `--color-text-tertiary` | `--fg3` | Exact replacement. |
| `--color-text-muted` | `--fg-muted` | Exact replacement. |
| `--color-text-disabled` | `--fg-disabled` | Exact replacement. |
| `--color-primary` | `--accent` | Exact replacement. |
| `--color-primary-hover` | `--accent-hover` | Exact replacement. |
| `--color-primary-active` | `--accent-active` | Exact replacement. |
| `--color-primary-subtle` | `--accent-subtle` | Exact replacement. |
| `--color-primary-bg` | `--accent-subtle` | Exact replacement. |
| `--color-primary-light` | `--accent-soft` | Exact replacement. |
| `--color-primary-ultralight` | `--accent-subtle` | Exact replacement. |
| `--color-primary-soft` | `--accent-soft` | Exact replacement. |
| `--color-primary-dark` | `--accent-active` | Exact replacement. |
| `--color-selection` | `--selection` | Exact replacement. |
| `--color-accent` | `--accent` | Exact replacement. |
| `--color-accent-hover` | `--accent-hover` | Exact replacement. |
| `--color-success` | `--success` | Exact replacement. |
| `--color-success-subtle` | `--success-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-success-bg` | `--success-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-success-light` | `--success-soft` | Exact replacement in the dark alias block. |
| `--color-semantic-success` | `--success` | Exact replacement. |
| `--color-error` | `--error` | Exact replacement. |
| `--color-error-subtle` | `--error-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-error-light` | `--error-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-semantic-error` | `--error` | Exact replacement. |
| `--color-warning` | `--warning` | Exact replacement. |
| `--color-warning-bg` | `--warning-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-warning-border` | `--amber-500` | Dark theme is exact; light theme currently overrides to `--amber-400`. |
| `--color-warning-soft` | `--warning-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-warning-light` | `--warning-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-info` | `--info` | Exact replacement. |
| `--color-info-light` | `--info-soft` | Dark theme is exact; light theme currently overrides to a lighter custom `color-mix`. |
| `--color-border` | `--border` | Exact replacement. |
| `--color-border-strong` | `--border-strong` | Exact replacement. |
| `--color-border-emphasis` | `--border-strong` | Exact replacement. |
| `--color-focus` | `--accent` | Exact replacement. |
| `--color-input-background` | `--surface-2` | Exact replacement. |

## Typography aliases

### Font-family aliases

`newsreader-geist.css` does not define any `--font-family-*` aliases.
Use the native family tokens directly:

| Legacy token | Native replacement | Notes |
| --- | --- | --- |
| `--font-family-body` | `--font-body` | Historical unsupported name still present in source; not defined in the token file. |
| `--font-family-heading` | `--font-display` | Historical unsupported name still present in source; not defined in the token file. |

### Font-weight aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--font-weight-normal` | `--fw-regular` | Exact replacement. |
| `--font-weight-medium` | `--fw-medium` | Exact replacement. |
| `--font-weight-semibold` | `--fw-semibold` | Exact replacement. |
| `--font-weight-bold` | `--fw-bold` | Exact replacement. |

### Font-size aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--font-size-xs` | `--fs-xs` | Exact replacement. |
| `--font-size-sm` | `--fs-sm` | Exact replacement. |
| `--font-size-base` | `--fs-base` | Exact replacement. |
| `--font-size-lg` | `--fs-md` | Exact replacement. |
| `--font-size-xl` | `--fs-lg` | Exact replacement. |
| `--font-size-2xl` | `--fs-xl` | Exact replacement. |
| `--font-size-3xl` | `--fs-2xl` | Exact replacement. |
| `--font-size-4xl` | `--fs-3xl` | Exact replacement. |
| `--font-size-5xl` | `--fs-4xl` | Exact replacement. |

### Line-height aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--line-height-tight` | `--lh-tight` | Exact replacement. |
| `--line-height-snug` | `--lh-snug` | Exact replacement. |
| `--line-height-normal` | `--lh-normal` | Exact replacement. |
| `--line-height-relaxed` | `--lh-reading` | No exact native token exists for the legacy `1.6` value; use `--lh-reading` for reading surfaces or `--lh-normal` for UI copy. |
| `--line-height-loose` | `--lh-reading` | Exact replacement. |
| `--line-height-body` | `--lh-reading` | Historical unsupported name still present in source; not defined in the token file. Use `--lh-normal` instead for UI body copy. |
| `--line-height-heading` | `--lh-tight` | Historical unsupported name still present in source; not defined in the token file. Use `--lh-snug` where a softer heading rhythm is intended. |

### Semantic typography aliases

| Legacy alias | Native replacement | Notes |
| --- | --- | --- |
| `--typography-heading-font` | `--font-display` | Exact replacement. |
| `--typography-body-font` | `--font-body` | Exact replacement. |
| `--typography-code-font` | `--font-mono` | Exact replacement. |
| `--typography-h1-size` | `--type-h1-size` | `--type-h1-size` resolves to `--fs-4xl`. |
| `--typography-h1-weight` | `--type-h1-weight` | `--type-h1-weight` resolves to `--fw-semibold`. |
| `--typography-h1-line-height` | `--type-h1-lh` | `--type-h1-lh` resolves to `--lh-tight`. |
| `--typography-h1-letter-spacing` | `--type-h1-tracking` | `--type-h1-tracking` resolves to `--tracking-tight`. |
| `--typography-h2-size` | `--type-h2-size` | `--type-h2-size` resolves to `--fs-3xl`. |
| `--typography-h2-weight` | `--type-h2-weight` | `--type-h2-weight` resolves to `--fw-semibold`. |
| `--typography-h2-line-height` | `--type-h2-lh` | `--type-h2-lh` resolves to `--lh-tight`. |
| `--typography-h2-letter-spacing` | `--type-h2-tracking` | `--type-h2-tracking` resolves to `--tracking-tight`. |
| `--typography-h3-size` | `--type-h3-size` | `--type-h3-size` resolves to `--fs-2xl`. |
| `--typography-h3-weight` | `--type-h3-weight` | `--type-h3-weight` resolves to `--fw-semibold`. |
| `--typography-h3-line-height` | `--type-h3-lh` | `--type-h3-lh` resolves to `--lh-snug`. |
| `--typography-h3-letter-spacing` | `--tracking-normal` | Exact replacement. |
| `--typography-h4-size` | `--type-h4-size` | `--type-h4-size` resolves to `--fs-xl`. |
| `--typography-h4-weight` | `--type-h4-weight` | `--type-h4-weight` resolves to `--fw-medium`. |
| `--typography-h4-line-height` | `--type-h4-lh` | `--type-h4-lh` resolves to `--lh-snug`. |
| `--typography-h4-letter-spacing` | `--tracking-normal` | Exact replacement. |
| `--typography-body-size` | `--type-body-size` | `--type-body-size` resolves to `--fs-base`. |
| `--typography-body-weight` | `--fw-regular` | Exact replacement. |
| `--typography-body-line-height` | `--type-body-lh` | `--type-body-lh` resolves to `--lh-normal`. |
| `--typography-body-letter-spacing` | `--tracking-normal` | Exact replacement. |
| `--typography-body-large-size` | `--fs-md` | Exact replacement. |
| `--typography-body-large-line-height` | `--lh-reading` | Exact replacement. |
| `--typography-body-small-size` | `--fs-sm` | Exact replacement. |
| `--typography-body-small-line-height` | `--lh-normal` | Exact replacement. |
| `--typography-caption-size` | `--type-caption-size` | `--type-caption-size` resolves to `--fs-2xs`. |
| `--typography-caption-weight` | `--fw-regular` | Exact replacement. |
| `--typography-caption-line-height` | `--type-caption-lh` | `--type-caption-lh` resolves to `--lh-normal`. |
| `--typography-button-size` | `--type-button-size` | `--type-button-size` resolves to `--fs-sm`. |
| `--typography-button-weight` | `--type-button-weight` | `--type-button-weight` resolves to `--fw-medium`. |
| `--typography-button-line-height` | `--lh-normal` | Exact replacement. |
| `--typography-button-letter-spacing` | `--tracking-normal` | Exact replacement. |

## Spacing decision

Spacing aliases should also be migrated for consistency during Stage 5, even though `src/design-system/tokens/spacing.css` keeps a 1:1 bridge to the base scale today.

| Alias family | Native replacement |
| --- | --- |
| `--spacing-xs` | `--spacing-2` |
| `--spacing-sm` | `--spacing-3` |
| `--spacing-md` | `--spacing-4` |
| `--spacing-lg` | `--spacing-6` |
| `--spacing-xl` | `--spacing-8` |
| `--spacing-2xl` | `--spacing-12` |
| `--spacing-3xl` | `--spacing-16` |

Apply the same consistency rule to semantic spacing wrappers like `--layout-padding-*`, `--component-gap-*`, and `--section-spacing-*`: prefer the base spacing scale or the native layout tokens already defined in `spacing.css`.
