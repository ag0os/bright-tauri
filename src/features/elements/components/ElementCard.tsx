/**
 * Element Card Component
 *
 * Reusable card component for displaying a universe element in the list view.
 * Uses Elevated Shadow card design from design system.
 */

import { Link, PencilSimple, Star, Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { ElementTypeIcon } from '@/features/elements/components/ElementTypeIcon';
import type { Element, ElementType } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

interface ElementCardProps {
  element: Element;
  relationshipCount?: number;
  onClick: (element: Element) => void;
  onEdit: (element: Element) => void;
  onDelete: (element: Element) => void;
  onToggleFavorite: (element: Element) => void;
}

// Format element type for display
const formatElementType = (type: ElementType, customTypeName?: string | null): string => {
  if (type === 'custom' && customTypeName) {
    return customTypeName;
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
};

export function ElementCard({
  element,
  relationshipCount,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ElementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleCardClick = () => {
    onClick(element);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onClick(element);
  };

  const handleCardBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsFocused(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(element);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(element);
  };

  // Calculate relationship count from element data if not provided
  const actualRelationshipCount =
    relationshipCount !== undefined
      ? relationshipCount
      : (element.relationships?.length ?? 0) + (element.relatedStoryIds?.length ?? 0);
  const showActions = isHovered || isFocused;

  return (
    <div className="option-1 typo-1 icons-1 button-2 card-1">
      {/* biome-ignore lint/a11y/useSemanticElements: the card surface contains native action buttons, so a wrapper button would create invalid nested buttons */}
      <div
        className="card card-base card-interactive"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleCardBlur}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
        }}
      >
        {/* Header: Icon and Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
          <div
            style={{
              flexShrink: 0,
              color: element.color || 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ElementTypeIcon type={element.elementType} size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-md)',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--fg1)',
                margin: 0,
                marginBottom: 'var(--spacing-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {element.name}
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                fontSize: 'var(--fs-sm)',
                color: 'var(--fg2)',
              }}
            >
              <span>{formatElementType(element.elementType, element.customTypeName)}</span>
              {actualRelationshipCount > 0 && (
                <>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Link className="icon icon-sm" style={{ width: '14px', height: '14px' }} />
                    {actualRelationshipCount} {actualRelationshipCount === 1 ? 'link' : 'links'}
                  </span>
                </>
              )}
            </div>
          </div>
          {element.favorite && (
            <Star
              className="icon icon-base"
              weight="fill"
              style={{
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Description */}
        {element.description && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-sm)',
              color: 'var(--fg2)',
              margin: 0,
              lineHeight: 'var(--type-body-lh)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {element.description}
          </p>
        )}

        {/* Footer: Tags and Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--spacing-2)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Left: Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--fg2)',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {element.tags && element.tags.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  flexWrap: 'wrap',
                }}
              >
                {element.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`${element.id}-tag-${tag}`}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--fg2)',
                      fontWeight: 'var(--fw-medium)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {element.tags.length > 3 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      color: 'var(--fg2)',
                    }}
                  >
                    +{element.tags.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--fg3)', fontStyle: 'italic' }}>No tags</span>
            )}
          </div>

          {/* Right: Hover Actions */}
          {showActions && (
            <div
              className="element-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleToggleFavorite}
                title={element.favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Star
                  className="icon icon-base"
                  weight={element.favorite ? 'fill' : undefined}
                  style={{
                    color: element.favorite ? 'var(--accent)' : 'currentColor',
                  }}
                />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleEdit}
                title="Edit element"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <PencilSimple className="icon icon-base" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete element"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Trash className="icon icon-base" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
