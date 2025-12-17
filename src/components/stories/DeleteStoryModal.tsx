/**
 * Delete Story Modal Component
 *
 * Specialized wrapper around ConfirmationModal for story deletion.
 * Provides context-aware messaging based on whether the story has chapters.
 */

import { ConfirmationModal } from '../ui/ConfirmationModal';
import type { Story } from '@/types/Story';

export interface DeleteStoryModalProps {
  isOpen: boolean;
  story: Story | null;
  childCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteStoryModal({
  isOpen,
  story,
  childCount,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteStoryModalProps) {
  if (!story) return null;

  // Build message based on whether the story has children
  const getMessage = () => {
    if (childCount === 0) {
      return (
        <>
          <p>
            Are you sure you want to delete <strong>"{story.title}"</strong>?
          </p>
          <p>
            This will permanently remove the story and all its version history.
          </p>
        </>
      );
    }

    return (
      <>
        <p>
          Are you sure you want to delete <strong>"{story.title}"</strong>?
        </p>
        <p>
          This will permanently delete the story along with{' '}
          <strong>
            {childCount} chapter{childCount !== 1 ? 's' : ''}
          </strong>{' '}
          and ALL version history.
        </p>
        <p style={{ color: 'var(--color-error)', fontWeight: 'var(--font-weight-semibold)' }}>
          This action cannot be undone.
        </p>
      </>
    );
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Delete Story"
      message={getMessage()}
      confirmText={isDeleting ? 'Deleting...' : 'Delete Story'}
      cancelText="Cancel"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
      isProcessing={isDeleting}
    />
  );
}
