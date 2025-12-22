/**
 * Create Container Modal
 *
 * Modal component for creating a new container (Novel, Series, Collection).
 */

import { useState, FormEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { useContainersStore } from '@/stores/useContainersStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';

interface CreateContainerModalProps {
  onClose: () => void;
  parentContainer?: {
    id: string;
    title: string;
  };
}

type ContainerType = 'novel' | 'series' | 'collection';

const containerTypeOptions: { value: ContainerType; label: string }[] = [
  { value: 'novel', label: 'Novel' },
  { value: 'series', label: 'Series' },
  { value: 'collection', label: 'Collection' },
];

export function CreateContainerModal({ onClose, parentContainer }: CreateContainerModalProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);
  const { createContainer } = useContainersStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    containerType: 'novel' as ContainerType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUniverse) {
      setErrors({ general: 'No universe selected' });
      return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      const container = await createContainer({
        universeId: currentUniverse.id,
        parentContainerId: parentContainer?.id || null,
        containerType: formData.containerType,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        order: null, // Backend will auto-assign order
      });

      // Navigate to container view
      navigate({ screen: 'container-view', containerId: container.id });
      onClose();
    } catch (error) {
      console.error('Failed to create container:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create container',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="option-1 typo-1 icons-1 button-2 input-5"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-6)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--typography-heading-font)',
                fontSize: 'var(--typography-h3-size)',
                fontWeight: 'var(--typography-h3-weight)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Create New Container
            </h2>
            {parentContainer && (
              <p
                style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                Adding to: {parentContainer.title}
              </p>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close modal"
            style={{ padding: 'var(--spacing-1)' }}
          >
            <X className="icon icon-base" weight="duotone" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: 'var(--spacing-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-5)',
            }}
          >
            {/* General Error */}
            {errors.general && (
              <div
                style={{
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-error-subtle)',
                  color: 'var(--color-error)',
                  borderRadius: '4px',
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {errors.general}
              </div>
            )}

            {/* Container Type */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="container-type">
                Container Type
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <select
                  id="container-type"
                  className="input-field input-base"
                  value={formData.containerType}
                  onChange={(e) =>
                    setFormData({ ...formData, containerType: e.target.value as ContainerType })
                  }
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    fontFamily: 'var(--typography-body-font)',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {containerTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className={`input-group input-5 ${errors.title ? 'has-error' : ''}`}>
              <label className="input-label" htmlFor="container-title">
                Title
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="container-title"
                  type="text"
                  className="input-field input-base"
                  placeholder="Enter container title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              {errors.title && <div className="input-helper">{errors.title}</div>}
            </div>

            {/* Description */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="container-description">
                Description
              </label>
              <div className="input-wrapper">
                <textarea
                  id="container-description"
                  className="input-field input-base"
                  placeholder="Brief description of this container"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
              <div className="input-helper">Optional description</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-6)',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-base"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Container'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
