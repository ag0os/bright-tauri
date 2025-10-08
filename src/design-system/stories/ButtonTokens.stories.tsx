import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';
import '../tokens/atoms/button/minimal-squared.css';

const meta: Meta = {
  title: 'Design System/2. Atoms/Buttons',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Mock icon component
const MockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`icon ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    style={{ width: '20px', height: '20px', strokeWidth: '2px' }}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const ButtonShowcase: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Size Variants */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Size Variants
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm">Small</button>
          <button className="btn btn-primary btn-base">Base</button>
          <button className="btn btn-primary btn-lg">Large</button>
        </div>
      </div>

      {/* Style Variants */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Style Variants
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-base">Primary</button>
          <button className="btn btn-secondary btn-base">Secondary</button>
          <button className="btn btn-outline btn-base">Outline</button>
          <button className="btn btn-ghost btn-base">Ghost</button>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          With Icons
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-base">
            <MockIcon />
            Icon Left
          </button>
          <button className="btn btn-secondary btn-base">
            Icon Right
            <MockIcon />
          </button>
          <button className="btn btn-outline btn-base">
            <MockIcon />
            Both Sides
            <MockIcon />
          </button>
        </div>
      </div>

      {/* States */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          States
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-base">Default</button>
          <button className="btn btn-primary btn-base" style={{ pointerEvents: 'none', filter: 'brightness(0.9)' }}>
            Hover (sim)
          </button>
          <button className="btn btn-primary btn-base" disabled>Disabled</button>
        </div>
      </div>

      {/* Real-world Examples */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Real-world Context
        </h4>

        {/* Form Actions */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          marginBottom: '16px',
        }}>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}>
            Form Actions
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-base">Cancel</button>
            <button className="btn btn-primary btn-base">Save Changes</button>
          </div>
        </div>

        {/* Card Actions */}
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}>
          <h5 style={{
            fontFamily: 'var(--typography-heading-font)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}>
            Premium Plan
          </h5>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '16px',
            lineHeight: 'var(--typography-body-line-height)',
          }}>
            Everything you need to build great products at scale.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary btn-base">Get Started</button>
            <button className="btn btn-outline btn-base">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MinimalSquared: StoryObj = {
  render: () => {
    return (
      <div className="option-1 typo-1 icons-1 button-2" style={{
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
            Minimal Squared
          </h1>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}>
            Small border radius with compact spacing for dense, data-heavy applications.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            flexWrap: 'wrap',
          }}>
            <div><strong>Shape:</strong> 4px border radius</div>
            <div><strong>Density:</strong> Compact (8px/16px base padding)</div>
            <div><strong>Focus:</strong> Subtle 2px ring</div>
          </div>
        </div>

      {/* Button Showcase */}
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
          Button Showcase
        </h3>
        <ButtonShowcase className="button-2" />
      </div>

      {/* Strengths & Considerations */}
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
          <li>Space efficient</li>
          <li>Clean minimal look</li>
          <li>Dense interfaces</li>
          <li>Fast scanning</li>
        </ul>

        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
        }}>
          Button Design Considerations
        </h4>
        <ul style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--typography-body-line-height)',
          listStyle: 'disc',
          paddingLeft: '24px',
        }}>
          <li>Padding density determines information density and touch target size (min 44px height recommended)</li>
          <li>Focus ring visibility is critical for keyboard navigation accessibility (WCAG 2.4.7)</li>
          <li>Button variants provide visual hierarchy (primary &gt; secondary &gt; outline &gt; ghost)</li>
          <li>Icon spacing ensures proper alignment and breathing room</li>
          <li>Hover and active states provide essential interaction feedback</li>
          <li>Maintains WCAG AA contrast requirements (4.5:1 for text, 3:1 for interactive elements)</li>
        </ul>
      </div>
    </div>
    );
  },
};
