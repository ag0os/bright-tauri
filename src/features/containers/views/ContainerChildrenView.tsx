/**
 * ContainerChildrenView
 *
 * Simplified view for listing child containers and stories.
 * Can be used as a standalone component or embedded in other views.
 */

import { CaretDown, CaretUp, CircleNotch, FileText, FolderOpen } from '@phosphor-icons/react';
import type { KeyboardEvent } from 'react';
import type { Container, ContainerChildren, StorySummary } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

interface ContainerChildrenViewProps {
  children: ContainerChildren | null;
  isLoading: boolean;
  onContainerClick: (container: Container) => void;
  onStoryClick: (story: StorySummary) => void;
  onMoveContainerUp: (index: number) => void;
  onMoveContainerDown: (index: number) => void;
  onMoveStoryUp: (index: number) => void;
  onMoveStoryDown: (index: number) => void;
  emptyMessage?: string;
}

const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, onActivate: () => void) => {
  if (event.target !== event.currentTarget) {
    return;
  }

  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  onActivate();
};

export function ContainerChildrenView({
  children,
  isLoading,
  onContainerClick,
  onStoryClick,
  onMoveContainerUp,
  onMoveContainerDown,
  onMoveStoryUp,
  onMoveStoryDown,
  emptyMessage = 'No children yet',
}: ContainerChildrenViewProps) {
  // Loading State
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8)',
          gap: 'var(--spacing-3)',
        }}
      >
        <CircleNotch
          className="icon icon-2xl"
          style={{
            color: 'var(--accent)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-base)',
            color: 'var(--fg2)',
          }}
        >
          Loading children...
        </p>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Empty State
  if (!children || (children.containers.length === 0 && children.stories.length === 0)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8)',
          gap: 'var(--spacing-4)',
          textAlign: 'center',
        }}
      >
        <FolderOpen
          size={64}
          style={{
            color: 'var(--fg2)',
            opacity: 0.4,
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-base)',
            color: 'var(--fg2)',
          }}
        >
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Child Containers Section */}
      {children.containers.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h3-size)',
              fontWeight: 'var(--type-h3-weight)',
              color: 'var(--fg1)',
              margin: '0 0 var(--spacing-4) 0',
            }}
          >
            Containers ({children.containers.length})
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}
          >
            {children.containers.map((container, index) => (
              /* biome-ignore lint/a11y/useSemanticElements: the row contains native move buttons, so a wrapper button would create invalid nested buttons */
              <div
                key={container.id}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '4px',
                  gap: 'var(--spacing-3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => onContainerClick(container)}
                onKeyDown={(event) => {
                  handleRowKeyDown(event, () => onContainerClick(container));
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                }}
              >
                <FolderOpen size={24} style={{ color: 'var(--accent)' }} />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--fs-md)',
                      fontWeight: 'var(--type-h4-weight)',
                      color: 'var(--fg1)',
                      margin: 0,
                    }}
                  >
                    {container.title}
                  </h3>
                  {container.description && (
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-sm)',
                        color: 'var(--fg2)',
                        margin: 'var(--spacing-1) 0 0 0',
                      }}
                    >
                      {container.description}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--fs-xs)',
                      color: 'var(--fg2)',
                      margin: 'var(--spacing-1) 0 0 0',
                    }}
                  >
                    Type: {container.containerType}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveContainerUp(index);
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <CaretUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveContainerDown(index);
                    }}
                    disabled={index === children.containers.length - 1}
                    title="Move down"
                  >
                    <CaretDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Child Stories Section */}
      {children.stories.length > 0 && (
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h3-size)',
              fontWeight: 'var(--type-h3-weight)',
              color: 'var(--fg1)',
              margin: '0 0 var(--spacing-4) 0',
            }}
          >
            Stories ({children.stories.length})
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}
          >
            {children.stories.map((story, index) => (
              /* biome-ignore lint/a11y/useSemanticElements: the row contains native move buttons, so a wrapper button would create invalid nested buttons */
              <div
                key={story.id}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '4px',
                  gap: 'var(--spacing-3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => onStoryClick(story)}
                onKeyDown={(event) => {
                  handleRowKeyDown(event, () => onStoryClick(story));
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                }}
              >
                <FileText size={24} style={{ color: 'var(--accent)' }} />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--fs-md)',
                      fontWeight: 'var(--type-h4-weight)',
                      color: 'var(--fg1)',
                      margin: 0,
                    }}
                  >
                    {story.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--fs-sm)',
                      color: 'var(--fg2)',
                      margin: 'var(--spacing-1) 0 0 0',
                    }}
                  >
                    {story.wordCount.toLocaleString()} words · {story.status}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveStoryUp(index);
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <CaretUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveStoryDown(index);
                    }}
                    disabled={index === children.stories.length - 1}
                    title="Move down"
                  >
                    <CaretDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
