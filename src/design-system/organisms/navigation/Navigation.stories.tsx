import type { Meta, StoryObj } from '@storybook/react';
import { MinimalTopBar } from './Navigation';
import '../../tokens/colors/ink-and-paper.css';
import '../../tokens/typography/newsreader-geist.css';

const meta = {
  title: 'Design System/3. Organisms/Navigation',
  component: MinimalTopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Navigation: minimal top bar

**Pattern:** slim single top bar for focused writing work

Built for desktop authoring flows:
- 48px height for maximum writing space
- Centered breadcrumb context
- Essential actions only
- Quiet save state
- Warm surfaces with a restrained accent

## Ink & Paper tokens applied
- Colors: Ink & Paper surfaces, borders, and marigold accent
- Typography: Newsreader + Geist
- Icons: Phosphor regular
- States: accent-subtle active tab, surface hover, hairline separators

## Accessibility
- AA contrast on text and controls
- Focus indicators on interactive elements
- Keyboard-friendly button targets
- Clear visual hierarchy without excess chrome
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MinimalTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
## Minimal top bar for focused writing

**Best for:** editor views, single-story work, and any screen where content should outrank chrome

### Characteristics
- **Layout:** slim single top bar (48px)
- **Pattern:** minimum chrome, maximum reading space
- **Context:** centered breadcrumb trail
- **Desktop feel:** closer to a writing app than a SaaS dashboard

### Features
- Breadcrumb navigation
- Save-state indicator
- Compact utility actions
- Accent-backed primary action
- Optional hide/show behavior for focus mode experiments

### Strengths
- Keeps the writing surface dominant
- Uses warm surfaces instead of cold utility chrome
- Maintains quick access to essential actions without crowding the page
        `,
      },
    },
  },
};
