import type { Meta, StoryObj } from '@storybook/react';
import { Dashboard } from './Dashboard';
import '../../tokens/colors/option1-modern-indigo.css';
import '../../tokens/typography/option1-classic-serif.css';

const meta = {
  title: 'Phase 4.1 - Dashboard Layout',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Phase 4.1: Dashboard Layout (Writing App)

**Current Decision:** Dashboard layout pattern for a desktop writing/creation app.

These dashboards integrate ALL design system tokens from previous phases:
- **Phase 1:** Modern Indigo colors, Classic Serif typography, Lucide icons
- **Phase 2:** Minimal Squared buttons, Filled Background inputs
- **Phase 3:** Elevated Shadow cards, Minimal Top Bar navigation

## Key Features
Each dashboard demonstrates:
- Complete page layout with navigation
- Stats/metrics display
- Recent documents/projects
- Quick actions
- Universe elements (characters, locations)
- Writing goals and progress tracking
- Empty states (where applicable)
- Loading states (where applicable)

## Quality Gates
- ✅ AA contrast on all text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Clear visual hierarchy
- ✅ Consistent token usage throughout
- ✅ Responsive grid layouts
- ✅ Proper spacing and alignment
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['option1', 'option2', 'option3'],
      description: 'Dashboard layout variant to display',
    },
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Option1_StatsGrid: Story = {
  args: {
    variant: 'option1',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 1: Stats Grid Dashboard (Analytics Focus)

**Best for:** Users who want comprehensive overview and data visibility

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
- Good for users who want overview without clicking

### Use Case
Perfect for users who:
- Track multiple projects simultaneously
- Want to see progress metrics at a glance
- Need quick access to recent work
- Prefer traditional dashboard layouts

### Pros
- Maximum information visibility
- Clear organization with sections
- Easy to scan and navigate
- Familiar card-based layout

### Cons
- Can feel dense for minimal workflows
- Requires scrolling to see all content
        `,
      },
    },
  },
};

export const Option2_FocusMode: Story = {
  args: {
    variant: 'option2',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 2: Focus Mode Dashboard (Creator-First)

**Best for:** Writers who want to jump back into work immediately

### Layout Structure
- **Compact Stats Bar:** Horizontal bar with 4 key metrics (words, goal %, streak, time)
- **Hero Focus Card:** Large "Continue Writing" card with gradient background
  - Current chapter/document
  - Progress bar and word count
  - Prominent action button
- **Recent Projects Grid:** Card grid below focus area
- **Sidebar:** Recent activity timeline, Quick create buttons

### Key Features
- Eye-catching gradient hero card
- Clear "Continue Writing" call-to-action
- Chapter/document progress visualization
- Minimal distraction from main goal
- Activity feed shows recent changes
- One-click project creation

### Information Density
- **Medium:** Focuses on most important info
- Highlights active work prominently
- Supporting info available but not dominant

### Use Case
Perfect for users who:
- Want to resume writing quickly
- Work on one project at a time
- Value focus over comprehensive data
- Prefer visual hierarchy and clear CTAs

### Pros
- Immediate focus on current work
- Visually appealing gradient card
- Clear progress indication
- Motivating design
- Fast access to continue writing

### Cons
- Less overview of all projects
- Requires navigation for detailed stats
        `,
      },
    },
  },
};

export const Option3_TimelineActivity: Story = {
  args: {
    variant: 'option3',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 3: Timeline Activity Dashboard (Progress Tracking)

**Best for:** Users motivated by tracking progress and streaks

### Layout Structure
- **Greeting Header:** Personalized welcome with date
- **Two-Column Layout:**
  - Left: Timeline of today's activity, Streak card
  - Right: Writing goals grid, Active projects with progress
- **Navigation:** Minimal top bar (48px)

### Key Features
- Vertical timeline showing chronological activity
- Visual streak card with day indicators (M-T-W-T-F-S-S)
- Goal cards with progress bars and targets
- Project cards with cover art and detailed stats
- Completion indicators on timeline
- Motivational streak visualization

### Information Density
- **Medium-High:** Balanced detail with visual organization
- Timeline provides context
- Goals show both current and target
- Projects display comprehensive metrics

### Use Case
Perfect for users who:
- Are motivated by streaks and consistency
- Want to see writing history/activity
- Track daily/weekly goals
- Enjoy gamification elements
- Need progress visibility

### Pros
- Motivating streak visualization
- Clear goal tracking
- Historical context via timeline
- Detailed project progress
- Engaging visual design

### Cons
- Timeline may feel cluttered with many activities
- Less emphasis on "continue writing" action
        `,
      },
    },
  },
};

// Comparison View
export const AllOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '24px', background: 'var(--color-background)' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 1: Stats Grid (Analytics Focus)</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
          <Dashboard variant="option1" />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 2: Focus Mode (Creator-First)</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
          <Dashboard variant="option2" />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 3: Timeline Activity (Progress Tracking)</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
          <Dashboard variant="option3" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all three dashboard layout options.',
      },
    },
  },
};
