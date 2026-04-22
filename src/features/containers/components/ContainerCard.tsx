/**
 * Container Card Component
 *
 * Reusable card component for displaying a container in the list view.
 * Shows container type, child count, and leaf/non-leaf status.
 */

import { Book, Books, FolderOpen, Gear, Trash } from '@phosphor-icons/react';
import type React from 'react';
import { useState } from 'react';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import type { Container } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

interface ContainerCardProps {
  container: Container;
  childCount?: { containers: number; stories: number };
  onClick: (container: Container) => void;
  onDelete: (container: Container) => void;
}

// Map container types to icons
const getContainerIcon = (type: string): React.ReactNode => {
  const iconClass = 'icon icon-lg';

  switch (type) {
    case 'novel':
      return <Book className={iconClass} />;
    case 'series':
      return <Books className={iconClass} />;
    case 'collection':
      return <FolderOpen className={iconClass} />;
    default:
      return <FolderOpen className={iconClass} />;
  }
};

// Format container type for display
const formatContainerType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
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

export function ContainerCard({ container, childCount, onClick, onDelete }: ContainerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigationStore((state) => state.navigate);

  const handleCardClick = () => {
    onClick(container);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onClick(container);
  };

  const handleCardBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsFocused(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(container);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ screen: 'container-settings', containerId: container.id });
  };

  const totalChildren = childCount ? childCount.containers + childCount.stories : 0;
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
            {getContainerIcon(container.containerType)}
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
              {container.title}
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
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  fontWeight: 'var(--fw-medium)',
                }}
              >
                {formatContainerType(container.containerType)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {container.description && (
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
            {container.description}
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
            {childCount && (
              <>
                {childCount.containers > 0 && (
                  <span>
                    {childCount.containers}{' '}
                    {childCount.containers === 1 ? 'container' : 'containers'}
                  </span>
                )}
                {childCount.stories > 0 && (
                  <>
                    {childCount.containers > 0 && <span>•</span>}
                    <span>
                      {childCount.stories} {childCount.stories === 1 ? 'story' : 'stories'}
                    </span>
                  </>
                )}
                {totalChildren > 0 && <span>•</span>}
              </>
            )}
            <span>{formatTimestamp(container.updatedAt)}</span>
          </div>

          {/* Right: Hover Actions */}
          {showActions && (
            <div
              className="container-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleSettings}
                title="Container settings"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Gear className="icon icon-base" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete container"
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
