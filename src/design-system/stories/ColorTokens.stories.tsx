import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import { useState } from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type ThemeMode = 'light' | 'dark';

const StoryFrame: React.FC<{
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
}> = ({ title, description, eyebrow, children }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  return (
    <div
      className="option-1"
      data-theme={theme}
      style={{
        minHeight: '100vh',
        padding: '32px',
        backgroundColor: 'var(--bg)',
        color: 'var(--fg1)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '24px',
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--fs-xs)',
              fontWeight: 'var(--fw-medium)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--fg3)',
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
              maxWidth: '64ch',
              fontSize: 'var(--fs-base)',
              lineHeight: 'var(--lh-normal)',
              color: 'var(--fg2)',
            }}
          >
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--fg1)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-sm)',
            fontWeight: 'var(--fw-medium)',
            cursor: 'pointer',
          }}
        >
          <span>Theme</span>
          <span style={{ color: 'var(--fg3)' }}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {children}
    </div>
  );
};

const Section: React.FC<{ title: string; note: string; children: React.ReactNode }> = ({
  title,
  note,
  children,
}) => (
  <section style={{ marginBottom: '32px' }}>
    <div style={{ marginBottom: '16px' }}>
      <h2
        style={{
          margin: '0 0 4px',
          fontSize: 'var(--fs-lg)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--fg1)',
        }}
      >
        {title}
      </h2>
      <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--fg2)' }}>{note}</p>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}
    >
      {children}
    </div>
  </section>
);

const Swatch: React.FC<{
  label: string;
  token: string;
  textColor?: string;
  borderColor?: string;
}> = ({ label, token, textColor = 'var(--fg1)', borderColor = 'var(--border)' }) => (
  <div
    style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '12px',
    }}
  >
    <div
      style={{
        minHeight: '120px',
        borderRadius: '10px',
        border: `1px solid ${borderColor}`,
        background: `var(${token})`,
        color: textColor,
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)' }}>{label}</span>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)' }}>{token}</code>
    </div>
  </div>
);

const DemoPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    style={{
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '24px',
    }}
  >
    <h2
      style={{
        margin: '0 0 16px',
        fontSize: 'var(--fs-lg)',
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--fg1)',
      }}
    >
      {title}
    </h2>
    {children}
  </div>
);

export const InkAndPaperColors: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native layer"
      title="Ink & Paper colors"
      description="Native tokens are the source of truth. Use --bg and --surface for paper layers, --fg1 through --fg3 for text, and --accent for the single marigold action color."
    >
      <Section
        title="Core surfaces"
        note="These swatches mirror the reference preview cards for dark and light surfaces."
      >
        <Swatch label="App background" token="--bg" />
        <Swatch label="Primary surface" token="--surface" />
        <Swatch label="Nested surface" token="--surface-2" />
        <Swatch label="Raised surface" token="--surface-raised" />
      </Section>

      <Section
        title="Foreground and accent"
        note="Primary text stays on the ink scale, while marigold carries calls to action and selection."
      >
        <Swatch label="Primary text" token="--fg1" />
        <Swatch label="Secondary text" token="--fg2" />
        <Swatch label="Muted text" token="--fg-muted" />
        <Swatch label="Accent" token="--accent" textColor="var(--fg-on-accent)" />
        <Swatch label="Accent subtle" token="--accent-subtle" />
        <Swatch label="Selection" token="--selection" />
      </Section>

      <Section
        title="Semantic feedback"
        note="Semantic colors stay warm and restrained so they sit comfortably beside the neutral paper palette."
      >
        <Swatch label="Success" token="--success" textColor="var(--fg-on-accent)" />
        <Swatch label="Success soft" token="--success-soft" />
        <Swatch label="Error" token="--error" textColor="var(--fg-on-accent)" />
        <Swatch label="Error soft" token="--error-soft" />
        <Swatch label="Warning" token="--warning" textColor="var(--fg-on-accent)" />
        <Swatch label="Info" token="--info" textColor="var(--fg-on-accent)" />
      </Section>

      <DemoPanel title="Native token sample card">
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div>
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
                Native palette sample
              </p>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--fs-2xl)',
                  lineHeight: 'var(--lh-tight)',
                  color: 'var(--fg1)',
                }}
              >
                Warm surfaces with one accent
              </h3>
              <p
                style={{
                  margin: 0,
                  maxWidth: '52ch',
                  fontSize: 'var(--fs-sm)',
                  lineHeight: 'var(--lh-normal)',
                  color: 'var(--fg2)',
                }}
              >
                New code should read directly from --bg, --surface, --fg1, and --accent. This is the
                layer that will remain once the alias cleanup lands.
              </p>
            </div>
            <div
              style={{
                alignSelf: 'start',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                padding: '6px 10px',
                fontSize: 'var(--fs-xs)',
                fontWeight: 'var(--fw-medium)',
              }}
            >
              authoritative
            </div>
          </div>
        </div>
      </DemoPanel>
    </StoryFrame>
  ),
};
