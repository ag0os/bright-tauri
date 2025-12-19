/**
 * ContainerView
 *
 * Displays details of a single container and manages its child containers and stories.
 * Provides navigation to child containers and stories, with reordering capabilities.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, CircleNotch, FolderOpen, FileText, Gear, CaretUp, CaretDown } from '@phosphor-icons/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useContainersStore } from '@/stores/useContainersStore';
import type { Container, Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

interface ContainerViewProps {
  containerId: string;
}

export function ContainerView({ containerId }: ContainerViewProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);

  const {
    getContainer,
    loadContainerChildren,
    getContainerChildren,
    reorderChildren,
    error,
    childrenLoading,
  } = useContainersStore();

  const [container, setContainer] = useState<Container | null>(null);
  const [isLoadingContainer, setIsLoadingContainer] = useState(true);

  // Load container and children on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingContainer(true);
      try {
        const loadedContainer = await getContainer(containerId);
        setContainer(loadedContainer);

        // Load children
        await loadContainerChildren(containerId);
      } catch (err) {
        console.error('Failed to load container:', err);
      } finally {
        setIsLoadingContainer(false);
      }
    };

    loadData();
  }, [containerId, getContainer, loadContainerChildren]);

  // Get children from store cache
  const children = getContainerChildren(containerId);
  const isChildrenLoading = childrenLoading[containerId] || false;

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'universe') {
      navigate({ screen: 'universe-list' });
    } else {
      navigate({ screen: 'stories-list' });
    }
  };

  const handleContainerClick = (childContainer: Container) => {
    navigate({ screen: 'container-view', containerId: childContainer.id });
  };

  const handleStoryClick = (story: Story) => {
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleMoveContainerUp = async (index: number) => {
    if (!children || index === 0) return;

    const containerIds = [...children.containers.map(c => c.id)];
    const storyIds = [...children.stories.map(s => s.id)];

    // Swap with previous
    [containerIds[index], containerIds[index - 1]] = [containerIds[index - 1], containerIds[index]];

    try {
      await reorderChildren(containerId, containerIds, storyIds);
    } catch (err) {
      console.error('Failed to reorder containers:', err);
    }
  };

  const handleMoveContainerDown = async (index: number) => {
    if (!children || index === children.containers.length - 1) return;

    const containerIds = [...children.containers.map(c => c.id)];
    const storyIds = [...children.stories.map(s => s.id)];

    // Swap with next
    [containerIds[index], containerIds[index + 1]] = [containerIds[index + 1], containerIds[index]];

    try {
      await reorderChildren(containerId, containerIds, storyIds);
    } catch (err) {
      console.error('Failed to reorder containers:', err);
    }
  };

  const handleMoveStoryUp = async (index: number) => {
    if (!children || index === 0) return;

    const containerIds = [...children.containers.map(c => c.id)];
    const storyIds = [...children.stories.map(s => s.id)];

    // Swap with previous
    [storyIds[index], storyIds[index - 1]] = [storyIds[index - 1], storyIds[index]];

    try {
      await reorderChildren(containerId, containerIds, storyIds);
    } catch (err) {
      console.error('Failed to reorder stories:', err);
    }
  };

  const handleMoveStoryDown = async (index: number) => {
    if (!children || index === children.stories.length - 1) return;

    const containerIds = [...children.containers.map(c => c.id)];
    const storyIds = [...children.stories.map(s => s.id)];

    // Swap with next
    [storyIds[index], storyIds[index + 1]] = [storyIds[index + 1], storyIds[index]];

    try {
      await reorderChildren(containerId, containerIds, storyIds);
    } catch (err) {
      console.error('Failed to reorder stories:', err);
    }
  };

  if (isLoadingContainer) {
    return (
      <PageLayout activeTab="stories" onTabChange={handleTabChange}>
        <div
          className="option-1 typo-1 icons-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
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
            Loading container...
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </PageLayout>
    );
  }

  if (!container) {
    return (
      <PageLayout activeTab="stories" onTabChange={handleTabChange}>
        <div
          className="option-1 typo-1 icons-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 'var(--spacing-4)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-error)',
            }}
          >
            Container not found
          </p>
          <button className="btn btn-primary btn-base" onClick={goBack}>
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activeTab="stories" onTabChange={handleTabChange}>
      <div
        className="option-1 typo-1 icons-1 button-2"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 'var(--spacing-6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          {/* Back Button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={goBack}
            title="Back"
            style={{ padding: 'var(--spacing-2)' }}
          >
            <ArrowLeft className="icon icon-base" />
          </button>

          {/* Title and Description */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <FolderOpen
                size={24}
                weight="duotone"
                style={{ color: 'var(--color-primary)' }}
              />
              <h1
                style={{
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h2-size)',
                  fontWeight: 'var(--typography-h2-weight)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                {container.title}
              </h1>
            </div>
            {container.description && (
              <p
                style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  margin: 'var(--spacing-2) 0 0 0',
                }}
              >
                {container.description}
              </p>
            )}
            <p
              style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                margin: 'var(--spacing-1) 0 0 0',
              }}
            >
              Type: {container.containerType}
              {container.gitRepoPath && (
                <>
                  {' · '}
                  Git: {container.currentBranch || 'No branch'}
                  {container.stagedChanges && ' (changes)'}
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button
              className="btn btn-ghost btn-base"
              onClick={() => navigate({ screen: 'container-settings', containerId })}
              aria-label="Container settings"
              title="Container settings"
            >
              <Gear size={18} weight="duotone" />
            </button>
            <button
              className="btn btn-primary btn-base"
              onClick={() => navigate({ screen: 'container-create', parentContainerId: containerId })}
            >
              <Plus className="icon icon-base" />
              Add Child
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-error-subtle)',
              color: 'var(--color-error)',
              borderRadius: '4px',
              marginBottom: 'var(--spacing-6)',
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading Children */}
        {isChildrenLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
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
          </div>
        )}

        {/* Children List */}
        {!isChildrenLoading && children && (
          <div style={{ flex: 1, overflow: 'auto' }}>
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
                  {children.containers.map((childContainer, index) => (
                    <div
                      key={childContainer.id}
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
                      onClick={() => handleContainerClick(childContainer)}
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
                          {childContainer.title}
                        </h3>
                        {childContainer.description && (
                          <p
                            style={{
                              fontFamily: 'var(--typography-body-font)',
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-text-secondary)',
                              margin: 'var(--spacing-1) 0 0 0',
                            }}
                          >
                            {childContainer.description}
                          </p>
                        )}
                      </div>
                      <div
                        style={{ display: 'flex', gap: 'var(--spacing-1)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMoveContainerUp(index)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <CaretUp size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMoveContainerDown(index)}
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
                      onClick={() => handleStoryClick(story)}
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
                          onClick={() => handleMoveStoryUp(index)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <CaretUp size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMoveStoryDown(index)}
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

            {/* Empty State */}
            {children.containers.length === 0 && children.stories.length === 0 && (
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
                <h2
                  style={{
                    fontFamily: 'var(--typography-heading-font)',
                    fontSize: 'var(--typography-h3-size)',
                    fontWeight: 'var(--typography-h3-weight)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  No children yet
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--typography-body-font)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '400px',
                  }}
                >
                  Add child containers or stories to organize your content.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate({ screen: 'container-create', parentContainerId: containerId })}
                >
                  <Plus className="icon icon-base" />
                  Add First Child
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
