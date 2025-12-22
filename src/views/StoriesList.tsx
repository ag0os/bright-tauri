/**
 * StoriesList View
 *
 * Displays all stories in the current universe with filtering, sorting, and search.
 */

import { useEffect, useState } from 'react';
import { Plus, MagnifyingGlass, CircleNotch, Books, FolderPlus } from '@phosphor-icons/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StoryCard, CreateStoryModal, DeleteStoryModal } from '@/components/stories';
import { CreateContainerModal } from '@/components/containers/CreateContainerModal';
import { ContainerCard } from '@/components/containers/ContainerCard';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useContainersStore } from '@/stores/useContainersStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import type { Story, StoryType, StoryStatus, Container } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';

export function StoriesList() {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);

  const {
    isLoading,
    error,
    loadStories,
    deleteStory,
    updateStory,
    filters,
    setFilter,
    getFilteredAndSortedStories,
    setSorting,
    sortBy,
    sortOrder,
  } = useStoriesStore();

  const {
    containers,
    isLoading: containersLoading,
    error: containersError,
    loadContainers,
    deleteContainer,
  } = useContainersStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateContainerModal, setShowCreateContainerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [deleteChildCount, setDeleteChildCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [containerToDelete, setContainerToDelete] = useState<Container | null>(null);
  const [showDeleteContainerModal, setShowDeleteContainerModal] = useState(false);
  const [isDeletingContainer, setIsDeletingContainer] = useState(false);

  // Load stories and containers on mount
  useEffect(() => {
    if (currentUniverse) {
      loadStories(currentUniverse.id);
      loadContainers(currentUniverse.id);
    }
  }, [currentUniverse, loadStories, loadContainers]);

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'universe') {
      navigate({ screen: 'universe-list' });
    }
  };

  const handleStoryClick = (story: Story) => {
    // All stories are content now - always navigate to editor
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleDeleteStory = async (story: Story) => {
    // Stories no longer have children (handled by containers)
    setStoryToDelete(story);
    setDeleteChildCount(0);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStory(storyToDelete.id);
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

  const handleToggleFavorite = async (story: Story) => {
    try {
      await updateStory(story.id, {
        title: null,
        description: null,
        storyType: null,
        status: null,
        content: null,
        notes: null,
        outline: null,
        targetWordCount: null,
        order: null,
        tags: null,
        color: null,
        favorite: !story.favorite,
        relatedElementIds: null,
        seriesName: null,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleContainerClick = (container: Container) => {
    navigate({ screen: 'container-view', containerId: container.id });
  };

  const handleDeleteContainer = async (container: Container) => {
    setContainerToDelete(container);
    setShowDeleteContainerModal(true);
  };

  const handleConfirmDeleteContainer = async () => {
    if (!containerToDelete) return;

    setIsDeletingContainer(true);
    try {
      await deleteContainer(containerToDelete.id);
      setShowDeleteContainerModal(false);
      setContainerToDelete(null);
    } catch (error) {
      console.error('Failed to delete container:', error);
    } finally {
      setIsDeletingContainer(false);
    }
  };

  const handleCancelDeleteContainer = () => {
    setShowDeleteContainerModal(false);
    setContainerToDelete(null);
    setIsDeletingContainer(false);
  };

  // Get filtered and sorted stories (grouped view - top level only)
  // Filter to show only stories not in containers (root stories)
  const filteredStories = getFilteredAndSortedStories().filter(
    (story) => !story.containerId
  );

  // Get root-level containers (no parentContainerId)
  const rootContainers = containers.filter((c) => !c.parentContainerId);

  // Stories no longer have children (that's handled by containers now)

  return (
    <PageLayout activeTab="stories" onTabChange={handleTabChange}>
      <div
        className="option-1 typo-1 icons-1 button-2 input-5"
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
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--typography-heading-font)',
              fontSize: 'var(--typography-h2-size)',
              fontWeight: 'var(--typography-h2-weight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Stories
          </h1>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <button
              className="btn btn-outline btn-base"
              onClick={() => setShowCreateContainerModal(true)}
              title="Create a container (Novel, Series, Collection)"
            >
              <FolderPlus className="icon icon-base" />
              New Container
            </button>
            <button
              className="btn btn-primary btn-base"
              onClick={() => setShowCreateModal(true)}
              title="Create a standalone story"
            >
              <Plus className="icon icon-base" />
              New Story
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-6)',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div className="input-group input-5" style={{ flex: '1', minWidth: '250px' }}>
            <div className="input-wrapper">
              <div className="input-icon-prefix">
                <MagnifyingGlass className="icon icon-base" weight="duotone" />
              </div>
              <input
                type="text"
                className="input-field input-base has-prefix"
                placeholder="Search stories..."
                value={filters.searchQuery}
                onChange={(e) => setFilter('searchQuery', e.target.value)}
              />
            </div>
          </div>

          {/* Filter by Type */}
          <div className="input-group input-5" style={{ minWidth: '150px' }}>
            <select
              className="input-field input-base"
              value={filters.type || ''}
              onChange={(e) =>
                setFilter('type', e.target.value ? (e.target.value as StoryType) : null)
              }
            >
              <option value="">All Types</option>
              <option value="novel">Novel</option>
              <option value="series">Series</option>
              <option value="screenplay">Screenplay</option>
              <option value="short-story">Short Story</option>
              <option value="poem">Poem</option>
              <option value="chapter">Chapter</option>
              <option value="scene">Scene</option>
              <option value="episode">Episode</option>
              <option value="outline">Outline</option>
              <option value="treatment">Treatment</option>
              <option value="collection">Collection</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="input-group input-5" style={{ minWidth: '150px' }}>
            <select
              className="input-field input-base"
              value={filters.status || ''}
              onChange={(e) =>
                setFilter('status', e.target.value ? (e.target.value as StoryStatus) : null)
              }
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort */}
          <div className="input-group input-5" style={{ minWidth: '150px' }}>
            <select
              className="input-field input-base"
              value={sortBy}
              onChange={(e) =>
                setSorting(
                  e.target.value as 'lastEdited' | 'title' | 'wordCount',
                  sortOrder
                )
              }
            >
              <option value="lastEdited">Last Edited</option>
              <option value="title">Title</option>
              <option value="wordCount">Word Count</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            className="btn btn-outline btn-base"
            onClick={() => setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Error State */}
        {(error || containersError) && (
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
            {error || containersError}
          </div>
        )}

        {/* Loading State */}
        {(isLoading || containersLoading) && (
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
              Loading...
            </p>
          </div>
        )}

        {/* Containers Section */}
        {!isLoading && !containersLoading && rootContainers.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--typography-h3-size)',
                fontWeight: 'var(--typography-h3-weight)',
                color: 'var(--color-text-primary)',
                margin: 0,
                marginBottom: 'var(--spacing-4)',
              }}
            >
              Containers
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--spacing-6)',
                alignItems: 'start',
              }}
            >
              {rootContainers.map((container) => (
                <ContainerCard
                  key={container.id}
                  container={container}
                  onClick={handleContainerClick}
                  onDelete={handleDeleteContainer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standalone Stories Section */}
        {!isLoading && !containersLoading && filteredStories.length > 0 && (
          <div>
            {rootContainers.length > 0 && (
              <h2
                style={{
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Standalone Stories
              </h2>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--spacing-6)',
                alignItems: 'start',
              }}
            >
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={handleStoryClick}
                  onDelete={handleDeleteStory}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !containersLoading && filteredStories.length === 0 && rootContainers.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 'var(--spacing-4)',
              textAlign: 'center',
            }}
          >
            <Books
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
              No stories yet
            </h2>
            <p
              style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                maxWidth: '400px',
              }}
            >
              {filters.searchQuery || filters.type || filters.status
                ? 'No stories match your filters. Try adjusting your search or filters.'
                : 'Get started by creating your first story!'}
            </p>
            {!filters.searchQuery && !filters.type && !filters.status && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="icon icon-base" />
                Create Your First Story
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Container Modal */}
      {showCreateContainerModal && (
        <CreateContainerModal onClose={() => setShowCreateContainerModal(false)} />
      )}

      {/* Create Story Modal */}
      {showCreateModal && <CreateStoryModal onClose={() => setShowCreateModal(false)} />}

      {/* Delete Story Modal */}
      <DeleteStoryModal
        isOpen={showDeleteModal}
        story={storyToDelete}
        childCount={deleteChildCount}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {/* Delete Container Modal */}
      {showDeleteContainerModal && containerToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCancelDeleteContainer}
        >
          <div
            className="card card-base option-1 typo-1 button-2"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              padding: 'var(--spacing-6)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--typography-h3-size)',
                fontWeight: 'var(--typography-h3-weight)',
                color: 'var(--color-text-primary)',
                margin: 0,
                marginBottom: 'var(--spacing-4)',
              }}
            >
              Delete Container?
            </h2>
            <p
              style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                marginBottom: 'var(--spacing-6)',
              }}
            >
              Are you sure you want to delete "{containerToDelete.title}"? This action cannot be
              undone. All child containers and stories will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline btn-base"
                onClick={handleCancelDeleteContainer}
                disabled={isDeletingContainer}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-base"
                onClick={handleConfirmDeleteContainer}
                disabled={isDeletingContainer}
                style={{
                  backgroundColor: 'var(--color-error)',
                }}
              >
                {isDeletingContainer ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </PageLayout>
  );
}
