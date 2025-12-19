/**
 * ContainerChildrenView
 *
 * Simplified view for listing child containers and stories.
 * Can be used as a standalone component or embedded in other views.
 */

import { FolderOpen, FileText, CaretUp, CaretDown, CircleNotch } from '@phosphor-icons/react';
import type { Container, Story, ContainerChildren } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

interface ContainerChildrenViewProps {
  children: ContainerChildren | null;
  isLoading: boolean;
  onContainerClick: (container: Container) => void;
  onStoryClick: (story: Story) => void;
  onMoveContainerUp: (index: number) => void;
  onMoveContainerDown: (index: number) => void;
  onMoveStoryUp: (index: number) => void;
  onMoveStoryDown: (index: number) => void;
  emptyMessage?: string;
}

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
            color: 'var(--color-primary)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
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
          weight="duotone"
          style={{
            color: 'var(--color-text-secondary)',
            opacity: 0.4,
          }}
        />
        <p
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
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
              fontFamily: 'var(--typography-heading-font)',
              fontSize: 'var(--typography-h3-size)',
              fontWeight: 'var(--typography-h3-weight)',
              color: 'var(--color-text-primary)',
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
              <div
                key={container.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: '4px',
                  gap: 'var(--spacing-3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => onContainerClick(container)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
                }}
              >
                <FolderOpen
                  size={24}
                  weight="duotone"
                  style={{ color: 'var(--color-primary)' }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--typography-heading-font)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--typography-h4-weight)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {container.title}
                  </h3>
                  {container.description && (
                    <p
                      style={{
                        fontFamily: 'var(--typography-body-font)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        margin: 'var(--spacing-1) 0 0 0',
                      }}
                    >
                      {container.description}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: 'var(--typography-body-font)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      margin: 'var(--spacing-1) 0 0 0',
                    }}
                  >
                    Type: {container.containerType}
                  </p>
                </div>
                <div
                  style={{ display: 'flex', gap: 'var(--spacing-1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onMoveContainerUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <CaretUp size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onMoveContainerDown(index)}
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
              fontFamily: 'var(--typography-heading-font)',
              fontSize: 'var(--typography-h3-size)',
              fontWeight: 'var(--typography-h3-weight)',
              color: 'var(--color-text-primary)',
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
              <div
                key={story.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: '4px',
                  gap: 'var(--spacing-3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => onStoryClick(story)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
                }}
              >
                <FileText
                  size={24}
                  weight="duotone"
                  style={{ color: 'var(--color-accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--typography-heading-font)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--typography-h4-weight)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {story.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--typography-body-font)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      margin: 'var(--spacing-1) 0 0 0',
                    }}
                  >
                    {story.wordCount.toLocaleString()} words · {story.status}
                  </p>
                </div>
                <div
                  style={{ display: 'flex', gap: 'var(--spacing-1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onMoveStoryUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <CaretUp size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onMoveStoryDown(index)}
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
