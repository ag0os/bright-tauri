/**
 * UniverseList View
 *
 * Displays all elements in the current universe with filtering, sorting, and search.
 */

import { useEffect, useState } from 'react';
import { Plus, MagnifyingGlass, CircleNotch, GlobeHemisphereWest } from '@phosphor-icons/react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ElementCard } from '@/components/universe/ElementCard';
import { CreateElementModal } from '@/components/universe/CreateElementModal';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useElementsStore } from '@/stores/useElementsStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import type { Element, ElementType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';

type SortOption = 'name' | 'lastEdited' | 'type';

export function UniverseList() {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);

  const {
    isLoading,
    error,
    loadElements,
    deleteElement,
    updateElement,
    filters,
    setFilter,
    getFilteredElements,
  } = useElementsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Load elements on mount
  useEffect(() => {
    if (currentUniverse) {
      loadElements(currentUniverse.id);
    }
  }, [currentUniverse, loadElements]);

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'stories') {
      navigate({ screen: 'stories-list' });
    }
  };

  const handleElementClick = (element: Element) => {
    navigate({ screen: 'element-detail', elementId: element.id });
  };

  const handleEditElement = (element: Element) => {
    navigate({ screen: 'element-detail', elementId: element.id });
  };

  const handleDeleteElement = async (element: Element) => {
    if (window.confirm(`Are you sure you want to delete "${element.name}"?`)) {
      try {
        await deleteElement(element.id);
      } catch (error) {
        console.error('Failed to delete element:', error);
      }
    }
  };

  const handleToggleFavorite = async (element: Element) => {
    try {
      await updateElement(element.id, {
        name: null,
        description: null,
        elementType: null,
        customTypeName: null,
        details: null,
        attributes: null,
        imageUrl: null,
        tags: null,
        relationships: null,
        color: null,
        icon: null,
        favorite: !element.favorite,
        relatedStoryIds: null,
        order: null,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Get filtered and sorted elements
  const filteredElements = getFilteredElements();

  // Apply sorting
  const sortedElements = [...filteredElements].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'lastEdited':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'type':
        return a.elementType.localeCompare(b.elementType);
      default:
        return 0;
    }
  });

  return (
    <PageLayout activeTab="universe" onTabChange={handleTabChange}>
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
            Universe Elements
          </h1>
          <button
            className="btn btn-primary btn-base"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="icon icon-base" />
            New Element
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
                <MagnifyingGlass className="icon icon-base" weight="duotone" />
              </div>
              <input
                type="text"
                className="input-field input-base has-prefix"
                placeholder="Search elements..."
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
                setFilter('type', e.target.value ? (e.target.value as ElementType) : null)
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
              <option value="character">Character</option>
              <option value="location">Location</option>
              <option value="vehicle">Vehicle</option>
              <option value="item">Item</option>
              <option value="organization">Organization</option>
              <option value="creature">Creature</option>
              <option value="event">Event</option>
              <option value="concept">Concept</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Sort */}
          <div className="input-group input-5" style={{ minWidth: '150px' }}>
            <select
              className="input-field input-base"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
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
              <option value="name">Name</option>
              <option value="lastEdited">Recently Updated</option>
              <option value="type">Type</option>
            </select>
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
              Loading elements...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedElements.length === 0 && (
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
            <GlobeHemisphereWest
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
              No elements yet
            </h2>
            <p
              style={{
                fontFamily: 'var(--typography-body-font)',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
                maxWidth: '400px',
              }}
            >
              {filters.searchQuery || filters.type
                ? 'No elements match your filters. Try adjusting your search or filters.'
                : 'Build your universe by creating your first element!'}
            </p>
            {!filters.searchQuery && !filters.type && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="icon icon-base" />
                Create Your First Element
              </button>
            )}
          </div>
        )}

        {/* Elements Grid */}
        {!isLoading && sortedElements.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--spacing-6)',
              alignItems: 'start',
            }}
          >
            {sortedElements.map((element) => (
              <ElementCard
                key={element.id}
                element={element}
                onClick={handleElementClick}
                onEdit={handleEditElement}
                onDelete={handleDeleteElement}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Element Modal */}
      {showCreateModal && <CreateElementModal onClose={() => setShowCreateModal(false)} />}

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
