/**
 * Confirmation Modal Component
 *
 * Generic reusable modal for confirmation scenarios (delete, warning, info).
 * Provides accessible keyboard navigation and focus management.
 */

import React, { useEffect, useRef } from 'react';
import { Warning, Info, WarningCircle } from '@phosphor-icons/react';
import './ConfirmationModal.css';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when modal opens (safer default than confirm)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isProcessing, onCancel]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  // Get variant-specific styling
  const variantConfig = {
    danger: {
      icon: Warning,
      iconBgColor: 'var(--color-error-subtle)',
      iconColor: 'var(--color-error)',
      confirmBgColor: 'var(--color-error)',
    },
    warning: {
      icon: WarningCircle,
      iconBgColor: 'var(--color-warning-bg)',
      iconColor: 'var(--color-warning)',
      confirmBgColor: 'var(--color-warning)',
    },
    info: {
      icon: Info,
      iconBgColor: 'var(--color-info-light)',
      iconColor: 'var(--color-info)',
      confirmBgColor: 'var(--color-primary)',
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className="confirmation-modal-overlay option-1 typo-1 icons-1 button-2"
      onClick={isProcessing ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div
        ref={modalRef}
        className="confirmation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with icon */}
        <div className="confirmation-modal-header">
          <div
            className="confirmation-modal-icon-wrapper"
            style={{ backgroundColor: config.iconBgColor }}
          >
            <IconComponent
              size={24}
              weight="duotone"
              style={{ color: config.iconColor }}
              aria-hidden="true"
            />
          </div>
          <h2
            id="modal-title"
            className="confirmation-modal-title"
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <div
          id="modal-message"
          className="confirmation-modal-message"
        >
          {message}
        </div>

        {/* Actions */}
        <div className="confirmation-modal-actions">
          <button
            ref={cancelButtonRef}
            className="btn btn-secondary btn-base"
            onClick={onCancel}
            disabled={isProcessing}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="btn btn-base"
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              backgroundColor: config.confirmBgColor,
              color: 'white',
              border: 'none',
            }}
            type="button"
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
