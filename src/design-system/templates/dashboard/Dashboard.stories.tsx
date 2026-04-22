import type { Meta, StoryObj } from '@storybook/react';
import { StatsGridDashboard } from './Dashboard';
import '../../tokens/colors/ink-and-paper.css';
import '../../tokens/typography/newsreader-geist.css';

const meta = {
  title: 'Design System/4. Templates/Dashboard',
  component: StatsGridDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Dashboard: writing overview layout

**Pattern:** a dense but calm overview page for active writing work

This template combines the current Ink & Paper system:
- Warm surfaces and hairline borders
- Newsreader display headings with Geist chrome
- Phosphor regular icons
- Flat cards with restrained hover depth
- Marigold actions and progress cues

## Features
- Four writing metrics at the top
- Recent document list with status pills
- Universe summary section
- Quick actions sidebar
- Weekly goal progress
- High information density without glossy dashboard chrome

## Accessibility
- AA contrast across cards and controls
- Focus indicators on interactive elements
- Keyboard-accessible actions
- Clear section hierarchy and readable metadata
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
## Writing desk dashboard

**Best for:** overview screens where writers want recent work, progress, and worldbuilding context on one page

### Layout structure
- **Top stats row:** headline metrics for words, active stories, streak, and universe scope
- **Main column:** recent documents and universe summary
- **Sidebar:** quick actions and weekly goal tracking
- **Navigation:** minimal top bar to keep chrome compact

### Ink & Paper traits
- Surface cards stay flat at rest with 12px corners
- Hover depth is subtle rather than lift-heavy
- Editorial headings use Newsreader while metadata stays in Geist
- Accent usage is limited to actions, pills, and progress

### Use case
This template works when a writer needs orientation before diving back into a draft, but the page should still feel warm and editorial rather than like a generic analytics product.
        `,
      },
    },
  },
};
