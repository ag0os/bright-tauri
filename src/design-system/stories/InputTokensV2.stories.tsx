import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/lucide.css';
import '../tokens/atoms/button/minimal-squared.css';
import '../tokens/atoms/input/filled-background.css';

const meta: Meta = {
  title: 'Design System/Phase 2.2 - Input Tokens V2 (Clean)',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type InputOption = {
  name: string;
  description: string;
  cssFile: string;
  className: string;
  style: string;
  layout: string;
  characteristics: string;
  strengths: string[];
};

const inputOptions: InputOption[] = [
  {
    name: 'Filled Background',
    description: 'Material Design inspired with solid background and no border.',
    cssFile: 'filled-background.css',
    className: 'input-5',
    style: 'Filled background',
    layout: 'Label above',
    characteristics: 'No border, gray fill, border appears on focus',
    strengths: ['Clean modern look', 'Reduced visual clutter', 'Clear input area', 'Less borders'],
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
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Standard vertical layout input
const StandardInput: React.FC<{ className: string; id: string; label: string; placeholder: string }> = ({
  className,
  id,
  label,
  placeholder,
}) => {
  return (
    <div className={`input-group ${className}`}>
      <label className="input-label" htmlFor={id}>
        {label}
        <span className="required">*</span>
      </label>
      <div className="input-wrapper">
        <input
          id={id}
          type="text"
          className="input-field input-base"
          placeholder={placeholder}
        />
      </div>
      <div className="input-helper">Enter your {label.toLowerCase()}</div>
    </div>
  );
};

// Inline layout input (for option 6)
const InlineInput: React.FC<{ className: string; id: string; label: string; placeholder: string }> = ({
  className,
  id,
  label,
  placeholder,
}) => {
  return (
    <div className={`input-group ${className}`}>
      <label className="input-label" htmlFor={id}>
        {label}
        <span className="required">*</span>
      </label>
      <div className="input-container">
        <div className="input-wrapper">
          <input
            id={id}
            type="text"
            className="input-field input-base"
            placeholder={placeholder}
          />
        </div>
        <div className="input-helper">Enter your {label.toLowerCase()}</div>
      </div>
    </div>
  );
};

// Input Showcase Component
const InputShowcase: React.FC<{ option: InputOption }> = ({ option }) => {
  const [errorValue, setErrorValue] = useState('invalid@');
  const [iconValue, setIconValue] = useState('');

  const isInline = option.className === 'input-6';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: isInline ? '12px' : '16px' }}>
          {isInline ? (
            <>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-sm`}>Small</label>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input id={`${option.className}-sm`} type="text" className="input-field input-sm" placeholder="Small" />
                  </div>
                </div>
              </div>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-base`}>Base</label>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input id={`${option.className}-base`} type="text" className="input-field input-base" placeholder="Base" />
                  </div>
                </div>
              </div>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-lg`}>Large</label>
                <div className="input-container">
                  <div className="input-wrapper">
                    <input id={`${option.className}-lg`} type="text" className="input-field input-lg" placeholder="Large" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-sm`}>Small</label>
                <div className="input-wrapper">
                  <input id={`${option.className}-sm`} type="text" className="input-field input-sm" placeholder="Small input" />
                </div>
              </div>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-base`}>Base</label>
                <div className="input-wrapper">
                  <input id={`${option.className}-base`} type="text" className="input-field input-base" placeholder="Base input" />
                </div>
              </div>
              <div className={`input-group ${option.className}`}>
                <label className="input-label" htmlFor={`${option.className}-lg`}>Large</label>
                <div className="input-wrapper">
                  <input id={`${option.className}-lg`} type="text" className="input-field input-lg" placeholder="Large input" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* With Helper Text */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          With Helper Text
        </h4>
        {isInline ? (
          <InlineInput className={option.className} id={`${option.className}-helper`} label="Email Address" placeholder="you@example.com" />
        ) : (
          <StandardInput className={option.className} id={`${option.className}-helper`} label="Email Address" placeholder="you@example.com" />
        )}
      </div>

      {/* Error State */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Error State
        </h4>
        {isInline ? (
          <div className={`input-group has-error ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-error`}>Email<span className="required">*</span></label>
            <div className="input-container">
              <div className="input-wrapper">
                <input
                  id={`${option.className}-error`}
                  type="email"
                  className="input-field input-base"
                  value={errorValue}
                  onChange={(e) => setErrorValue(e.target.value)}
                />
              </div>
              <div className="input-helper">Please enter a valid email address</div>
            </div>
          </div>
        ) : (
          <div className={`input-group has-error ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-error`}>
              Email Address<span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id={`${option.className}-error`}
                type="email"
                className="input-field input-base"
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
              />
            </div>
            <div className="input-helper">Please enter a valid email address</div>
          </div>
        )}
      </div>

      {/* Disabled State */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Disabled State
        </h4>
        {isInline ? (
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-disabled`}>Username</label>
            <div className="input-container">
              <div className="input-wrapper">
                <input id={`${option.className}-disabled`} type="text" className="input-field input-base" value="johndoe" disabled />
              </div>
              <div className="input-helper">This field cannot be edited</div>
            </div>
          </div>
        ) : (
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-disabled`}>Username</label>
            <div className="input-wrapper">
              <input id={`${option.className}-disabled`} type="text" className="input-field input-base" value="johndoe" disabled />
            </div>
            <div className="input-helper">This field cannot be edited</div>
          </div>
        )}
      </div>

      {/* Real-world Form */}
      <div>
        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Real-world Form Example
        </h4>
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
            marginBottom: '16px',
            color: 'var(--color-text-primary)',
          }}>
            {isInline ? 'User Settings' : 'Create Account'}
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isInline ? '12px' : '16px' }}>
            {isInline ? (
              <>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-name`}>Full Name<span className="required">*</span></label>
                  <div className="input-container">
                    <div className="input-wrapper">
                      <input id={`${option.className}-form-name`} type="text" className="input-field input-base" placeholder="John Doe" />
                    </div>
                  </div>
                </div>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-email`}>Email<span className="required">*</span></label>
                  <div className="input-container">
                    <div className="input-wrapper">
                      <input id={`${option.className}-form-email`} type="email" className="input-field input-base" placeholder="you@example.com" />
                    </div>
                  </div>
                </div>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-role`}>Role</label>
                  <div className="input-container">
                    <div className="input-wrapper">
                      <input id={`${option.className}-form-role`} type="text" className="input-field input-base" placeholder="Developer" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-name`}>Full Name<span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input id={`${option.className}-form-name`} type="text" className="input-field input-base" placeholder="John Doe" />
                  </div>
                </div>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-email`}>Email<span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input id={`${option.className}-form-email`} type="email" className="input-field input-base" placeholder="you@example.com" />
                  </div>
                </div>
                <div className={`input-group ${option.className}`}>
                  <label className="input-label" htmlFor={`${option.className}-form-password`}>Password<span className="required">*</span></label>
                  <div className="input-wrapper">
                    <input id={`${option.className}-form-password`} type="password" className="input-field input-base" placeholder="••••••••" />
                  </div>
                  <div className="input-helper">Must be at least 8 characters</div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: isInline ? 'flex-end' : 'flex-start' }}>
              <button className="btn btn-ghost btn-base">Cancel</button>
              <button className="btn btn-primary btn-base">{isInline ? 'Save Settings' : 'Create Account'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputOptionDisplay: React.FC<{ option: InputOption }> = ({ option }) => {
  return (
    <div className={`option-1 typo-1 icons-1 button-2 ${option.className}`} style={{
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
          <div><strong>Layout:</strong> {option.layout}</div>
          <div><strong>Details:</strong> {option.characteristics}</div>
        </div>
      </div>

      {/* Input Showcase */}
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
          Input Showcase
        </h3>
        <InputShowcase option={option} />
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
            Phase 2.2: Input Tokens V2 (Clean Options)
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Choose 4, 5, or 6 • Clean, easy-to-understand designs
          </p>
        </div>

        {inputOptions.map((option, index) => (
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
            <InputOptionDisplay option={option} />
            {index < inputOptions.length - 1 && (
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
            Clean Input Design Principles
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '24px', color: '#4b5563', lineHeight: '1.6' }}>
            <li><strong>Simple Bordered:</strong> Traditional full border, maximum clarity, familiar to all users</li>
            <li><strong>Filled Background:</strong> Modern Material Design approach, reduced borders, clean aesthetic</li>
            <li><strong>Inline Label:</strong> Horizontal layout, space-efficient, ideal for settings and admin panels</li>
            <li>All options prioritize readability and ease of understanding over fancy effects</li>
            <li>Focus states are clear and consistent across all variants</li>
            <li>Error and disabled states are immediately recognizable</li>
            <li>All maintain accessibility standards with proper contrast and focus indicators</li>
          </ul>
        </div>
      </div>
    );
  },
};
