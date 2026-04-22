import { CheckCircle, MagnifyingGlass } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';
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

const StoryFrame: React.FC<{
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, eyebrow, description, children }) => (
  <div
    className="option-1 typo-1 button-2 input-5 icons-1"
    style={{
      minHeight: '100vh',
      padding: '32px',
      background: 'var(--bg)',
      color: 'var(--fg1)',
      fontFamily: 'var(--font-body)',
    }}
  >
    <div style={{ marginBottom: '32px', maxWidth: '760px' }}>
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 'var(--fs-xs)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--fg3)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </p>
      <h1
        style={{
          margin: '0 0 12px',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-4xl)',
          lineHeight: 'var(--lh-tight)',
          color: 'var(--fg1)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--fs-base)',
          lineHeight: 'var(--lh-normal)',
          color: 'var(--fg2)',
        }}
      >
        {description}
      </p>
    </div>
    {children}
  </div>
);

const Panel: React.FC<{ title: string; note?: string; children: React.ReactNode }> = ({
  title,
  note,
  children,
}) => (
  <section
    style={{
      marginBottom: '24px',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '24px',
    }}
  >
    <h2
      style={{
        margin: '0 0 6px',
        fontSize: 'var(--fs-lg)',
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--fg1)',
      }}
    >
      {title}
    </h2>
    {note ? (
      <p style={{ margin: '0 0 16px', fontSize: 'var(--fs-sm)', color: 'var(--fg2)' }}>{note}</p>
    ) : null}
    {children}
  </section>
);

const AliasField: React.FC<{
  fieldId: string;
  label: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  children?: React.ReactNode;
}> = ({
  fieldId,
  label,
  helper,
  error,
  disabled = false,
  placeholder,
  defaultValue,
  icon,
  suffixIcon,
  children,
}) => (
  <div className={`input-group ${error ? 'has-error' : ''}`}>
    <label className="input-label" htmlFor={fieldId}>
      {label}
    </label>
    <div className="input-wrapper">
      {icon ? <div className="input-icon-prefix">{icon}</div> : null}
      {children ?? (
        <input
          id={fieldId}
          className={`input-field input-base ${icon ? 'has-prefix' : ''} ${suffixIcon ? 'has-suffix' : ''}`}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {suffixIcon ? <div className="input-icon-suffix">{suffixIcon}</div> : null}
    </div>
    {error ? (
      <div className="input-helper">{error}</div>
    ) : helper ? (
      <div className="input-helper">{helper}</div>
    ) : null}
  </div>
);

const NativeField: React.FC<{
  label: string;
  placeholder?: string;
  helper?: string;
  value?: string;
  trailing?: React.ReactNode;
}> = ({ label, placeholder, helper, value, trailing }) => (
  <label style={{ display: 'grid', gap: '6px' }}>
    <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)', color: 'var(--fg2)' }}>
      {label}
    </span>
    <div style={{ position: 'relative' }}>
      <input
        readOnly={Boolean(value)}
        defaultValue={value}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '38px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--fg1)',
          padding: trailing ? '10px 42px 10px 12px' : '10px 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--fs-sm)',
          outline: 'none',
        }}
      />
      {trailing ? (
        <span
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--fg2)',
            display: 'inline-flex',
          }}
        >
          {trailing}
        </span>
      ) : null}
    </div>
    {helper ? (
      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg3)' }}>{helper}</span>
    ) : null}
  </label>
);

export const InkAndPaperInputs: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Alias layer"
      title="Ink & Paper inputs"
      description="The current input classes already render as warm paper fields: filled surfaces, 8px corners, hairline borders, and marigold focus states."
    >
      <Panel
        title="Reference-aligned field set"
        note="These controls still use the class layer while matching the Ink & Paper input preview."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          <AliasField
            fieldId="alias-story-title"
            label="Story title"
            defaultValue="The Last Light"
          />
          <AliasField fieldId="alias-story-type" label="Type">
            <select id="alias-story-type" className="input-field input-base">
              <option>Chapter</option>
              <option>Scene</option>
              <option>Outline</option>
            </select>
          </AliasField>
          <div style={{ gridColumn: '1 / -1' }}>
            <AliasField
              fieldId="alias-story-description"
              label="Description"
              placeholder="A short note about this piece"
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="States used across the app"
        note="Helper text, validation, disabled fields, and icon affordances stay calm and legible in both themes."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          <AliasField
            fieldId="alias-search"
            label="Search"
            placeholder="Search stories"
            helper="Prefix icons inherit currentColor and stay secondary until focus."
            icon={<MagnifyingGlass size={18} />}
          />
          <AliasField
            fieldId="alias-email"
            label="Editor email"
            defaultValue="invalid@"
            error="Use a full email address so collaboration invites arrive correctly."
          />
          <AliasField
            fieldId="alias-verified"
            label="Verified"
            defaultValue="Leora Finch"
            helper="Read-only fields can still surface confirmation state."
            suffixIcon={<CheckCircle size={18} />}
          />
          <AliasField
            fieldId="alias-universe-id"
            label="Universe ID"
            defaultValue="ash-cycle-01"
            helper="Disabled fields fade back without disappearing."
            disabled
          />
        </div>
      </Panel>
    </StoryFrame>
  ),
};

export const NativeFieldTokens: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native layer"
      title="Native field tokens"
      description="New fields should use native surface, border, accent, and radius tokens directly. The defaults are --surface-2, --border, --accent, and --radius-md."
    >
      <Panel
        title="Native input recipe"
        note="This mirrors the reference preview: subtle fill, hairline border, and a stronger accent only on focus."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <NativeField
            label="Story title"
            value="The Last Light"
            helper="Uses --surface-2, --border, and --radius-md."
          />
          <NativeField label="Type" value="Chapter" />
          <div style={{ gridColumn: '1 / -1' }}>
            <NativeField label="Description" placeholder="A short note about this piece" />
          </div>
        </div>
      </Panel>

      <Panel
        title="Focus and feedback tokens"
        note="Accent and semantic tokens should stay restrained and readable, never louder than the writing itself."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 0 3px var(--accent-subtle)',
              background: 'var(--surface-2)',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg3)', marginBottom: '8px' }}>
              Focused field
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg1)' }}>
              Accent ring = --accent + --accent-subtle
            </div>
          </div>
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid color-mix(in oklch, var(--error) 45%, transparent)',
              background: 'var(--error-soft)',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg3)', marginBottom: '8px' }}>
              Validation message
            </div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--error)' }}>
              Error feedback uses --error and --error-soft.
            </div>
          </div>
        </div>
      </Panel>
    </StoryFrame>
  ),
};
