/**
 * Confirm Delete Modal Component
 *
 * Reusable modal for confirming delete operations.
 * Used instead of window.confirm() which doesn't work in Tauri.
 */

import { Trash, Warning } from '@phosphor-icons/react';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  const titleId = 'confirm-delete-modal-title';
  const messageId = 'confirm-delete-modal-message';
  const itemNameId = 'confirm-delete-modal-item';

  return (
    <div
      className="option-1 typo-1 icons-1 button-2"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
      onMouseDown={
        isDeleting
          ? undefined
          : (e) => {
              if (e.target === e.currentTarget) {
                onCancel();
              }
            }
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={`${messageId} ${itemNameId}`}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          padding: 'var(--spacing-6)',
          maxWidth: '400px',
          width: '90%',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header with warning icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-4)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-error-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Warning size={24} weight="duotone" style={{ color: 'var(--color-error)' }} />
          </div>
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--typography-heading-font)',
              fontSize: 'var(--typography-h3-size)',
              fontWeight: 'var(--typography-h3-weight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id={messageId}
          style={{
            fontFamily: 'var(--typography-body-font)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-3)',
            lineHeight: 'var(--typography-body-line-height)',
          }}
        >
          {message}
        </p>

        {/* Item name highlight */}
        <div
          id={itemNameId}
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-background)',
            borderRadius: '4px',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--typography-body-font)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {itemName}
          </span>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-3)',
          }}
        >
          <button
            className="btn btn-secondary btn-base"
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-base"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'white',
              border: 'none',
            }}
            type="button"
          >
            <Trash className="icon icon-base" weight="duotone" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
