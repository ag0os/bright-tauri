/**
 * Story Card Component
 *
 * Reusable card component for displaying a story in the list view.
 * Uses Elevated Shadow card design from design system.
 */

import {
  BookBookmark,
  Feather,
  FileText,
  FilmStrip,
  Gear,
  Scroll,
  Star,
  Trash,
} from '@phosphor-icons/react';
import type React from 'react';
import { useState } from 'react';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import type { StorySummary, StoryType } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

interface StoryCardProps {
  story: StorySummary;
  onClick: (story: StorySummary) => void;
  onDelete: (story: StorySummary) => void;
  onToggleFavorite: (story: StorySummary) => void;
}

// Map story types to icons (content-only types)
const getStoryIcon = (type: StoryType): React.ReactNode => {
  const iconClass = 'icon icon-lg';

  switch (type) {
    case 'screenplay':
      return <FilmStrip className={iconClass} />;
    case 'short-story':
      return <FileText className={iconClass} />;
    case 'poem':
      return <Feather className={iconClass} />;
    case 'chapter':
      return <BookBookmark className={iconClass} />;
    case 'scene':
      return <Scroll className={iconClass} />;
    case 'episode':
      return <FilmStrip className={iconClass} />;
    case 'outline':
      return <FileText className={iconClass} />;
    case 'treatment':
      return <FileText className={iconClass} />;
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

export function StoryCard({ story, onClick, onDelete, onToggleFavorite }: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigationStore((state) => state.navigate);

  const handleCardClick = () => {
    onClick(story);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onClick(story);
  };

  const handleCardBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsFocused(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(story);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(story);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ screen: 'story-settings', storyId: story.id });
  };

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
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getStoryIcon(story.storyType)}
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
              {story.title}
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
              <span>{formatStatus(story.storyType)}</span>
            </div>
          </div>
          {story.favorite && (
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
        {story.description && (
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
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Left: Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--fg2)',
            }}
          >
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor:
                  story.status === 'completed'
                    ? 'var(--success-soft)'
                    : story.status === 'inprogress'
                      ? 'var(--accent-subtle)'
                      : 'var(--surface)',
                color:
                  story.status === 'completed'
                    ? 'var(--success)'
                    : story.status === 'inprogress'
                      ? 'var(--accent)'
                      : 'var(--fg2)',
                fontWeight: 'var(--fw-medium)',
              }}
            >
              {formatStatus(story.status)}
            </span>
            <span>•</span>
            <span>{formatTimestamp(story.lastEditedAt)}</span>
          </div>

          {/* Right: Hover Actions */}
          {showActions && (
            <div
              className="story-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleToggleFavorite}
                title={story.favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Star
                  className="icon icon-base"
                  weight={story.favorite ? 'fill' : undefined}
                  style={{
                    color: story.favorite ? 'var(--accent)' : 'currentColor',
                  }}
                />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSettings}
                title="Story settings"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Gear className="icon icon-base" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete story"
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
