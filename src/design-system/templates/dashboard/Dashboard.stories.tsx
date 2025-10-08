import type { Meta, StoryObj } from '@storybook/react';
import { StatsGridDashboard } from './Dashboard';
import '../../tokens/colors/modern-indigo.css';
import '../../tokens/typography/classic-serif.css';

const meta = {
  title: 'Design System/4. Templates/Dashboard',
  component: StatsGridDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Dashboard: Stats Grid Layout

**Pattern:** Analytics-focused dashboard with comprehensive data visibility

Complete page layout integrating all design system tokens:
- **Phase 1:** Modern Indigo colors, Classic Serif typography, Lucide icons
- **Phase 2:** Minimal Squared buttons, Filled Background inputs
- **Phase 3:** Elevated Shadow cards, Minimal Top Bar navigation

## Features
- 4-stat grid showing key metrics with trends
- Recent documents list with status badges
- Universe elements section
- Quick actions sidebar
- Writing goal progress tracker
- High information density

## Accessibility
- ✅ AA contrast on all text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Clear visual hierarchy
- ✅ Proper spacing and alignment
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsGridDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
## Stats Grid Dashboard - Analytics Focus

**Best for:** Users who want comprehensive overview and maximum data visibility

### Layout Structure
- **Top Stats Grid:** 4 key metrics in card grid (total words, projects, streak, characters)
- **Main Content:** Two-column layout
  - Primary: Recent documents, Universe elements
  - Sidebar: Quick actions, Writing goal progress
- **Navigation:** Minimal top bar (48px)

### Key Features
- Prominent stats cards with trends (+/- indicators)
- Organized sections with "View all" actions
- Document list with status badges
- Quick action buttons for common tasks
- Visual progress indicators
- Hover effects on interactive cards

### Information Density
- **High:** Shows maximum information at once
- Stats, documents, universe, and goals all visible
- Perfect for users who want an overview without clicking

### Use Case
Perfect for users who:
- Track multiple projects simultaneously
- Want to see progress metrics at a glance
- Need quick access to recent work
- Prefer traditional dashboard layouts with clear organization
        `,
      },
    },
  },
};
