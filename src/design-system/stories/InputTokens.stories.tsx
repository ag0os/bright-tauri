import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MagnifyingGlass, CheckCircle } from '@phosphor-icons/react';
import '../tokens/colors/modern-indigo.css';
import '../tokens/typography/classic-serif.css';
import '../tokens/icons/phosphor.css';
import '../tokens/atoms/button/minimal-squared.css';
import '../tokens/atoms/input/filled-background.css';

const meta: Meta = {
  title: 'Design System/2. Atoms/Inputs',
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
  labelPosition: string;
  border: string;
  strengths: string[];
};

// Basic Input Component
const BasicInput: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div className={`input-group ${className}`}>
      <label className="input-label" htmlFor="basic-input">
        Email Address
        <span className="required">*</span>
      </label>
      <div className="input-wrapper">
        <input
          id="basic-input"
          type="email"
          className="input-field input-base"
          placeholder="you@example.com"
        />
      </div>
      <div className="input-helper">Enter your email address</div>
    </div>
  );
};

// Floating Label Input Component
const FloatingInput: React.FC<{ className: string }> = ({ className }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-group ${className}`}>
      <div className={`input-wrapper ${isFocused ? 'is-focused' : ''} ${value ? 'has-value' : ''}`}>
        <label className="input-label" htmlFor="floating-input">
          Email Address
          <span className="required">*</span>
        </label>
        <input
          id="floating-input"
          type="email"
          className="input-field input-base"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <div className="input-helper">Enter your email address</div>
    </div>
  );
};

// Input Showcase Component
const InputShowcase: React.FC<{ option: InputOption }> = ({ option }) => {
  const [errorValue, setErrorValue] = useState('invalid@');
  const [iconValue, setIconValue] = useState('');

  const isFloating = option.className === 'input-2';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-sm`}>Small</label>
            <div className="input-wrapper">
              <input
                id={`${option.className}-sm`}
                type="text"
                className="input-field input-sm"
                placeholder="Small input"
              />
            </div>
          </div>
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-base`}>Base</label>
            <div className="input-wrapper">
              <input
                id={`${option.className}-base`}
                type="text"
                className="input-field input-base"
                placeholder="Base input"
              />
            </div>
          </div>
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-lg`}>Large</label>
            <div className="input-wrapper">
              <input
                id={`${option.className}-lg`}
                type="text"
                className="input-field input-lg"
                placeholder="Large input"
              />
            </div>
          </div>
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
        {isFloating ? <FloatingInput className={option.className} /> : <BasicInput className={option.className} />}
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
        <div className={`input-group has-error ${option.className}`}>
          <label className="input-label" htmlFor={`${option.className}-error`}>
            Email Address
            <span className="required">*</span>
          </label>
          <div className={`input-wrapper ${errorValue ? 'has-value' : ''}`}>
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
        <div className={`input-group ${option.className}`}>
          <label className="input-label" htmlFor={`${option.className}-disabled`}>Username</label>
          <div className="input-wrapper">
            <input
              id={`${option.className}-disabled`}
              type="text"
              className="input-field input-base"
              value="johndoe"
              disabled
            />
          </div>
          <div className="input-helper">This field cannot be edited</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Prefix Icon */}
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-prefix`}>Search</label>
            <div className={`input-wrapper ${isFloating && iconValue ? 'has-value' : ''}`}>
              <div className="input-icon-prefix">
                <MagnifyingGlass size={20} weight="duotone" />
              </div>
              <input
                id={`${option.className}-prefix`}
                type="text"
                className="input-field input-base has-prefix"
                placeholder="Search..."
                value={iconValue}
                onChange={(e) => setIconValue(e.target.value)}
              />
            </div>
          </div>

          {/* Suffix Icon */}
          <div className={`input-group ${option.className}`}>
            <label className="input-label" htmlFor={`${option.className}-suffix`}>Verified</label>
            <div className="input-wrapper">
              <input
                id={`${option.className}-suffix`}
                type="text"
                className="input-field input-base has-suffix"
                value="Verified User"
                readOnly
              />
              <div className="input-icon-suffix">
                <CheckCircle size={20} weight="duotone" />
              </div>
            </div>
          </div>
        </div>
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
            Create Account
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={`input-group ${option.className}`}>
              <label className="input-label" htmlFor={`${option.className}-form-name`}>
                Full Name
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id={`${option.className}-form-name`}
                  type="text"
                  className="input-field input-base"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className={`input-group ${option.className}`}>
              <label className="input-label" htmlFor={`${option.className}-form-email`}>
                Email
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id={`${option.className}-form-email`}
                  type="email"
                  className="input-field input-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className={`input-group ${option.className}`}>
              <label className="input-label" htmlFor={`${option.className}-form-password`}>
                Password
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id={`${option.className}-form-password`}
                  type="password"
                  className="input-field input-base"
                  placeholder="••••••••"
                />
              </div>
              <div className="input-helper">Must be at least 8 characters</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn-ghost btn-base">Cancel</button>
              <button className="btn btn-primary btn-base">Create Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilledBackground: StoryObj = {
  render: () => {
    return (
      <div className="option-1 typo-1 icons-1 button-2 input-5" style={{
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
            Filled Background
          </h1>
          <p style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--typography-body-size)',
            color: 'var(--color-text-secondary)',
            marginBottom: '12px',
          }}>
            Material Design inspired with solid background and no border.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
            flexWrap: 'wrap',
          }}>
            <div><strong>Style:</strong> Filled background</div>
            <div><strong>Label:</strong> Label above</div>
            <div><strong>Border:</strong> No border, gray fill, border appears on focus</div>
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
        <InputShowcase option={{
          name: 'Filled Background',
          description: 'Material Design inspired with solid background and no border.',
          cssFile: 'filled-background.css',
          className: 'input-5',
          style: 'Filled background',
          labelPosition: 'Label above',
          border: 'No border, gray fill, border appears on focus',
          strengths: ['Clean modern look', 'Reduced visual clutter', 'Clear input area', 'Less borders'],
        }} />
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
          <li>Clean modern look</li>
          <li>Reduced visual clutter</li>
          <li>Clear input area</li>
          <li>Less borders</li>
        </ul>

        <h4 style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
        }}>
          Input Design Considerations
        </h4>
        <ul style={{
          fontFamily: 'var(--typography-body-font)',
          fontSize: 'var(--typography-body-size)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--typography-body-line-height)',
          listStyle: 'disc',
          paddingLeft: '24px',
        }}>
          <li>Focus states must be clearly visible for accessibility (WCAG 2.4.7)</li>
          <li>Helper text provides context and reduces errors</li>
          <li>Error states must be visually distinct with clear messaging</li>
          <li>Disabled states should be obvious but not alarming</li>
          <li>Icon support enhances usability for search, validation, and actions</li>
          <li>All inputs maintain 44px minimum height for touch targets</li>
          <li>Required field indicators must be consistent and visible</li>
        </ul>
      </div>
    </div>
    );
  },
};
