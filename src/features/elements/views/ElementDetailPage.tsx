/**
 * ElementDetailPage View
 *
 * Full-screen view of a single universe element with all details and relationships.
 */

import {
  ArrowLeft,
  CircleNotch,
  Link as LinkIcon,
  PencilSimple,
  Star,
  Trash,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { EditElementModal } from '@/features/elements/components/EditElementModal';
import { ElementTypeIcon } from '@/features/elements/components/ElementTypeIcon';
import { useElementsStore } from '@/features/elements/stores/useElementsStore';
import { useStoriesStore } from '@/features/stories/stores/useStoriesStore';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import type { Element, ElementType, StoryDetail } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

// Format element type for display
const formatElementType = (type: ElementType, customTypeName?: string | null): string => {
  if (type === 'custom' && customTypeName) {
    return customTypeName;
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
};

export function ElementDetailPage() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);

  const { getElement, updateElement, deleteElement } = useElementsStore();
  const { getStory } = useStoriesStore();

  const [element, setElement] = useState<Element | null>(null);
  const [relatedStories, setRelatedStories] = useState<StoryDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get element ID from route
  const elementId = currentRoute.screen === 'element-detail' ? currentRoute.elementId : null;

  // Load element data
  useEffect(() => {
    async function loadElementData() {
      if (!elementId) {
        setError('No element ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Load element
        const loadedElement = await getElement(elementId);
        setElement(loadedElement);

        // Load related stories if any
        if (loadedElement.relatedStoryIds && loadedElement.relatedStoryIds.length > 0) {
          const stories = await Promise.all(
            loadedElement.relatedStoryIds.map((storyId) => getStory(storyId)),
          );
          setRelatedStories(stories);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load element';
        setError(errorMessage);
        setIsLoading(false);
      }
    }

    loadElementData();
  }, [elementId, getElement, getStory]);

  const handleGoBack = () => {
    goBack();
  };

  const handleToggleFavorite = async () => {
    if (!element) return;

    try {
      const updated = await updateElement(element.id, {
        name: null,
        description: null,
        elementType: null,
        customTypeName: null,
        details: null,
        attributes: null,
        imageUrl: null,
        tags: null,
        relationships: null,
        relatedStoryIds: null,
        color: null,
        icon: null,
        favorite: !element.favorite,
        order: null,
      });
      setElement(updated);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedElement: Element) => {
    setElement(updatedElement);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!element) return;

    setIsDeleting(true);
    try {
      await deleteElement(element.id);
      // Navigate back after successful deletion
      navigate({ screen: 'universe-list' });
    } catch (err) {
      console.error('Failed to delete element:', err);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="option-1 typo-1 icons-1"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
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
          Loading element...
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

  // Error state
  if (error || !element) {
    return (
      <div
        className="option-1 typo-1 icons-1 button-2"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 'var(--spacing-4)',
          padding: 'var(--spacing-6)',
        }}
      >
        <div
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--error-soft)',
            color: 'var(--error)',
            borderRadius: '4px',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          {error || 'Element not found'}
        </div>
        <button type="button" className="btn btn-secondary btn-base" onClick={handleGoBack}>
          <ArrowLeft className="icon icon-base" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="option-1 typo-1 icons-1 button-2 card-1"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-6)',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-4)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-base"
            onClick={handleGoBack}
            style={{ padding: 'var(--spacing-2)' }}
          >
            <ArrowLeft className="icon icon-base" />
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-base"
              onClick={handleToggleFavorite}
              title={element.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className="icon icon-base"
                style={{
                  fill: element.favorite ? 'var(--accent)' : 'none',
                  color: element.favorite ? 'var(--accent)' : 'currentColor',
                }}
              />
              {element.favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button type="button" className="btn btn-secondary btn-base" onClick={handleEdit}>
              <PencilSimple className="icon icon-base" />
              Edit
            </button>
            <button type="button" className="btn btn-secondary btn-base" onClick={handleDelete}>
              <Trash className="icon icon-base" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-8)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Element Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-6)',
              marginBottom: 'var(--spacing-8)',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                color: element.color || 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ElementTypeIcon type={element.elementType} size={48} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--type-h1-size)',
                    fontWeight: 'var(--type-h1-weight)',
                    color: 'var(--fg1)',
                    margin: 0,
                  }}
                >
                  {element.name}
                </h1>
                <span
                  style={{
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    fontSize: 'var(--fs-sm)',
                    fontWeight: 'var(--fw-medium)',
                  }}
                >
                  {formatElementType(element.elementType, element.customTypeName)}
                </span>
              </div>
              {element.description && (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--fs-md)',
                    color: 'var(--fg2)',
                    marginTop: 'var(--spacing-3)',
                    marginBottom: 0,
                  }}
                >
                  {element.description}
                </p>
              )}
            </div>
          </div>

          {/* Details Section */}
          {element.details && (
            <div className="card card-base" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-h3-size)',
                  fontWeight: 'var(--type-h3-weight)',
                  color: 'var(--fg1)',
                  marginBottom: 'var(--spacing-3)',
                }}
              >
                Details
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--fs-base)',
                  color: 'var(--fg1)',
                  lineHeight: 'var(--type-body-lh)',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {element.details}
              </p>
            </div>
          )}

          {/* Attributes Section */}
          {element.attributes && Object.keys(element.attributes).length > 0 && (
            <div className="card card-base" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-h3-size)',
                  fontWeight: 'var(--type-h3-weight)',
                  color: 'var(--fg1)',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Attributes
              </h2>
              <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
                {Object.entries(element.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 1fr',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <dt
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-sm)',
                        fontWeight: 'var(--fw-semibold)',
                        color: 'var(--fg2)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-sm)',
                        color: 'var(--fg1)',
                        margin: 0,
                      }}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationships Section */}
          {element.relationships && element.relationships.length > 0 && (
            <div className="card card-base" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-h3-size)',
                  fontWeight: 'var(--type-h3-weight)',
                  color: 'var(--fg1)',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Relationships
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {element.relationships.map((rel) => (
                  <div
                    key={`${rel.targetElementId}-${rel.label}-${rel.inverseLabel ?? ''}-${rel.description ?? ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <LinkIcon className="icon icon-base" style={{ flexShrink: 0 }} />
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--fs-base)',
                          color: 'var(--fg1)',
                          fontWeight: 'var(--fw-medium)',
                        }}
                      >
                        {rel.label}
                      </div>
                      {rel.description && (
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--fs-sm)',
                            color: 'var(--fg2)',
                            marginTop: 'var(--spacing-1)',
                          }}
                        >
                          {rel.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {element.tags && element.tags.length > 0 && (
            <div className="card card-base" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-h3-size)',
                  fontWeight: 'var(--type-h3-weight)',
                  color: 'var(--fg1)',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Tags
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                }}
              >
                {element.tags.map((tag) => (
                  <span
                    key={`${element.id}-tag-${tag}`}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--fg1)',
                      fontSize: 'var(--fs-sm)',
                      fontWeight: 'var(--fw-medium)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Appears In Section */}
          {relatedStories.length > 0 && (
            <div className="card card-base" style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-h3-size)',
                  fontWeight: 'var(--type-h3-weight)',
                  color: 'var(--fg1)',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Appears In
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {relatedStories.map((story) => (
                  <div
                    key={story.id}
                    style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-base)',
                        color: 'var(--fg1)',
                        fontWeight: 'var(--fw-medium)',
                      }}
                    >
                      {story.title}
                    </div>
                    {story.description && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--fs-sm)',
                          color: 'var(--fg2)',
                          marginTop: 'var(--spacing-1)',
                        }}
                      >
                        {story.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && element && (
        <EditElementModal
          element={element}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && element && (
        <ConfirmDeleteModal
          title="Delete Element"
          message="Are you sure you want to delete this element? This action cannot be undone."
          itemName={element.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
