/**
 * Confirm Delete Modal Component
 *
 * Reusable modal for confirming delete operations.
 * Used instead of window.confirm() which doesn't work in Tauri.
 */

import { Trash, Warning } from '@phosphor-icons/react';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
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
          backgroundColor: 'var(--surface)',
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
              backgroundColor: 'var(--error-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Warning size={24} style={{ color: 'var(--error)' }} />
          </div>
          <h2
            id={titleId}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-h3-size)',
              fontWeight: 'var(--type-h3-weight)',
              color: 'var(--fg1)',
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
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-base)',
            color: 'var(--fg2)',
            marginBottom: 'var(--spacing-3)',
            lineHeight: 'var(--type-body-lh)',
          }}
        >
          {message}
        </p>

        {/* Item name highlight */}
        <div
          id={itemNameId}
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--bg)',
            borderRadius: '4px',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-base)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--fg1)',
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
              backgroundColor: 'var(--error)',
              color: 'white',
              border: 'none',
            }}
            type="button"
          >
            <Trash className="icon icon-base" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
