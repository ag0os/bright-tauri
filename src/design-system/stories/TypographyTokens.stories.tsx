import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';

const meta: Meta = {
  title: 'Design System/1. Foundations/Typography',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const TypographyScale: React.FC<{ className: string }> = ({ className }) => (
  <div className={className} style={{ marginBottom: '32px' }}>
    <h4 style={{
      fontFamily: 'var(--typography-body-font)',
      fontSize: 'var(--font-size-lg)',
      fontWeight: 'var(--font-weight-semibold)',
      marginBottom: '16px',
      color: 'var(--color-text-primary)',
    }}>
      Type Scale
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[
        { label: '5xl', var: '--font-size-5xl' },
        { label: '4xl', var: '--font-size-4xl' },
        { label: '3xl', var: '--font-size-3xl' },
        { label: '2xl', var: '--font-size-2xl' },
        { label: 'xl', var: '--font-size-xl' },
        { label: 'lg', var: '--font-size-lg' },
        { label: 'base', var: '--font-size-base' },
        { label: 'sm', var: '--font-size-sm' },
        { label: 'xs', var: '--font-size-xs' },
      ].map(({ label, var: varName }) => (
        <div key={label} style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          padding: '4px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <code style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            minWidth: '50px',
          }}>
            {label}
          </code>
          <span style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: `var(${varName})`,
            color: 'var(--color-text-primary)',
          }}>
            The quick brown fox jumps
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const ClassicSerif: StoryObj = {
  render: () => {
    return (
      <div className="option-1 typo-1" style={{
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
            Classic Serif
          </h1>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}>
            Traditional literary feel with modern serif headings and clean sans-serif body text.
          </p>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            <div>Display: Playfair Display (serif)</div>
            <div>Body: System Sans-Serif</div>
            <div>Scale: 1.250 (Major Third)</div>
          </div>
        </div>

      {/* Headings Example */}
      <div style={{
        marginBottom: '48px',
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
          Heading Hierarchy
        </h3>

        <h1 style={{
          fontFamily: 'var(--typography-heading-font)',
          fontSize: 'var(--typography-h1-size)',
          fontWeight: 'var(--typography-h1-weight)',
          lineHeight: 'var(--typography-h1-line-height)',
          letterSpacing: 'var(--typography-h1-letter-spacing)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Heading 1: Main Title
        </h1>

        <h2 style={{
          fontFamily: 'var(--typography-heading-font)',
          fontSize: 'var(--typography-h2-size)',
          fontWeight: 'var(--typography-h2-weight)',
          lineHeight: 'var(--typography-h2-line-height)',
          letterSpacing: 'var(--typography-h2-letter-spacing)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Heading 2: Section Title
        </h2>

        <h3 style={{
          fontFamily: 'var(--typography-heading-font)',
          fontSize: 'var(--typography-h3-size)',
          fontWeight: 'var(--typography-h3-weight)',
          lineHeight: 'var(--typography-h3-line-height)',
          letterSpacing: 'var(--typography-h3-letter-spacing)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Heading 3: Subsection
        </h3>

        <h4 style={{
          fontFamily: 'var(--typography-heading-font)',
          fontSize: 'var(--typography-h4-size)',
          fontWeight: 'var(--typography-h4-weight)',
          lineHeight: 'var(--typography-h4-line-height)',
          letterSpacing: 'var(--typography-h4-letter-spacing)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Heading 4: Minor Heading
        </h4>
      </div>

      {/* Body Text Example */}
      <div style={{
        marginBottom: '48px',
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
          Body Text
        </h3>

        <p style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-large-size)',
          lineHeight: 'var(--typography-body-large-line-height)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          <strong>Large body text:</strong> In the beginning, the creative process was nothing more than a spark—a fleeting idea that danced at the edge of consciousness, waiting to be captured and transformed into something tangible.
        </p>

        <p style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          fontWeight: 'var(--typography-body-weight)',
          lineHeight: 'var(--typography-body-line-height)',
          letterSpacing: 'var(--typography-body-letter-spacing)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          <strong>Regular body text:</strong> Every great story begins with a question, a problem to solve, or a world to explore. The writer's journey is one of discovery, where characters come alive through careful observation and the patient cultivation of authentic voices. Through this process, mere words transform into experiences that resonate deeply with readers.
        </p>

        <p style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-small-size)',
          lineHeight: 'var(--typography-body-small-line-height)',
          marginBottom: '8px',
          color: 'var(--color-text-secondary)',
        }}>
          <strong>Small body text:</strong> Supporting details and metadata appear in smaller text, maintaining readability while establishing visual hierarchy.
        </p>

        <p style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-caption-size)',
          fontWeight: 'var(--typography-caption-weight)',
          lineHeight: 'var(--typography-caption-line-height)',
          color: 'var(--color-text-secondary)',
        }}>
          Caption: Additional context or attribution information
        </p>
      </div>

      {/* Type Scale */}
      <div style={{
        marginBottom: '48px',
        padding: '24px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}>
        <TypographyScale className="typo-1" />
      </div>

      {/* UI Elements */}
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
          marginBottom: '24px',
          color: 'var(--color-primary)',
        }}>
          UI Elements
        </h3>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-button-size)',
            fontWeight: 'var(--typography-button-weight)',
            lineHeight: 'var(--typography-button-line-height)',
            letterSpacing: 'var(--typography-button-letter-spacing)',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            Primary Button
          </button>

          <button style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-button-size)',
            fontWeight: 'var(--typography-button-weight)',
            lineHeight: 'var(--typography-button-line-height)',
            letterSpacing: 'var(--typography-button-letter-spacing)',
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            padding: '12px 24px',
            border: '2px solid var(--color-primary)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
            Secondary Button
          </button>

          <code style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-sm)',
            backgroundColor: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            padding: '4px 8px',
            borderRadius: '4px',
          }}>
            code snippet
          </code>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: 'var(--color-surface-secondary)',
          borderRadius: '8px',
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            Typography Considerations
          </h4>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
            <li>System fonts provide optimal performance and consistency across platforms</li>
            <li>Type scales ensure harmonious size relationships throughout the interface</li>
            <li>Line heights optimized for readability in body text (1.625-1.8)</li>
            <li>Font weights carefully selected to work with the color palette</li>
            <li>Letter spacing adjusted for display sizes to improve legibility</li>
          </ul>
        </div>
      </div>
    </div>
    );
  },
};
