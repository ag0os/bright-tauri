import { Clock, Plus, Trash } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';
import '../tokens/icons/phosphor.css';
import '../tokens/atoms/button/minimal-squared.css';

const meta: Meta = {
  title: 'Design System/2. Atoms/Buttons',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const StoryFrame: React.FC<{
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, eyebrow, description, children }) => (
  <div
    className="option-1 typo-1 button-2 icons-1"
    style={{
      minHeight: '100vh',
      padding: '32px',
      background: 'var(--bg)',
      color: 'var(--fg1)',
      fontFamily: 'var(--font-body)',
    }}
  >
    <div style={{ marginBottom: '32px', maxWidth: '760px' }}>
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--fg3)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </p>
      <h1
        style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-4xl)',
          lineHeight: 'var(--lh-tight)',
          color: 'var(--fg1)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--fs-base)',
          lineHeight: 'var(--lh-normal)',
          color: 'var(--fg2)',
        }}
      >
        {description}
      </p>
    </div>
    {children}
  </div>
);

const Panel: React.FC<{ title: string; note?: string; children: React.ReactNode }> = ({
  title,
  note,
  children,
}) => (
  <section
    style={{
      marginBottom: '24px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '24px',
    }}
  >
    <h2
      style={{
        margin: '0 0 6px',
        fontSize: 'var(--fs-lg)',
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--fg1)',
      }}
    >
      {title}
    </h2>
    {note ? (
      <p style={{ margin: '0 0 16px', fontSize: 'var(--fs-sm)', color: 'var(--fg2)' }}>{note}</p>
    ) : null}
    {children}
  </section>
);

const NativeButton: React.FC<{
  label: string;
  background: string;
  color: string;
  border: string;
  radius?: string;
  icon?: React.ReactNode;
}> = ({ label, background, color, border, radius = 'var(--radius-md)', icon }) => (
  <button
    type="button"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '36px',
      padding: '8px 14px',
      borderRadius: radius,
      border,
      background,
      color,
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 'var(--fw-medium)',
      cursor: 'pointer',
    }}
  >
    {icon}
    {label}
  </button>
);

export const MarigoldButtons: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Alias layer"
      title="Marigold buttons"
      description="The existing button classes already render the Ink & Paper button language: 8px corners, quiet neutral surfaces, and a single marigold primary action."
    >
      <Panel
        title="Button sizes"
        note="Compact controls keep chrome efficient without feeling cramped."
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm">
            Small
          </button>
          <button type="button" className="btn btn-primary btn-base">
            Base
          </button>
          <button type="button" className="btn btn-primary btn-lg">
            Large
          </button>
        </div>
      </Panel>

      <Panel
        title="Variants"
        note="Primary actions carry the accent; neutral work stays on paper surfaces."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-base">
            <Plus size={18} />
            New story
          </button>
          <button type="button" className="btn btn-secondary btn-base">
            Review notes
          </button>
          <button type="button" className="btn btn-outline btn-base">
            Outline
          </button>
          <button type="button" className="btn btn-ghost btn-base">
            Skip for now
          </button>
          <button type="button" className="btn btn-danger btn-base">
            <Trash size={18} />
            Delete
          </button>
        </div>
      </Panel>

      <Panel
        title="In context"
        note="This card matches the preview guidance: sentence case labels, no glow, and restrained spacing."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            padding: '20px',
          }}
        >
          <div>
            <h3
              style={{
                margin: '0 0 8px',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-xl)',
                color: 'var(--fg1)',
              }}
            >
              Chapter handoff
            </h3>
            <p
              style={{
                margin: 0,
                color: 'var(--fg2)',
                fontSize: 'var(--fs-sm)',
                lineHeight: 'var(--lh-normal)',
              }}
            >
              Primary actions stay warm and visible. Secondary work falls back to surface buttons so
              the page keeps its quiet tone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-base">
              Publish draft
            </button>
            <button type="button" className="btn btn-secondary btn-base">
              <Clock size={18} />
              Save for later
            </button>
            <button type="button" className="btn btn-ghost btn-base">
              Cancel
            </button>
          </div>
        </div>
      </Panel>
    </StoryFrame>
  ),
};

export const NativeButtonTokens: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native layer"
      title="Native button tokens"
      description="New buttons should read directly from the native tokens: --accent for primary actions, --surface-2 for neutral work, and the radius scale for shape."
    >
      <Panel
        title="Native buttons"
        note="These inline examples use the same values shown in the reference preview card."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <NativeButton
            label="New story"
            background="var(--accent)"
            color="var(--fg-on-accent)"
            border="1px solid var(--accent)"
            icon={<Plus size={18} />}
          />
          <NativeButton
            label="Cancel"
            background="var(--surface-2)"
            color="var(--fg1)"
            border="1px solid var(--border)"
          />
          <NativeButton
            label="Skip"
            background="transparent"
            color="var(--fg2)"
            border="1px solid transparent"
          />
          <NativeButton
            label="Delete"
            background="transparent"
            color="var(--error)"
            border="1px solid color-mix(in oklch, var(--error) 40%, transparent)"
            icon={<Trash size={18} />}
          />
        </div>
      </Panel>

      <Panel
        title="Radius scale"
        note="Buttons and controls should prefer the native radius tokens instead of literal values."
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <NativeButton
            label="--radius-sm"
            background="var(--surface-2)"
            color="var(--fg1)"
            border="1px solid var(--border)"
            radius="var(--radius-sm)"
          />
          <NativeButton
            label="--radius-md"
            background="var(--accent)"
            color="var(--fg-on-accent)"
            border="1px solid var(--accent)"
            radius="var(--radius-md)"
          />
          <NativeButton
            label="--radius-lg"
            background="var(--surface-2)"
            color="var(--fg1)"
            border="1px solid var(--border)"
            radius="var(--radius-lg)"
          />
          <NativeButton
            label="--radius-full"
            background="var(--accent-subtle)"
            color="var(--accent)"
            border="1px solid transparent"
            radius="var(--radius-full)"
          />
        </div>
      </Panel>
    </StoryFrame>
  ),
};
