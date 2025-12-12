/**
 * StoryChildren View
 *
 * Full-page view for managing child stories (chapters, scenes) of a parent story.
 * Allows creating, editing, deleting, and reordering children.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, CircleNotch } from '@phosphor-icons/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ChildStoryList, CreateStoryModal } from '@/components/stories';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import type { Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

interface StoryChildrenProps {
  parentStoryId: string;
}

export function StoryChildren({ parentStoryId }: StoryChildrenProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);

  const {
    getStory,
    loadStoryChildren,
    getStoryChildren,
    reorderStoryChildren,
    deleteStory,
    childrenLoading,
    error,
  } = useStoriesStore();

  const [parentStory, setParentStory] = useState<Story | null>(null);
  const [isLoadingParent, setIsLoadingParent] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load parent story and children on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingParent(true);
      try {
        const story = await getStory(parentStoryId);
        setParentStory(story);
        await loadStoryChildren(parentStoryId);
      } catch (err) {
        console.error('Failed to load story data:', err);
      } finally {
        setIsLoadingParent(false);
      }
    };

    loadData();
  }, [parentStoryId, getStory, loadStoryChildren]);

  const children = getStoryChildren(parentStoryId);
  const isChildrenLoading = childrenLoading[parentStoryId] || false;

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'universe') {
      navigate({ screen: 'universe-list' });
    } else {
      navigate({ screen: 'stories-list' });
    }
  };

  const handleEditChild = (story: Story) => {
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleDeleteChild = async (story: Story) => {
    if (window.confirm(`Are you sure you want to delete "${story.title}"?`)) {
      try {
        await deleteStory(story.id);
        // Reload children after deletion
        await loadStoryChildren(parentStoryId);
      } catch (err) {
        console.error('Failed to delete child story:', err);
      }
    }
  };

  const handleReorder = async (storyIds: string[]) => {
    // Let the error propagate to ChildStoryList for optimistic rollback
    await reorderStoryChildren(parentStoryId, storyIds);
  };

  const handleSelectChild = (story: Story) => {
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    // Reload children after modal closes (in case a new child was created)
    loadStoryChildren(parentStoryId);
  };

  // Get display text for child type based on parent type
  const getChildTypeLabel = (plural = false): string => {
    if (!parentStory) return plural ? 'Chapters' : 'Chapter';

    switch (parentStory.storyType) {
      case 'screenplay':
        return plural ? 'Scenes' : 'Scene';
      default:
        return plural ? 'Chapters' : 'Chapter';
    }
  };

  if (isLoadingParent) {
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
            Loading story...
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

  if (!parentStory) {
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
            Story not found
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
            title="Back to stories"
            style={{ padding: 'var(--spacing-2)' }}
          >
            <ArrowLeft className="icon icon-base" />
          </button>

          {/* Title */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--typography-h2-size)',
                fontWeight: 'var(--typography-h2-weight)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {parentStory.title}
            </h1>
            <p
              style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                margin: '4px 0 0 0',
              }}
            >
              {children.length} {children.length === 1 ? getChildTypeLabel(false) : getChildTypeLabel(true)}
              {' · '}
              {children.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()} total words
            </p>
          </div>

          {/* Add Chapter Button */}
          <button
            className="btn btn-primary btn-base"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="icon icon-base" />
            Add {getChildTypeLabel(false)}
          </button>
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

        {/* Children List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <ChildStoryList
            children={children}
            isLoading={isChildrenLoading}
            onEdit={handleEditChild}
            onDelete={handleDeleteChild}
            onReorder={handleReorder}
            onSelect={handleSelectChild}
          />
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && parentStory && (
        <CreateStoryModal
          onClose={handleCreateModalClose}
          parentStory={{
            id: parentStory.id,
            title: parentStory.title,
            storyType: parentStory.storyType,
          }}
        />
      )}

      {/* Spinner animation */}
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
