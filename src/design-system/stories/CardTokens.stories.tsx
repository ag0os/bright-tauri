import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';
import '../tokens/atoms/button/minimal-squared.css';
import '../tokens/atoms/input/filled-background.css';
import '../tokens/organisms/card/elevated-shadow.css';

const meta: Meta = {
  title: 'Design System/Phase 3.1 - Card Tokens',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type CardOption = {
  name: string;
  description: string;
  cssFile: string;
  className: string;
  style: string;
  elevation: string;
  characteristics: string;
  strengths: string[];
};

const cardOptions: CardOption[] = [
  {
    name: 'Elevated Shadow',
    description: 'Clean cards with subtle shadows for depth and floating appearance.',
    cssFile: 'elevated-shadow.css',
    className: 'card-1',
    style: 'Soft shadow, no border',
    elevation: 'Shadow-based depth',
    characteristics: '8px radius, multiple shadow levels, hover lift',
    strengths: ['Clear depth hierarchy', 'Modern appearance', 'Floating feel', 'Smooth interactions'],
  },
];

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

const CardShowcase: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Basic Cards */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Basic Card Sizes
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className={`card card-sm ${className}`}>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}>
              Small Card
            </div>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              Compact size for tight spaces
            </div>
          </div>

          <div className={`card card-base ${className}`}>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}>
              Base Card
            </div>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              Standard card size for most content
            </div>
          </div>

          <div className={`card card-lg ${className}`}>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}>
              Large Card
            </div>
            <div style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              Spacious card for rich content
            </div>
          </div>
        </div>
      </div>

      {/* Card with Header */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Card with Header
        </h4>
        <div className={`card ${className}`} style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <div className="card-title">User Profile</div>
            <div className="card-description">Manage your account information</div>
          </div>
          <div className="card-content">
            <p style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Update your personal details and preferences to customize your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Card with Footer */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Card with Footer Actions
        </h4>
        <div className={`card ${className}`} style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <div className="card-title">Confirm Action</div>
          </div>
          <div className="card-content">
            <p style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Are you sure you want to proceed with this action? This cannot be undone.
            </p>
          </div>
          <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-base">Cancel</button>
            <button className="btn btn-primary btn-base">Confirm</button>
          </div>
        </div>
      </div>

      {/* Interactive Cards */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Interactive Cards (Hover to See Effect)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className={`card card-base card-interactive ${className}`}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <MockIcon />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}>
                  Dashboard
                </div>
                <div style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  View analytics
                </div>
              </div>
            </div>
          </div>

          <div className={`card card-base card-interactive ${className}`}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <MockIcon />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}>
                  Settings
                </div>
                <div style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  Configure app
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Card Example */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Real-world Example: Product Card
        </h4>
        <div style={{ maxWidth: '400px' }}>
          <div className={`card card-interactive ${className}`}>
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}>
              Product Image
            </div>
            <div className="card-title" style={{ marginBottom: '8px' }}>Premium Subscription</div>
            <div className="card-description" style={{ marginBottom: '16px' }}>
              Access all features and get priority support with our premium plan.
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <span style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
              }}>
                $29
              </span>
              <span style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                / month
              </span>
            </div>
            <button className="btn btn-primary btn-base" style={{ width: '100%' }}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardOptionDisplay: React.FC<{ option: CardOption }> = ({ option }) => {
  return (
    <div className={`option-1 typo-1 icons-1 button-2 input-5 ${option.className}`} style={{
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
          flexWrap: 'wrap',
        }}>
          <div><strong>Style:</strong> {option.style}</div>
          <div><strong>Elevation:</strong> {option.elevation}</div>
          <div><strong>Details:</strong> {option.characteristics}</div>
        </div>
      </div>

      {/* Card Showcase */}
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
          Card Showcase
        </h3>
        <CardShowcase className={option.className} />
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
            Phase 3.1: Card Tokens
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Choose 1, 2, or 3 • Using Modern Indigo + Classic Serif + Lucide + Minimal Squared Buttons + Filled Inputs
          </p>
        </div>

        {cardOptions.map((option, index) => (
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
            <CardOptionDisplay option={option} />
            {index < cardOptions.length - 1 && (
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
            Card Design Considerations
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#4b5563', lineHeight: '1.6' }}>
            <li>Elevation strategy affects visual hierarchy (shadows vs borders vs background)</li>
            <li>Interactive cards should have clear hover states for affordance</li>
            <li>Card headers help organize content and provide context</li>
            <li>Card footers are ideal for actions related to card content</li>
            <li>Consistent padding creates rhythm across the interface</li>
            <li>Border radius should match button radius for visual consistency</li>
            <li>All cards support structured content: header, body, footer</li>
          </ul>
        </div>
      </div>
    );
  },
};
