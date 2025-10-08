import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/option1-modern-indigo.css';
import '../tokens/colors/option2-nature-green.css';
import '../tokens/colors/option3-sunset-purple.css';

const meta: Meta = {
  title: 'Design System/Phase 1.1 - Color Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type ColorOption = {
  name: string;
  description: string;
  cssFile: string;
  className: string;
};

const colorOptions: ColorOption[] = [
  {
    name: 'Option 1: Modern Indigo',
    description: 'Professional blue/indigo palette with warm amber accents. Creates a trustworthy, corporate feel.',
    cssFile: 'option1-modern-indigo.css',
    className: 'option-1',
  },
  {
    name: 'Option 2: Nature Green',
    description: 'Green-based palette with earth tones. Conveys growth, creativity, and natural harmony.',
    cssFile: 'option2-nature-green.css',
    className: 'option-2',
  },
  {
    name: 'Option 3: Sunset Purple',
    description: 'Purple/violet with warm rose tones. Evokes creativity, imagination, and artistic expression.',
    cssFile: 'option3-sunset-purple.css',
    className: 'option-3',
  },
];

const ColorSwatch: React.FC<{ label: string; varName: string; textColor?: string }> = ({
  label,
  varName,
  textColor = 'var(--color-text-primary)'
}) => (
  <div style={{ marginBottom: '8px' }}>
    <div
      style={{
        backgroundColor: `var(${varName})`,
        color: textColor,
        padding: '16px',
        borderRadius: '4px',
        border: '1px solid var(--color-border)',
        fontSize: '14px',
        fontWeight: '500',
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
      {varName}
    </div>
  </div>
);

const TokenSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      color: 'var(--color-text-primary)'
    }}>
      {title}
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {children}
    </div>
  </div>
);

const ColorOptionDisplay: React.FC<{ option: ColorOption; theme: 'light' | 'dark' }> = ({ option, theme }) => {
  // Apply theme styling through inline styles
  const containerStyle: React.CSSProperties = {
    padding: '32px',
    backgroundColor: 'var(--color-background)',
    minHeight: '100vh',
  };

  return (
    <div className={option.className} data-theme={theme} style={containerStyle}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          color: 'var(--color-text-primary)'
        }}>
          {option.name}
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--color-text-secondary)',
          marginBottom: '8px'
        }}>
          {option.description}
        </p>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'monospace'
        }}>
          Mode: {theme}
        </p>
      </div>

      <TokenSection title="Brand Colors">
        <ColorSwatch label="Primary" varName="--color-primary" textColor="#ffffff" />
        <ColorSwatch label="Primary Hover" varName="--color-primary-hover" textColor="#ffffff" />
        <ColorSwatch label="Primary Active" varName="--color-primary-active" textColor="#ffffff" />
        <ColorSwatch label="Primary Subtle" varName="--color-primary-subtle" />
        <ColorSwatch label="Accent" varName="--color-accent" textColor="#ffffff" />
        <ColorSwatch label="Accent Hover" varName="--color-accent-hover" textColor="#ffffff" />
      </TokenSection>

      <TokenSection title="Semantic Colors">
        <ColorSwatch label="Success" varName="--color-success" textColor="#ffffff" />
        <ColorSwatch label="Success Subtle" varName="--color-success-subtle" />
        <ColorSwatch label="Error" varName="--color-error" textColor="#ffffff" />
        <ColorSwatch label="Error Subtle" varName="--color-error-subtle" />
      </TokenSection>

      <TokenSection title="Surface & Background">
        <ColorSwatch label="Background" varName="--color-background" />
        <ColorSwatch label="Surface" varName="--color-surface" />
        <ColorSwatch label="Surface Secondary" varName="--color-surface-secondary" />
      </TokenSection>

      <TokenSection title="Text Colors">
        <ColorSwatch label="Text Primary" varName="--color-text-primary" />
        <ColorSwatch label="Text Secondary" varName="--color-text-secondary" />
        <ColorSwatch label="Text Disabled" varName="--color-text-disabled" />
      </TokenSection>

      <TokenSection title="Borders & Focus">
        <ColorSwatch label="Border" varName="--color-border" />
        <ColorSwatch label="Border Strong" varName="--color-border-strong" />
        <ColorSwatch label="Focus Ring" varName="--color-focus" />
      </TokenSection>

      <div style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: 'var(--color-text-primary)'
        }}>
          Interactive Example
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}>
            Primary Button
          </button>
          <button style={{
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            padding: '12px 24px',
            border: '2px solid var(--color-primary)',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
          }}>
            Secondary Button
          </button>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-subtle)',
            color: 'var(--color-success)',
            borderRadius: '6px',
            border: '1px solid var(--color-success)',
            fontSize: '14px',
          }}>
            ✓ Success Message
          </div>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
            borderRadius: '6px',
            border: '1px solid var(--color-error)',
            fontSize: '14px',
          }}>
            ✕ Error Message
          </div>
        </div>
      </div>
    </div>
  );
};

export const Comparison: StoryObj = {
  render: () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e7eb',
          padding: '16px 32px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              Phase 1.1: Color Tokens
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Choose 1, 2, or 3
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Toggle: {theme === 'light' ? '☀️ Light' : '🌙 Dark'} Mode
          </button>
        </div>

        {colorOptions.map((option, index) => (
          <div key={option.name}>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px 32px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {option.name}
              </h2>
            </div>
            <ColorOptionDisplay option={option} theme={theme} />
            {index < colorOptions.length - 1 && (
              <div style={{ height: '2px', backgroundColor: '#e5e7eb' }} />
            )}
          </div>
        ))}

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '32px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Accessibility Notes
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#4b5563' }}>
            <li>All text colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)</li>
            <li>Interactive elements (buttons, links) maintain 3:1 contrast against backgrounds</li>
            <li>Focus rings are clearly visible in both light and dark modes</li>
            <li>Success/error states use both color and icons for accessibility</li>
          </ul>
        </div>
      </div>
    );
  },
};
