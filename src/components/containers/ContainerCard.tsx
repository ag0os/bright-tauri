/**
 * Container Card Component
 *
 * Reusable card component for displaying a container in the list view.
 * Shows container type, child count, and leaf/non-leaf status.
 */

import React, { useState } from 'react';
import {
  Book,
  Books,
  FolderOpen,
  GitBranch,
  Gear,
  Trash,
} from '@phosphor-icons/react';
import type { Container } from '@/types';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
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
      return <Book className={iconClass} weight="duotone" />;
    case 'series':
      return <Books className={iconClass} weight="duotone" />;
    case 'collection':
      return <FolderOpen className={iconClass} weight="duotone" />;
    default:
      return <FolderOpen className={iconClass} weight="duotone" />;
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

export function ContainerCard({
  container,
  childCount,
  onClick,
  onDelete,
}: ContainerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigationStore((state) => state.navigate);

  // A leaf container has a git repo (contains stories)
  const isLeaf = !!container.gitRepoPath;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking action buttons
    if ((e.target as HTMLElement).closest('.container-card-actions')) {
      return;
    }
    onClick(container);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(container);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ screen: 'container-settings', containerId: container.id });
  };

  const totalChildren = childCount
    ? childCount.containers + childCount.stories
    : 0;

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
            {getContainerIcon(container.containerType)}
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
              {container.title}
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
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {formatContainerType(container.containerType)}
              </span>
              {isLeaf && (
                <>
                  <span>•</span>
                  <GitBranch
                    className="icon icon-sm"
                    weight="duotone"
                    style={{ color: 'var(--color-success)' }}
                  />
                  <span style={{ fontSize: 'var(--font-size-xs)' }}>Leaf</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {container.description && (
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
            {childCount && (
              <>
                {childCount.containers > 0 && (
                  <>
                    <span>{childCount.containers} {childCount.containers === 1 ? 'container' : 'containers'}</span>
                  </>
                )}
                {childCount.stories > 0 && (
                  <>
                    {childCount.containers > 0 && <span>•</span>}
                    <span>{childCount.stories} {childCount.stories === 1 ? 'story' : 'stories'}</span>
                  </>
                )}
                {totalChildren > 0 && <span>•</span>}
              </>
            )}
            <span>{formatTimestamp(container.updatedAt)}</span>
          </div>

          {/* Right: Hover Actions */}
          {isHovered && (
            <div
              className="container-card-actions"
              style={{
                display: 'flex',
                gap: 'var(--spacing-1)',
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleSettings}
                title="Container settings"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Gear className="icon icon-base" weight="duotone" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete container"
                style={{ padding: 'var(--spacing-1)' }}
              >
                <Trash className="icon icon-base" weight="duotone" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
