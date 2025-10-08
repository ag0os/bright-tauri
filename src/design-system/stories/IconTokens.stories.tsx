import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Icons',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Mock icon component using SVG circles
const MockIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <svg
    className={`icon ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    style={style}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const SizeDemo: React.FC<{ className: string }> = ({ className }) => (
  <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
    {[
      { size: 'xs', label: 'XS' },
      { size: 'sm', label: 'SM' },
      { size: 'base', label: 'Base' },
      { size: 'lg', label: 'LG' },
      { size: 'xl', label: 'XL' },
      { size: '2xl', label: '2XL' },
    ].map(({ size, label }) => (
      <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <MockIcon className={`icon-${size}`} />
        <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-secondary)',
        }}>
          {label}
        </code>
      </div>
    ))}
  </div>
);

const ContextDemo: React.FC<{ className: string }> = ({ className }) => (
  <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* Button context */}
    <div>
      <p style={{
        fontFamily: 'var(--typography-body-font)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        marginBottom: '12px',
        color: 'var(--color-text-primary)',
      }}>
        Button Icons
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--icon-gap-inline)',
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-button-size)',
          fontWeight: 'var(--typography-button-weight)',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}>
          <MockIcon className="icon-button" />
          Primary Action
        </button>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--icon-gap-inline)',
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-button-size)',
          fontWeight: 'var(--typography-button-weight)',
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          padding: '10px 20px',
          border: '2px solid var(--color-primary)',
          borderRadius: '6px',
          cursor: 'pointer',
        }}>
          Secondary Action
          <MockIcon className="icon-button" />
        </button>
      </div>
    </div>

    {/* Inline context */}
    <div>
      <p style={{
        fontFamily: 'var(--typography-body-font)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        marginBottom: '12px',
        color: 'var(--color-text-primary)',
      }}>
        Inline with Text
      </p>
      <p style={{
        fontFamily: 'var(--typography-body-font)',
        fontSize: 'var(--typography-body-size)',
        lineHeight: 'var(--typography-body-line-height)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--icon-gap-inline)',
      }}>
        <MockIcon className="icon-inline" />
        Icon appears inline with body text, maintaining proper alignment and spacing.
      </p>
    </div>

    {/* Standalone context */}
    <div>
      <p style={{
        fontFamily: 'var(--typography-body-font)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-semibold)',
        marginBottom: '12px',
        color: 'var(--color-text-primary)',
      }}>
        Standalone Icons
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <MockIcon className="icon-standalone" style={{ color: 'var(--color-primary)' }} />
        <MockIcon className="icon-standalone" style={{ color: 'var(--color-accent)' }} />
        <MockIcon className="icon-standalone" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    </div>
  </div>
);

export const LucideIcons: StoryObj = {
  render: () => {
    return (
      <div className="option-1 typo-1 icons-1" style={{
        padding: '32px',
        backgroundColor: 'var(--color-background)',
        minHeight: '100vh',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--typography-heading-font)',
            fontSize: 'var(--typography-h2-size)',
            fontWeight: 'var(--typography-h2-weight)',
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}>
            Lucide Icons
          </h1>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}>
            Modern, consistent line-based icons with customizable stroke width.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            <div><strong>Library:</strong> lucide-react</div>
            <div><strong>Style:</strong> Outline with adjustable stroke (1px - 2.5px)</div>
          </div>
        </div>

      {/* Size Scale */}
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '24px',
          color: 'var(--color-primary)',
        }}>
          Icon Size Scale
        </h3>
        <SizeDemo className="icons-1" />
      </div>

      {/* Contextual Usage */}
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '24px',
          color: 'var(--color-primary)',
        }}>
          Contextual Usage
        </h3>
        <ContextDemo className="icons-1" />
      </div>

      {/* Key Strengths & Considerations */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-primary)',
        }}>
          Key Strengths
        </h3>
        <ul style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--typography-body-line-height)',
          listStyle: 'disc',
          paddingLeft: '24px',
          marginBottom: '24px',
        }}>
          <li>Flexible stroke customization</li>
          <li>Consistent line weight</li>
          <li>Modern aesthetic</li>
          <li>1000+ icons available</li>
        </ul>

        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
        }}>
          Icon System Considerations
        </h4>
        <ul style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--typography-body-line-height)',
          listStyle: 'disc',
          paddingLeft: '24px',
        }}>
          <li>Size tokens ensure consistent scaling throughout the application</li>
          <li>Contextual sizing optimizes icons for their usage (button, inline, standalone)</li>
          <li>Stroke variations allow for visual hierarchy and emphasis</li>
          <li>Icons inherit color from context using currentColor for flexibility</li>
          <li>Spacing tokens maintain proper gaps between icons and adjacent content</li>
        </ul>
      </div>
    </div>
    );
  },
};
