# Design System

This document describes the design system for Bright, a desktop writing application built with Tauri, React, and TypeScript.

## Overview

The design system follows a token-first, atomic design methodology, progressing from foundational design tokens through atoms, organisms, and templates. All components are optimized for desktop applications with a focus on writing and content creation workflows.

## Quick Reference

- **Location**: `src/design-system/`
- **Storybook**: Run `npm run storybook` to view components at `http://localhost:6006`
- **CSS Methodology**: Design tokens implemented as CSS custom properties
- **Component Library**: React components with TypeScript

## Design Decisions

### Phase 1: Foundations

#### Colors - Modern Indigo
**File**: `src/design-system/tokens/colors/modern-indigo.css`

Professional blue/indigo palette with warm amber accents, optimized for long writing sessions.

**Color Palette**:
- **Primary**: Indigo (#4F46E5, #6366F1, #818CF8)
- **Secondary**: Amber (#F59E0B, #FBBF24, #FCD34D)
- **Neutrals**: Gray scale from #111827 to #F9FAFB
- **Semantic**: Success (green), warning (amber), error (red), info (blue)

**Accessibility**: All text colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

**Use Cases**:
- Professional writing tools
- Dashboard analytics
- Long reading sessions
- Desktop-first applications

---

#### Typography - Classic Serif
**File**: `src/design-system/tokens/typography/classic-serif.css`

Elegant serif headings paired with clean sans-serif body text, using a 1.250 (Major Third) type scale.

**Font Families**:
- **Headings**: Playfair Display (serif, elegant, authoritative)
- **Body**: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, etc.)
- **Monospace**: SF Mono, Consolas, Monaco, 'Courier New'

**Type Scale** (1.250 ratio):
- `--font-size-xs`: 0.64rem (10.24px)
- `--font-size-sm`: 0.8rem (12.8px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.25rem (20px)
- `--font-size-xl`: 1.563rem (25px)
- `--font-size-2xl`: 1.953rem (31.25px)
- `--font-size-3xl`: 2.441rem (39.06px)
- `--font-size-4xl`: 3.052rem (48.83px)

**Heading Sizes**:
- H1: 2.441rem (bold)
- H2: 1.953rem (semibold)
- H3: 1.563rem (semibold)
- H4: 1.25rem (semibold)
- H5: 1rem (semibold)
- H6: 1rem (medium)

**Use Cases**:
- Literary applications
- Long-form content
- Professional publishing tools
- Editorial interfaces

---

#### Icons - Lucide Icons
**File**: `src/design-system/tokens/icons/lucide.css`

Modern line-based icon library with adjustable stroke width.

**Features**:
- Consistent 24x24px grid
- 2px default stroke width
- Scalable and customizable
- React component library: `lucide-react`

**Sizes**:
- Small: 16px
- Base: 20px
- Large: 24px

**Installation**:
```bash
npm install lucide-react
```

**Usage**:
```typescript
import { FileText, Users, Star } from 'lucide-react';

<FileText size={20} />
```

---

### Phase 2: Atoms

#### Buttons - Minimal Squared
**File**: `src/design-system/tokens/atoms/button/minimal-squared.css`

Clean, minimal buttons with squared corners and compact spacing.

**Design Features**:
- **Border Radius**: 4px (clean, minimal aesthetic)
- **Padding**: 8px/16px (compact, dense interfaces)
- **Focus Ring**: 2px subtle ring
- **Min Height**: 40px base size
- **Font Weight**: Medium (lighter feel)

**Variants**:
- **Primary**: Filled with primary color (`btn-primary`)
- **Secondary**: Outlined with border (`btn-secondary`)
- **Outline**: Bordered with transparent background (`btn-outline`)
- **Ghost**: No background or border (`btn-ghost`)

**Sizes**:
- Small: 32px min-height (`btn-sm`)
- Base: 40px min-height (`btn-base`)
- Large: 48px min-height (`btn-lg`)

**States**:
- Default
- Hover (subtle background change)
- Active/Pressed (slightly darker)
- Disabled (reduced opacity, no interaction)
- Focus (2px ring for keyboard navigation)

**Usage**:
```tsx
<button className="btn btn-primary btn-base">Save</button>
<button className="btn btn-outline btn-sm">Cancel</button>
<button className="btn btn-ghost btn-lg">Delete</button>
```

---

#### Inputs - Filled Background
**File**: `src/design-system/tokens/atoms/input/filled-background.css`

Material Design-inspired inputs with filled background and no default border.

**Design Features**:
- **Background**: Gray fill (#f3f4f6)
- **Border**: None by default, 2px primary border on focus
- **Border Radius**: 6px
- **Label**: Positioned above input
- **Min Height**: 44px (accessible touch target)

**States**:
- Default (gray fill, no border)
- Focus (primary border appears)
- Error (red border and text)
- Disabled (reduced opacity)
- Required (asterisk indicator)

**Features**:
- Helper text support
- Prefix/suffix icon slots
- Error message display
- Size variants (sm, base, lg)

**Usage**:
```tsx
<div className="input-group input-5">
  <label className="input-label" htmlFor="email">
    Email Address
    <span className="required">*</span>
  </label>
  <div className="input-wrapper">
    <input
      id="email"
      type="email"
      className="input-field input-base"
      placeholder="you@example.com"
    />
  </div>
  <div className="input-helper">Enter your email address</div>
</div>
```

---

### Phase 3: Organisms

#### Cards - Elevated Shadow
**File**: `src/design-system/tokens/organisms/card/elevated-shadow.css`

Shadow-based depth hierarchy with no borders for clean, modern appearance.

**Design Features**:
- **Border Radius**: 8px
- **Shadows**: Three levels (sm, base, lg)
- **Hover**: Lift effect (-2px transform + larger shadow)
- **No Borders**: Clean, minimal look
- **Padding**: 16px/24px/32px

**Shadow Levels**:
- **Small**: `0 1px 2px rgba(0,0,0,0.05)`
- **Base**: `0 4px 6px rgba(0,0,0,0.1)`
- **Large**: `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)`

**Variants**:
- Basic card (static)
- Interactive card (hover effects)
- Stat card (with metrics)

**Structure**:
```tsx
<div className="card-1">
  <div className="card-1__header">
    <h3 className="card-1__title">Card Title</h3>
  </div>
  <div className="card-1__body">
    Card content goes here
  </div>
  <div className="card-1__footer">
    <button className="btn btn-primary btn-base">Action</button>
  </div>
</div>
```

---

#### Navigation - Minimal Top Bar
**File**: `src/design-system/organisms/navigation/minimal-topbar.css`

Slim single top bar for focused, distraction-free writing interfaces.

**Design Features**:
- **Height**: 48px (maximum content space)
- **Layout**: Three-column (left, center, right)
- **Centered**: Breadcrumb navigation
- **Minimal**: Essential actions only
- **Auto-save**: Status indicator

**Layout Sections**:
- **Left**: Navigation controls (menu, back/forward)
- **Center**: Breadcrumb context
- **Right**: Actions (search, command palette, new item)

**Features**:
- Auto-save indicator with animation
- Breadcrumb trail (project → section → document)
- Icon-only buttons for common actions
- Optional auto-hide on scroll

**Use Cases**:
- Writing applications (Notion-style)
- Content editors
- Distraction-free interfaces
- Desktop-first tools

---

### Phase 4: Templates

#### Dashboard - Stats Grid
**File**: `src/design-system/templates/dashboard/stats-grid.css`

Analytics-focused dashboard with comprehensive data visibility.

**Layout Structure**:
- **Top Stats Grid**: 4 key metrics in card grid
- **Main Content**: Two-column layout
  - Primary: Recent documents, Universe elements
  - Sidebar: Quick actions, Writing goal progress
- **Navigation**: Minimal top bar (48px)

**Key Features**:
- Prominent stats cards with trend indicators
- Document list with status badges
- Quick action buttons
- Visual progress indicators
- High information density
- Organized sections with "View all" links

**Information Density**: High - shows maximum information at once without requiring clicks.

**Use Case**:
Perfect for users who:
- Track multiple projects simultaneously
- Want to see progress metrics at a glance
- Need quick access to recent work
- Prefer traditional dashboard layouts with clear organization

---

## File Structure

```
src/design-system/
├── tokens/
│   ├── colors/
│   │   └── modern-indigo.css
│   ├── typography/
│   │   └── classic-serif.css
│   ├── icons/
│   │   └── lucide.css
│   └── atoms/
│       ├── button/
│       │   └── minimal-squared.css
│       └── input/
│           └── filled-background.css
├── organisms/
│   ├── card/
│   │   ├── elevated-shadow.css
│   │   ├── Card.tsx
│   │   └── Card.stories.tsx
│   └── navigation/
│       ├── minimal-topbar.css
│       ├── Navigation.tsx
│       └── Navigation.stories.tsx
├── templates/
│   └── dashboard/
│       ├── stats-grid.css
│       ├── Dashboard.tsx
│       └── Dashboard.stories.tsx
└── stories/
    ├── ColorTokens.stories.tsx
    ├── TypographyTokens.stories.tsx
    ├── IconTokens.stories.tsx
    ├── ButtonTokens.stories.tsx
    ├── InputTokens.stories.tsx
    └── CardTokens.stories.tsx
```

---

## Using the Design System

### 1. Import CSS Tokens

Import the design tokens you need in your component or story:

```typescript
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';
import '../tokens/atoms/button/minimal-squared.css';
```

### 2. Use CSS Custom Properties

All tokens are available as CSS custom properties (CSS variables):

```css
.my-component {
  color: var(--color-primary);
  font-family: var(--typography-body-font);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
}
```

### 3. Use Pre-built Components

Import and use the React components:

```typescript
import { MinimalTopBar } from '@/design-system/organisms/navigation/Navigation';
import { StatsGridDashboard } from '@/design-system/templates/dashboard/Dashboard';

function App() {
  return (
    <>
      <MinimalTopBar />
      <StatsGridDashboard />
    </>
  );
}
```

### 4. Apply Utility Classes

Use the predefined CSS classes:

```tsx
<button className="btn btn-primary btn-base">
  Save Changes
</button>

<div className="input-group input-5">
  <label className="input-label">Email</label>
  <input className="input-field input-base" type="email" />
</div>
```

---

## Storybook Development

### Running Storybook

```bash
npm run storybook
```

Storybook will open at `http://localhost:6006`

### Story Organization

Stories are organized hierarchically:

1. **Foundations**: Colors, Typography, Icons
2. **Atoms**: Buttons, Inputs
3. **Organisms**: Cards, Navigation
4. **Templates**: Dashboard

### Viewing Components

Navigate through the sidebar to explore each component:
- See all variants and states
- View accessibility features
- Test interactive behaviors
- Copy code examples

---

## Accessibility

All components meet WCAG AA standards:

- ✅ **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- ✅ **Focus Indicators**: Visible focus rings on all interactive elements
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Touch Targets**: Minimum 44px height for all interactive elements
- ✅ **Screen Reader Support**: Proper ARIA labels and semantic HTML

---

## Design Principles

1. **Token-First**: Start with design tokens, build up to components
2. **Consistency**: Reuse tokens across all components
3. **Accessibility**: WCAG AA compliance by default
4. **Desktop-Optimized**: Designed for desktop writing applications
5. **Distraction-Free**: Minimal chrome, maximum content focus
6. **Clarity**: Clear visual hierarchy and organization

---

## Extending the Design System

### Adding New Tokens

1. Create new CSS file in appropriate tokens directory
2. Define CSS custom properties
3. Import in components/stories that need them
4. Document in this file

### Adding New Components

1. Create component in appropriate directory (atoms/organisms/templates)
2. Create corresponding CSS file
3. Create Storybook story file
4. Import design tokens
5. Test accessibility
6. Document usage

### Contributing

When adding or modifying components:
- Maintain consistency with existing design tokens
- Test all states (default, hover, active, disabled, focus)
- Verify WCAG AA contrast ratios
- Add Storybook stories showing all variants
- Update this documentation

---

## Resources

- **Storybook**: `http://localhost:6006` (when running)
- **Lucide Icons**: https://lucide.dev
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Version History

- **v1.0** (2025-10-08): Initial design system with all phases complete
  - Phase 1: Foundations (Colors, Typography, Icons)
  - Phase 2: Atoms (Buttons, Inputs)
  - Phase 3: Organisms (Cards, Navigation)
  - Phase 4: Templates (Dashboard)
