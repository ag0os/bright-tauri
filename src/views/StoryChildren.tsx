/**
 * StoryChildren View
 *
 * Full-page view for managing child stories (chapters, scenes) of a parent story.
 * Allows creating, editing, deleting, and reordering children.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, CircleNotch, Gear } from '@phosphor-icons/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ChildStoryList, CreateStoryModal, DeleteStoryModal } from '@/components/stories';
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

  // TODO(task-76/78): This view needs to be updated to use containers store instead of stories store
  // For now, we'll use basic story CRUD operations
  const {
    getStory,
    deleteStory,
    error,
  } = useStoriesStore();

  const [parentStory, setParentStory] = useState<Story | null>(null);
  const [isLoadingParent, setIsLoadingParent] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [deleteChildCount, setDeleteChildCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // TODO(task-76/78): This component will be replaced with container-based management
  // Load parent story on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingParent(true);
      try {
        const story = await getStory(parentStoryId);
        setParentStory(story);
        // TODO(task-76/78): Load children from containers store
      } catch (err) {
        console.error('Failed to load story data:', err);
      } finally {
        setIsLoadingParent(false);
      }
    };

    loadData();
  }, [parentStoryId, getStory]);

  // TODO(task-76/78): Children will come from containers store
  const children: Story[] = [];
  const isChildrenLoading = false;

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
    // TODO(task-76/78): Child count will come from containers store
    setStoryToDelete(story);
    setDeleteChildCount(0);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStory(storyToDelete.id);
      // TODO(task-76/78): Reload children from containers store
      // Close modal and reset state
      setShowDeleteModal(false);
      setStoryToDelete(null);
      setDeleteChildCount(0);
    } catch (error) {
      console.error('Failed to delete story:', error);
      // Keep modal open to show error (error is already in store)
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStoryToDelete(null);
    setDeleteChildCount(0);
    setIsDeleting(false);
  };

  const handleReorder = async (storyIds: string[]) => {
    // TODO(task-76/78): Reordering will use containers store
    console.log('Reorder not yet implemented with containers store', storyIds);
  };

  const handleSelectChild = (story: Story) => {
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    // TODO(task-76/78): Reload children from containers store
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button
              className="btn btn-ghost btn-base"
              onClick={() => navigate({ screen: 'story-settings', storyId: parentStoryId })}
              aria-label="Story settings"
              title="Story settings"
            >
              <Gear size={18} weight="duotone" />
            </button>
            <button
              className="btn btn-primary btn-base"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="icon icon-base" />
              Add {getChildTypeLabel(false)}
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

      {/* Delete Story Modal */}
      <DeleteStoryModal
        isOpen={showDeleteModal}
        story={storyToDelete}
        childCount={deleteChildCount}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

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
