/**
 * UniverseList View
 *
 * Displays all elements in the current universe with filtering, sorting, and search.
 */

import { CircleNotch, GlobeHemisphereWest, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { CreateElementModal } from '@/features/elements/components/CreateElementModal';
import { EditElementModal } from '@/features/elements/components/EditElementModal';
import { ElementCard } from '@/features/elements/components/ElementCard';
import { useElementsStore } from '@/features/elements/stores/useElementsStore';
import { useUniverseStore } from '@/features/universe/stores/useUniverseStore';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { PageLayout } from '@/shared/components/PageLayout';
import { ELEMENT_TYPE_OPTIONS } from '@/shared/config/filter-options';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import type { Element, ElementType } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
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
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [deletingElement, setDeletingElement] = useState<Element | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
    setEditingElement(element);
  };

  const handleDeleteElement = (element: Element) => {
    setDeletingElement(element);
  };

  const handleConfirmDelete = async () => {
    if (!deletingElement) return;

    setIsDeleting(true);
    try {
      await deleteElement(deletingElement.id);
      setDeletingElement(null);
    } catch (error) {
      console.error('Failed to delete element:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingElement(null);
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
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h2-size)',
              fontWeight: 'var(--type-h2-weight)',
              color: 'var(--fg1)',
              margin: 0,
            }}
          >
            Universe Elements
          </h1>
          <button
            type="button"
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
                <MagnifyingGlass className="icon icon-base" />
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
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-base)',
                color: 'var(--fg1)',
              }}
            >
              <option value="">All Types</option>
              {ELEMENT_TYPE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="input-group input-5" style={{ minWidth: '150px' }}>
            <select
              className="input-field input-base"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: 'var(--spacing-2) var(--spacing-3)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-base)',
                color: 'var(--fg1)',
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
              backgroundColor: 'var(--error-soft)',
              color: 'var(--error)',
              borderRadius: '4px',
              marginBottom: 'var(--spacing-6)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-sm)',
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
              style={{
                color: 'var(--fg2)',
                opacity: 0.4,
              }}
            />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-h3-size)',
                fontWeight: 'var(--type-h3-weight)',
                color: 'var(--fg1)',
                margin: 0,
              }}
            >
              No elements yet
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-base)',
                color: 'var(--fg2)',
                maxWidth: '400px',
              }}
            >
              {filters.searchQuery || filters.type
                ? 'No elements match your filters. Try adjusting your search or filters.'
                : 'Build your universe by creating your first element!'}
            </p>
            {!filters.searchQuery && !filters.type && (
              <button
                type="button"
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

      {/* Edit Element Modal */}
      {editingElement && (
        <EditElementModal
          element={editingElement}
          onClose={() => setEditingElement(null)}
          onSuccess={() => {
            // Reload elements to get the updated data
            if (currentUniverse) {
              loadElements(currentUniverse.id);
            }
            setEditingElement(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingElement && (
        <ConfirmDeleteModal
          title="Delete Element"
          message="Are you sure you want to delete this element? This action cannot be undone."
          itemName={deletingElement.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
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
