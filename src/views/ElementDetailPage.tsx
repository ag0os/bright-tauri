/**
 * ElementDetailPage View
 *
 * Full-screen view of a single universe element with all details and relationships.
 */

import { useEffect, useState } from 'react';
import {
  User,
  MapPin,
  Car,
  Package,
  Building2,
  Bird,
  Calendar,
  Lightbulb,
  ArrowLeft,
  Star,
  Edit2,
  Trash2,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useElementsStore } from '@/stores/useElementsStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import type { Element, ElementType, Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

// Map element types to Lucide icons
const getElementIcon = (type: ElementType, customIcon?: string | null): React.ReactNode => {
  const iconClass = 'icon icon-2xl';

  // If custom icon (emoji) is provided, render it
  if (customIcon) {
    return (
      <span style={{ fontSize: '48px', lineHeight: 1 }} role="img" aria-label={type}>
        {customIcon}
      </span>
    );
  }

  // Otherwise use Lucide icon based on type
  switch (type) {
    case 'character':
      return <User className={iconClass} />;
    case 'location':
      return <MapPin className={iconClass} />;
    case 'vehicle':
      return <Car className={iconClass} />;
    case 'item':
      return <Package className={iconClass} />;
    case 'organization':
      return <Building2 className={iconClass} />;
    case 'creature':
      return <Bird className={iconClass} />;
    case 'event':
      return <Calendar className={iconClass} />;
    case 'concept':
      return <Lightbulb className={iconClass} />;
    default:
      return <Package className={iconClass} />;
  }
};

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
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get element ID from route
  const elementId =
    currentRoute.screen === 'element-detail' ? currentRoute.elementId : null;

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
            loadedElement.relatedStoryIds.map((storyId) => getStory(storyId))
          );
          setRelatedStories(stories);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load element';
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
    // TODO: Navigate to edit mode or open edit modal
    console.log('Edit element:', element?.id);
  };

  const handleDelete = async () => {
    if (!element) return;

    if (window.confirm(`Are you sure you want to delete "${element.name}"?`)) {
      try {
        await deleteElement(element.id);
        // Navigate back after successful deletion
        navigate({ screen: 'universe-list' });
      } catch (err) {
        console.error('Failed to delete element:', err);
        alert('Failed to delete element. Please try again.');
      }
    }
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
            backgroundColor: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
            borderRadius: '4px',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          {error || 'Element not found'}
        </div>
        <button className="btn btn-secondary btn-base" onClick={handleGoBack}>
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
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-6)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
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
            className="btn btn-ghost btn-base"
            onClick={handleGoBack}
            style={{ padding: 'var(--spacing-2)' }}
          >
            <ArrowLeft className="icon icon-base" />
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <button
              className="btn btn-ghost btn-base"
              onClick={handleToggleFavorite}
              title={element.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className="icon icon-base"
                style={{
                  fill: element.favorite ? 'var(--color-accent)' : 'none',
                  color: element.favorite ? 'var(--color-accent)' : 'currentColor',
                }}
              />
              {element.favorite ? 'Favorited' : 'Favorite'}
            </button>
            <button className="btn btn-secondary btn-base" onClick={handleEdit}>
              <Edit2 className="icon icon-base" />
              Edit
            </button>
            <button className="btn btn-secondary btn-base" onClick={handleDelete}>
              <Trash2 className="icon icon-base" />
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
                color: element.color || 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {getElementIcon(element.elementType, element.icon)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                <h1
                  style={{
                    fontFamily: 'var(--typography-heading-font)',
                    fontSize: 'var(--typography-h1-size)',
                    fontWeight: 'var(--typography-h1-weight)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  {element.name}
                </h1>
                <span
                  style={{
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  {formatElementType(element.elementType, element.customTypeName)}
                </span>
              </div>
              {element.description && (
                <p
                  style={{
                    fontFamily: 'var(--typography-body-font)',
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-text-secondary)',
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
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-3)',
                }}
              >
                Details
              </h2>
              <p
                style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--typography-body-line-height)',
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
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
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
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <dt
                      style={{
                        fontFamily: 'var(--typography-body-font)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd
                      style={{
                        fontFamily: 'var(--typography-body-font)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-primary)',
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
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-4)',
                }}
              >
                Relationships
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {element.relationships.map((rel, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <LinkIcon className="icon icon-base" style={{ flexShrink: 0 }} />
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--typography-body-font)',
                          fontSize: 'var(--font-size-base)',
                          color: 'var(--color-text-primary)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {rel.label}
                      </div>
                      {rel.description && (
                        <div
                          style={{
                            fontFamily: 'var(--typography-body-font)',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
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
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
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
                {element.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
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
                  fontFamily: 'var(--typography-heading-font)',
                  fontSize: 'var(--typography-h3-size)',
                  fontWeight: 'var(--typography-h3-weight)',
                  color: 'var(--color-text-primary)',
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
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--typography-body-font)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {story.title}
                    </div>
                    {story.description && (
                      <div
                        style={{
                          fontFamily: 'var(--typography-body-font)',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
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
    </div>
  );
}
