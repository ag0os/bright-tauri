/**
 * StoriesList View
 *
 * Displays all stories in the current universe with filtering, sorting, and search.
 */

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StoryCard } from '@/components/stories/StoryCard';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import type { Story, StoryType, StoryStatus } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
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

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load stories on mount
  useEffect(() => {
    if (currentUniverse) {
      loadStories(currentUniverse.id);
    }
  }, [currentUniverse, loadStories]);

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'universe') {
      navigate({ screen: 'universe-list' });
    }
  };

  const handleStoryClick = (story: Story) => {
    // For containers (series, chapter), navigate to chapter manager (future)
    // For now, navigate to editor for all
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleEditStory = (story: Story) => {
    navigate({ screen: 'story-editor', storyId: story.id });
  };

  const handleDeleteStory = async (story: Story) => {
    if (window.confirm(`Are you sure you want to delete "${story.title}"?`)) {
      try {
        await deleteStory(story.id);
      } catch (error) {
        console.error('Failed to delete story:', error);
      }
    }
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

  // Get filtered and sorted stories (grouped view - top level only)
  const filteredStories = getFilteredAndSortedStories().filter(
    (story) => !story.parentStoryId
  );

  // Calculate child count for each story
  const allStories = useStoriesStore((state) => state.stories);
  const getChildCount = (storyId: string): number => {
    return allStories.filter((s) => s.parentStoryId === storyId).length;
  };

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
          <button
            className="btn btn-primary btn-base"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="icon icon-base" />
            New Story
          </button>
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
                <Search className="icon icon-base" />
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
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
              }}
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
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
              }}
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
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
              }}
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

        {/* Loading State */}
        {isLoading && (
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
            <Loader2
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
              Loading stories...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredStories.length === 0 && (
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
            <div
              style={{
                fontSize: '64px',
                opacity: 0.2,
              }}
            >
              📚
            </div>
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

        {/* Stories Grid */}
        {!isLoading && filteredStories.length > 0 && (
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
                childCount={getChildCount(story.id)}
                onClick={handleStoryClick}
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Story Modal - Placeholder for Task 38 */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: 'var(--spacing-6)',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '100%',
              fontFamily: 'var(--typography-body-font)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--typography-h3-size)',
                fontWeight: 'var(--typography-h3-weight)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              Create Story Modal
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
              This will be implemented in Task 38.
            </p>
            <button className="btn btn-primary btn-base" onClick={() => setShowCreateModal(false)}>
              Close
            </button>
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
