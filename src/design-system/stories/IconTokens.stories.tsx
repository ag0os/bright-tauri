import { Check, Clock, FileText, MagnifyingGlass, Plus, Star, Users } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';
import '../tokens/icons/phosphor.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Icons',
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
    className="option-1 typo-1 icons-1"
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

export const PhosphorRegularIcons: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Current usage"
      title="Phosphor regular icons"
      description="Ink & Paper uses Phosphor in its regular weight by default. Color comes from context, and fill is reserved for active or selected states only."
    >
      <Panel
        title="Size scale"
        note="The 16–24px range does most of the work in controls and navigation."
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
          {[
            { size: 12, label: '12px' },
            { size: 16, label: '16px' },
            { size: 20, label: '20px' },
            { size: 24, label: '24px' },
            { size: 32, label: '32px' },
            { size: 48, label: '48px' },
          ].map(({ size, label }) => (
            <div key={size} style={{ display: 'grid', gap: '8px', justifyItems: 'center' }}>
              <Clock size={size} />
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-2xs)',
                  color: 'var(--fg3)',
                }}
              >
                {label}
              </code>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="In context"
        note="Regular icons stay flat. State changes come from color and fill, not decorative two-tone styling."
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--fg1)',
              }}
            >
              Buttons
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent)',
                  background: 'var(--accent)',
                  color: 'var(--fg-on-accent)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                <Plus size={18} />
                New story
              </button>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--fg1)',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                Review
                <Check size={18} />
              </button>
            </div>
          </div>

          <div>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--fg1)',
              }}
            >
              Text and metadata
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--fg1)',
                }}
              >
                <MagnifyingGlass size={16} />
                Search and navigation icons align with body copy.
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--fs-xs)',
                  color: 'var(--fg3)',
                }}
              >
                <Clock size={14} />
                Updated 2 minutes ago
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </StoryFrame>
  ),
};

export const NativeIconColorTokens: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native color layer"
      title="Native icon color tokens"
      description="Icons inherit currentColor, so the token choice lives on the parent: --fg1 for primary UI, --fg2 and --fg3 for metadata, and --accent for the active moment."
    >
      <Panel
        title="Token-driven icon color"
        note="Set color on the container and let the icon inherit it."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          {[
            { label: '--fg1', color: 'var(--fg1)', icon: <FileText size={24} /> },
            { label: '--fg2', color: 'var(--fg2)', icon: <Users size={24} /> },
            { label: '--fg3', color: 'var(--fg3)', icon: <Clock size={24} /> },
            { label: '--accent', color: 'var(--accent)', icon: <Star size={24} weight="fill" /> },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gap: '10px',
                justifyItems: 'start',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                padding: '16px',
                color: item.color,
              }}
            >
              {item.icon}
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)' }}>
                {item.label}
              </code>
            </div>
          ))}
        </div>
      </Panel>
    </StoryFrame>
  ),
};
