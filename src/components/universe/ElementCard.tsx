/**
 * Element Card Component
 *
 * Reusable card component for displaying a universe element in the list view.
 * Uses Elevated Shadow card design from design system.
 */

import React, { useState } from 'react';
import {
  User,
  MapPin,
  Car,
  Package,
  Building2,
  Dragon,
  Calendar,
  Lightbulb,
  Star,
  Edit2,
  Trash2,
  Link,
} from 'lucide-react';
import type { Element, ElementType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
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

// Map element types to Lucide icons
const getElementIcon = (type: ElementType, customIcon?: string | null): React.ReactNode => {
  const iconClass = 'icon icon-lg';

  // If custom icon (emoji) is provided, render it
  if (customIcon) {
    return (
      <span style={{ fontSize: '24px', lineHeight: 1 }} role="img" aria-label={type}>
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
      return <Dragon className={iconClass} />;
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

export function ElementCard({
  element,
  relationshipCount,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
}: ElementCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking action buttons
    if ((e.target as HTMLElement).closest('.element-card-actions')) {
      return;
    }
    onClick(element);
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

  return (
    <div
      className="option-1 typo-1 icons-1 button-2 card-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="card card-base card-interactive"
        onClick={handleCardClick}
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
              color: element.color || 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getElementIcon(element.elementType, element.icon)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
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
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
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
              style={{
                color: 'var(--color-accent)',
                fill: 'var(--color-accent)',
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Description */}
        {element.description && (
          <p
            style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 'var(--typography-body-line-height)',
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
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Left: Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
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
                {element.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 'var(--font-weight-medium)',
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
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    +{element.tags.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                No tags
              </span>
            )}
          </div>

          {/* Right: Hover Actions */}
          {isHovered && (
            <div
              className="element-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleToggleFavorite}
                title={element.favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Star
                  className="icon icon-base"
                  style={{
                    fill: element.favorite ? 'var(--color-accent)' : 'none',
                    color: element.favorite ? 'var(--color-accent)' : 'currentColor',
                  }}
                />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleEdit}
                title="Edit element"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Edit2 className="icon icon-base" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete element"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Trash2 className="icon icon-base" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
