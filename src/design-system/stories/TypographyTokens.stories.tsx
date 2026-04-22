import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Typography',
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
    className="option-1 typo-1"
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
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
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
          fontWeight: 'var(--fw-semibold)',
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
      <p style={{ margin: '0 0 16px', color: 'var(--fg2)', fontSize: 'var(--fs-sm)' }}>{note}</p>
    ) : null}
    {children}
  </section>
);

const NativeScale: React.FC = () => (
  <div style={{ display: 'grid', gap: '10px' }}>
    {[
      ['--fs-5xl', 'var(--fs-5xl)', 'var(--lh-tight)', '64 / 74', 'Display sample'],
      ['--fs-4xl', 'var(--fs-4xl)', 'var(--lh-tight)', '48 / 56', 'Heading one'],
      ['--fs-3xl', 'var(--fs-3xl)', 'var(--lh-tight)', '36 / 44', 'Heading two'],
      ['--fs-2xl', 'var(--fs-2xl)', 'var(--lh-snug)', '28 / 36', 'Heading three'],
      ['--fs-xl', 'var(--fs-xl)', 'var(--lh-snug)', '22 / 28', 'Heading four'],
      ['--fs-base', 'var(--fs-base)', 'var(--lh-normal)', '15 / 22', 'UI body'],
      ['--fs-md', 'var(--fs-md)', 'var(--lh-reading)', '17 / 29', 'Reading text'],
      ['--fs-xs', 'var(--fs-xs)', 'var(--lh-normal)', '13 / 20', 'Meta'],
    ].map(([token, size, lineHeight, metrics, sample]) => (
      <div
        key={token}
        style={{
          display: 'grid',
          gridTemplateColumns: '96px 56px minmax(0, 1fr)',
          gap: '16px',
          alignItems: 'baseline',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <code
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', color: 'var(--fg3)' }}
        >
          {token}
        </code>
        <code
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', color: 'var(--fg3)' }}
        >
          {metrics}
        </code>
        <span
          style={{
            fontFamily:
              sample.includes('Reading') || sample.includes('Display') || sample.includes('Heading')
                ? 'var(--font-display)'
                : 'var(--font-body)',
            fontSize: size,
            lineHeight,
            color: 'var(--fg1)',
          }}
        >
          {sample}
        </span>
      </div>
    ))}
  </div>
);

export const NewsreaderAndGeist: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Pairing"
      title="Newsreader + Geist"
      description="Newsreader carries reading surfaces and editorial headings; Geist keeps controls, metadata, and chrome compact. Both tokens resolve directly from the native type scale."
    >
      <Panel
        title="Type pairing"
        note="Display and reading surfaces sit on Newsreader; UI chrome sits on Geist."
      >
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-xs)', color: 'var(--fg3)' }}>
              Display and reading
            </p>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-h2-size)',
                lineHeight: 'var(--type-h2-lh)',
                fontWeight: 'var(--type-h2-weight)',
                color: 'var(--fg1)',
              }}
            >
              Editorial headings keep the page warm and literary.
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-xs)', color: 'var(--fg3)' }}>
              UI chrome
            </p>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--type-body-size)',
                lineHeight: 'var(--type-body-lh)',
                color: 'var(--fg1)',
              }}
            >
              Buttons, labels, metadata, and settings stay on a quieter sans so the writing itself
              remains the hero.
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Reading sample"
        note="Ink & Paper keeps long-form text generous without making chrome feel oversized."
      >
        <div
          style={{
            maxWidth: 'var(--layout-reading-w)',
            margin: '0 auto',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h3-size)',
              lineHeight: 'var(--type-h3-lh)',
              color: 'var(--fg1)',
            }}
          >
            The room settled back into silence.
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-md)',
              lineHeight: 'var(--lh-reading)',
              color: 'var(--fg2)',
            }}
          >
            Newsreader carries the reading voice at a calmer pace, while the rest of the interface
            steps back into Geist so navigation, status, and controls stay crisp.
          </p>
        </div>
      </Panel>
    </StoryFrame>
  ),
};

export const NativeTypeTokens: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native layer"
      title="Native type tokens"
      description="New work should use the native scale directly: --fs-* for size, --lh-* for rhythm, --font-display for reading and display, and --font-body for UI chrome."
    >
      <Panel
        title="Native scale"
        note="This mirrors the reference previews for display, UI, and reading text."
      >
        <NativeScale />
      </Panel>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <Panel
          title="UI chrome"
          note="Geist stays compact and efficient for toolbars, labels, and controls."
        >
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                color: 'var(--fg3)',
                fontSize: 'var(--fs-xs)',
              }}
            >
              <span>toolbar label</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>--fs-base / --lh-normal</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-base)',
                lineHeight: 'var(--lh-normal)',
                color: 'var(--fg1)',
              }}
            >
              Draft history is saved automatically while you write.
            </div>
          </div>
        </Panel>

        <Panel
          title="Reading surface"
          note="The reading column uses Newsreader at 17px with --lh-reading for a slower, book-like rhythm."
        >
          <div
            style={{
              maxWidth: 'var(--layout-reading-w)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              padding: '16px',
            }}
          >
            <div
              style={{
                marginBottom: '12px',
                color: 'var(--fg3)',
                fontSize: 'var(--fs-xs)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              --font-display · --fs-md · --lh-reading
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-md)',
                lineHeight: 'var(--lh-reading)',
                color: 'var(--fg1)',
              }}
            >
              The page asks for patience. Native reading tokens keep paragraphs open, warm, and easy
              to scan over long sessions.
            </p>
          </div>
        </Panel>
      </div>
    </StoryFrame>
  ),
};
