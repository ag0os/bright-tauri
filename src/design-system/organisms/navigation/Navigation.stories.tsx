import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './Navigation';
import '../../tokens/colors/modern-indigo.css';
import '../../tokens/typography/classic-serif.css';

const meta = {
  title: 'Phase 3.2 - Navigation Options',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Phase 3.2: Navigation (Desktop Tauri App)

**Current Decision:** Navigation pattern for a desktop writing/creation app.

These patterns are optimized for **desktop applications** (not responsive web):
- No mobile breakpoints or hamburger menus
- Persistent navigation using available screen real estate
- Desktop-native interaction patterns
- Focused on productivity and content creation workflows

## Design Tokens Applied
- Colors: Modern Indigo (professional blue/indigo with warm amber)
- Typography: Classic Serif (Playfair Display + System Sans)
- Icons: Lucide Icons (adjustable stroke)
- Buttons: Minimal Squared (4px radius, compact)
- Inputs: Filled Background (Material Design inspired)
- Cards: Elevated Shadow (shadow-based depth)

## Quality Gates
- ✅ AA contrast on all text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Clear visual hierarchy
- ✅ Consistent with existing design system tokens
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['option1', 'option2', 'option3'],
      description: 'Navigation variant to display',
    },
  },
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Option1_VerticalSidebar: Story = {
  args: {
    variant: 'option1',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 1: Vertical Sidebar (Classic Desktop)

**Best for:** Traditional desktop apps, content management, file browsers

### Characteristics
- **Layout:** Fixed left sidebar (240px expanded, 64px collapsed)
- **Pattern:** Persistent vertical navigation with hierarchical sections
- **Collapsible:** Toggle between expanded and icon-only modes
- **Desktop Native:** Similar to VS Code, Slack, Finder/Explorer

### Features
- Icon + label navigation items
- Section grouping for hierarchy
- Notification badges
- Collapse/expand functionality
- Settings in footer

### Pros
- Familiar desktop pattern
- Efficient use of vertical space
- Clear information hierarchy
- Easy to scan all options

### Cons
- Takes horizontal screen space
- Can feel heavy for minimal interfaces
        `,
      },
    },
  },
};

export const Option2_TopToolbar: Story = {
  args: {
    variant: 'option2',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 2: Top Toolbar + Secondary Nav (Productivity Suite)

**Best for:** Complex productivity apps, multi-mode interfaces, contextual workflows

### Characteristics
- **Layout:** Dual-layer horizontal navigation (56px + 48px)
- **Pattern:** Primary tabs + contextual secondary toolbar
- **Context Aware:** Secondary nav changes based on active primary tab
- **Desktop Native:** Similar to Figma, Adobe apps, Microsoft Office

### Features
- Tab-based primary navigation
- Contextual secondary toolbar
- Breadcrumb navigation
- Action buttons in toolbar
- Search integration

### Pros
- Maximizes vertical content space
- Supports complex workflows
- Clear mode switching
- Rich contextual actions

### Cons
- Uses more vertical space (104px total)
- Can feel busy with both toolbars
        `,
      },
    },
  },
};

export const Option3_MinimalTopBar: Story = {
  args: {
    variant: 'option3',
  },
  parameters: {
    docs: {
      description: {
        story: `
## Option 3: Minimal Top Bar (Focused Writing)

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

### Pros
- Maximum content focus
- Minimal distraction
- Clean, modern aesthetic
- Great for writing/creation

### Cons
- Limited navigation options
- Requires good information architecture
- May need command palette for deep navigation
        `,
      },
    },
  },
};

// Comparison View
export const AllOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 1: Vertical Sidebar</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '400px' }}>
          <Navigation variant="option1" />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 2: Top Toolbar + Secondary</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '400px' }}>
          <Navigation variant="option2" />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Option 3: Minimal Top Bar</h3>
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', height: '400px' }}>
          <Navigation variant="option3" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all three navigation options.',
      },
    },
  },
};
