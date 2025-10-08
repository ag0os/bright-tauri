import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';
import '../tokens/atoms/button/minimal-squared.css';
import '../tokens/atoms/input/filled-background.css';
import '../tokens/organisms/card/elevated-shadow.css';

const meta: Meta = {
  title: 'Design System/3. Organisms/Cards',
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

export const ElevatedShadow: StoryObj = {
  render: () => {
    return (
      <div className="option-1 typo-1 icons-1 button-2 input-5 card-1" style={{
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
            Elevated Shadow
          </h1>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}>
            Clean cards with subtle shadows for depth and floating appearance.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            flexWrap: 'wrap',
          }}>
            <div><strong>Style:</strong> Soft shadow, no border</div>
            <div><strong>Elevation:</strong> Shadow-based depth</div>
            <div><strong>Details:</strong> 8px radius, multiple shadow levels, hover lift</div>
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
        <CardShowcase className="card-1" />
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
          <li>Clear depth hierarchy</li>
          <li>Modern appearance</li>
          <li>Floating feel</li>
          <li>Smooth interactions</li>
        </ul>

        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
        }}>
          Card Design Considerations
        </h4>
        <ul style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--typography-body-line-height)',
          listStyle: 'disc',
          paddingLeft: '24px',
        }}>
          <li>Interactive cards should have clear hover states for affordance</li>
          <li>Card headers help organize content and provide context</li>
          <li>Card footers are ideal for actions related to card content</li>
          <li>Consistent padding creates rhythm across the interface</li>
          <li>Border radius matches button radius for visual consistency</li>
          <li>Supports structured content: header, body, footer</li>
        </ul>
      </div>
    </div>
    );
  },
};
