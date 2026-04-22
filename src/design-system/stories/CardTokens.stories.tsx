import { BookOpenText, MapPin, Star } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';
import '../tokens/colors/ink-and-paper.css';
import '../tokens/typography/newsreader-geist.css';
import '../tokens/spacing.css';
import '../tokens/icons/phosphor.css';
import '../tokens/atoms/button/minimal-squared.css';
import '../tokens/organisms/card/elevated-shadow.css';

const meta: Meta = {
  title: 'Design System/3. Organisms/Cards',
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
    className="option-1 typo-1 card-1 button-2 icons-1"
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

export const InkAndPaperCards: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Alias layer"
      title="Ink & Paper cards"
      description="The existing card classes now render the Ink & Paper surface model: flat paper panels, hairline borders, and only a small hover shadow when the card is interactive."
    >
      <Panel
        title="Structured cards"
        note="Headers, body content, and footers should stay calm and readable, with Newsreader only where a title benefits from it."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          <div className="card card-base">
            <div className="card-header">
              <div className="card-title">The Last Light</div>
              <div className="card-description">Chapter · Novel one</div>
            </div>
            <div className="card-content">
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--fg2)',
                  lineHeight: 'var(--lh-normal)',
                }}
              >
                Flat cards keep the editor calm. Metadata steps back so the title and next action
                stay clear.
              </p>
            </div>
            <div className="card-footer">
              <span>3,412 words</span>
              <span>·</span>
              <span>edited 2m ago</span>
            </div>
          </div>

          <div className="card card-base card-interactive">
            <div className="card-header">
              <div className="card-title">Ashwood</div>
              <div className="card-description">Location</div>
            </div>
            <div className="card-content">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--fg2)' }}
              >
                <MapPin size={18} />
                <span style={{ fontSize: 'var(--fs-sm)' }}>3 linked stories</span>
              </div>
            </div>
            <div className="card-footer">
              <span style={{ color: 'var(--accent)' }}>updated yesterday</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Card sizes"
        note="Most app work should live on 12px and 16px panels rather than hard-coded radii."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <div className="card card-sm">
            <div className="card-title">Small card</div>
            <div className="card-description">Tight utility panel</div>
          </div>
          <div className="card card-base">
            <div className="card-title">Base card</div>
            <div className="card-description">Default document summary</div>
          </div>
          <div className="card card-lg">
            <div className="card-title">Large card</div>
            <div className="card-description">Room for richer content and actions</div>
          </div>
        </div>
      </Panel>
    </StoryFrame>
  ),
};

export const NativeCardTokens: StoryObj = {
  render: () => (
    <StoryFrame
      eyebrow="Native layer"
      title="Native card tokens"
      description="New cards should read directly from --surface, --border, --shadow-sm, and the radius scale. Ink & Paper prefers flat panels with only restrained hover depth."
    >
      <Panel
        title="Reference card"
        note="This card mirrors the preview HTML: display title, muted metadata, subtle accent pill, and a mono footer row."
      >
        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          <article
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: '18px',
              boxShadow: 'none',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-lg)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--fg1)',
              }}
            >
              The Last Light
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--fg3)' }}>
              Chapter · Novel one
            </p>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-2xs)',
                color: 'var(--fg3)',
              }}
            >
              <span
                style={{
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                In progress
              </span>
              <span>3,412 words</span>
              <span>· 2m ago</span>
            </div>
          </article>

          <article
            style={{
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                }}
              >
                <BookOpenText size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 'var(--fs-base)',
                    fontWeight: 'var(--fw-semibold)',
                    color: 'var(--fg1)',
                  }}
                >
                  Writing desk
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg3)' }}>
                  Hover depth = --shadow-sm
                </div>
              </div>
            </div>
            <p
              style={{
                margin: '0 0 16px',
                fontSize: 'var(--fs-sm)',
                lineHeight: 'var(--lh-normal)',
                color: 'var(--fg2)',
              }}
            >
              Prefer --radius-lg and --radius-xl for cards. Keep the fill flat and let border
              strength do most of the separation.
            </p>
            <button type="button" className="btn btn-primary btn-base">
              <Star size={18} />
              Continue draft
            </button>
          </article>
        </div>
      </Panel>
    </StoryFrame>
  ),
};
