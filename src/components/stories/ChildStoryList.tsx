/**
 * Child Story List Component
 *
 * Displays an ordered list of child stories (chapters, scenes) for a parent story.
 * Supports drag-and-drop reordering, editing, and deletion.
 */

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BookMarked,
  ScrollText,
  FileText,
  Edit2,
  Trash2,
  GripVertical,
} from 'lucide-react';
import type { Story, StoryType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/organisms/card/elevated-shadow.css';
import '@/design-system/tokens/spacing.css';

interface ChildStoryListProps {
  children: Story[];
  isLoading: boolean;
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
  onReorder: (storyIds: string[]) => Promise<void>;
  onSelect: (story: Story) => void;
}

// Map story types to icons
const getStoryIcon = (type: StoryType): React.ReactNode => {
  const iconClass = 'icon icon-base';

  switch (type) {
    case 'chapter':
      return <BookMarked className={iconClass} />;
    case 'scene':
      return <ScrollText className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
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

interface SortableItemProps {
  child: Story;
  index: number;
  isHovered: boolean;
  isDragging: boolean;
  onHover: (index: number | null) => void;
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
  onSelect: (story: Story) => void;
}

function SortableItem({
  child,
  index,
  isHovered,
  isDragging,
  onHover,
  onEdit,
  onDelete,
  onSelect,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: child.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          padding: 'var(--spacing-3) var(--spacing-4)',
          backgroundColor: isHovered ? 'var(--color-surface-hover)' : 'var(--color-surface)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          border: '1px solid var(--color-border)',
        }}
        onClick={() => onSelect(child)}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-2)',
            marginLeft: 'calc(-1 * var(--spacing-2))',
            borderRadius: '4px',
            backgroundColor: isHovered ? 'var(--color-primary-bg)' : 'transparent',
            color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'grab',
            transition: 'all 0.15s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical
            className="icon icon-base"
            style={{
              opacity: isHovered ? 1 : 0.6,
              transition: 'opacity 0.15s ease',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              minWidth: '20px',
            }}
          >
            {index + 1}
          </span>
        </div>

        {/* Icon */}
        <div style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
          {getStoryIcon(child.storyType)}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {child.title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}
          >
            <span>{child.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{formatTimestamp(child.lastEditedAt)}</span>
          </div>
        </div>

        {/* Actions (visible on hover) */}
        {isHovered && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit/Delete buttons */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(child)}
              title="Edit chapter"
              style={{ padding: 'var(--spacing-1)' }}
            >
              <Edit2 className="icon icon-sm" />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onDelete(child)}
              title="Delete chapter"
              style={{ padding: 'var(--spacing-1)' }}
            >
              <Trash2 className="icon icon-sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Overlay item shown while dragging
function DragOverlayItem({ child, index }: { child: Story; index: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        padding: 'var(--spacing-3) var(--spacing-4)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '6px',
        border: '2px solid var(--color-primary)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        cursor: 'grabbing',
      }}
    >
      {/* Drag handle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <GripVertical className="icon icon-sm" />
        <span
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            minWidth: '24px',
          }}
        >
          {index + 1}
        </span>
      </div>

      {/* Icon */}
      <div style={{ color: 'var(--color-primary)', flexShrink: 0 }}>
        {getStoryIcon(child.storyType)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {child.title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            marginTop: '2px',
          }}
        >
          <span>{child.wordCount.toLocaleString()} words</span>
        </div>
      </div>
    </div>
  );
}

export function ChildStoryList({
  children,
  isLoading,
  onEdit,
  onDelete,
  onReorder,
  onSelect,
}: ChildStoryListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<Story[]>(children);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep items in sync with children prop
  if (children !== items && !isReordering) {
    setItems(children);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setHoveredIndex(null);
    setError(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Optimistic update
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      setIsReordering(true);

      try {
        // Call backend
        await onReorder(newItems.map((item) => item.id));
        setError(null);
      } catch (err) {
        // Revert on error
        console.error('Failed to reorder:', err);
        setItems(children);
        setError('Failed to save new order. Please try again.');
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;
  const activeIndex = activeId ? items.findIndex((item) => item.id === activeId) : -1;

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Loading chapters...
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8)',
          textAlign: 'center',
          gap: 'var(--spacing-3)',
        }}
      >
        <div style={{ fontSize: '48px', opacity: 0.3 }}>📄</div>
        <p
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
          }}
        >
          No chapters yet. Create your first chapter to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="option-1 typo-1 icons-1 button-2">
      {/* Error message */}
      {error && (
        <div
          style={{
            padding: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-3)',
            backgroundColor: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
            borderRadius: '4px',
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}
          >
            {items.map((child, index) => (
              <SortableItem
                key={child.id}
                child={child}
                index={index}
                isHovered={hoveredIndex === index && !activeId}
                isDragging={activeId === child.id}
                onHover={setHoveredIndex}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <DragOverlayItem child={activeItem} index={activeIndex} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
