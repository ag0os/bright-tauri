import type { Meta, StoryObj } from '@storybook/react';
import { MinimalTopBar } from './Navigation';
import '../../tokens/colors/modern-indigo.css';
import '../../tokens/typography/classic-serif.css';

const meta = {
  title: 'Design System/3. Organisms/Navigation',
  component: MinimalTopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Navigation: Minimal Top Bar

**Pattern:** Slim single top bar for focused, distraction-free interfaces

Optimized for desktop writing/creation apps:
- 48px height - maximum content space
- Centered breadcrumb navigation
- Essential actions only
- Auto-save indicator
- Clean, unobtrusive design

## Design Tokens Applied
- Colors: Modern Indigo
- Typography: Classic Serif
- Icons: Lucide Icons
- Buttons: Minimal Squared

## Accessibility
- ✅ AA contrast on all text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Clear visual hierarchy
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
## Minimal Top Bar for Focused Writing

**Best for:** Content creation, writing apps, distraction-free interfaces

### Characteristics
- **Layout:** Slim single top bar (48px)
- **Pattern:** Minimal chrome, maximum content space
- **Focused:** Centered context indicator, minimal controls
- **Desktop Native:** Similar to Notion, Bear, Ulysses, iA Writer

### Features
- Breadcrumb navigation (centered)
- Essential actions only
- Auto-save indicator
- Optional auto-hide on scroll
- Clean, unobtrusive design

### Strengths
- Maximum content focus
- Minimal distraction
- Clean, modern aesthetic
- Perfect for writing/creation workflows
        `,
      },
    },
  },
};
