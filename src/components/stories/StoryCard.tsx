/**
 * Story Card Component
 *
 * Reusable card component for displaying a story in the list view.
 * Uses Elevated Shadow card design from design system.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  ScrollText,
  Layers,
  Film,
  Feather,
  BookMarked,
  Star,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { Story, StoryType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

interface StoryCardProps {
  story: Story;
  childCount?: number;
  onClick: (story: Story) => void;
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
  onToggleFavorite: (story: Story) => void;
}

// Map story types to icons
const getStoryIcon = (type: StoryType): React.ReactNode => {
  const iconClass = 'icon icon-lg';

  switch (type) {
    case 'novel':
      return <BookOpen className={iconClass} />;
    case 'series':
      return <Layers className={iconClass} />;
    case 'screenplay':
      return <Film className={iconClass} />;
    case 'short-story':
      return <FileText className={iconClass} />;
    case 'poem':
      return <Feather className={iconClass} />;
    case 'chapter':
      return <BookMarked className={iconClass} />;
    case 'scene':
      return <ScrollText className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

// Format status for display
const formatStatus = (status: string): string => {
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format timestamp as relative time
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export function StoryCard({
  story,
  childCount,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
}: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking action buttons
    if ((e.target as HTMLElement).closest('.story-card-actions')) {
      return;
    }
    onClick(story);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(story);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(story);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(story);
  };

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
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getStoryIcon(story.storyType)}
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
              {story.title}
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
              <span>{formatStatus(story.storyType)}</span>
              {childCount !== undefined && childCount > 0 && (
                <>
                  <span>•</span>
                  <span>{childCount} chapters</span>
                </>
              )}
            </div>
          </div>
          {story.favorite && (
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
        {story.description && (
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
            {story.description}
          </p>
        )}

        {/* Footer: Stats and Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--spacing-2)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Left: Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>{story.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor:
                  story.status === 'completed'
                    ? 'var(--color-success-bg)'
                    : story.status === 'inprogress'
                    ? 'var(--color-primary-bg)'
                    : 'var(--color-surface)',
                color:
                  story.status === 'completed'
                    ? 'var(--color-success)'
                    : story.status === 'inprogress'
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {formatStatus(story.status)}
            </span>
            <span>•</span>
            <span>{formatTimestamp(story.lastEditedAt)}</span>
          </div>

          {/* Right: Hover Actions */}
          {isHovered && (
            <div
              className="story-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleToggleFavorite}
                title={story.favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Star
                  className="icon icon-base"
                  style={{
                    fill: story.favorite ? 'var(--color-accent)' : 'none',
                    color: story.favorite ? 'var(--color-accent)' : 'currentColor',
                  }}
                />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleEdit}
                title="Edit story"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Edit2 className="icon icon-base" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete story"
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
