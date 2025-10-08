import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

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

export const ModernIndigo: StoryObj = {
  render: () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
      <div className="option-1" data-theme={theme} style={{
        padding: '32px',
        backgroundColor: 'var(--color-background)',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px',
              color: 'var(--color-text-primary)'
            }}>
              Modern Indigo
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px'
            }}>
              Professional blue/indigo palette with warm amber accents. Creates a trustworthy, corporate feel.
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
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
          </button>
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

        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            Accessibility
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
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
