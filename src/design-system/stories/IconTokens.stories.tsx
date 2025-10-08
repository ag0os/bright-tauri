import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';

const meta: Meta = {
  title: 'Design System/Phase 1.3 - Icon Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type IconOption = {
  name: string;
  description: string;
  cssFile: string;
  className: string;
  library: string;
  style: string;
  strengths: string[];
};

const iconOptions: IconOption[] = [
  {
    name: 'Lucide Icons',
    description: 'Modern, consistent line-based icons with customizable stroke width.',
    cssFile: 'lucide.css',
    className: 'icons-1',
    library: 'lucide-react',
    style: 'Outline with adjustable stroke (1px - 2.5px)',
    strengths: ['Flexible stroke customization', 'Consistent line weight', 'Modern aesthetic', '1000+ icons'],
  },
];

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

const IconOptionDisplay: React.FC<{ option: IconOption }> = ({ option }) => {
  return (
    <div className={`option-1 typo-1 ${option.className}`} style={{
      padding: '32px',
      backgroundColor: 'var(--color-background)',
      minHeight: '100vh',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontFamily: 'var(--typography-heading-font)',
          fontSize: 'var(--typography-h3-size)',
          fontWeight: 'var(--typography-h3-weight)',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
        }}>
          {option.name}
        </h2>
        <p style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-secondary)',
          marginBottom: '12px',
        }}>
          {option.description}
        </p>
        <div style={{
          display: 'flex',
          gap: '24px',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <div><strong>Library:</strong> {option.library}</div>
          <div><strong>Style:</strong> {option.style}</div>
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
        <SizeDemo className={option.className} />
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
        <ContextDemo className={option.className} />
      </div>

      {/* Strengths */}
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
        }}>
          {option.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Comparison: StoryObj = {
  render: () => {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e7eb',
          padding: '16px 32px',
          zIndex: 1000,
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
            Phase 1.3: Icon Tokens
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Choose 1, 2, or 3 • Using Modern Indigo + Classic Serif
          </p>
        </div>

        {iconOptions.map((option, index) => (
          <div key={option.name}>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '16px 32px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
              }}>
                {option.name}
              </h2>
            </div>
            <IconOptionDisplay option={option} />
            {index < iconOptions.length - 1 && (
              <div style={{ height: '2px', backgroundColor: '#e5e7eb' }} />
            )}
          </div>
        ))}

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '32px',
          borderTop: '2px solid #e5e7eb',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Icon System Considerations
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#4b5563', lineHeight: '1.6' }}>
            <li>All options provide comprehensive icon sets (1000-6000+ icons)</li>
            <li>Size tokens ensure consistent scaling throughout the application</li>
            <li>Contextual sizing optimizes icons for their usage (button, inline, standalone)</li>
            <li>Stroke/weight variations allow for visual hierarchy and emphasis</li>
            <li>Icons inherit color from context using currentColor for flexibility</li>
            <li>Spacing tokens maintain proper gaps between icons and adjacent content</li>
          </ul>
        </div>
      </div>
    );
  },
};
