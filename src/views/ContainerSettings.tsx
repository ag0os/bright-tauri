/**
 * Container Settings View
 *
 * Full-page view for editing container metadata.
 * Allows users to update title, description, and container type.
 */

import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useContainersStore } from '@/stores/useContainersStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Container } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './SettingsPage.css';

const CONTAINER_TYPES = [
  { value: 'novel', label: 'Novel' },
  { value: 'series', label: 'Series' },
  { value: 'collection', label: 'Collection' },
];

export function ContainerSettings() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const navigate = useNavigationStore((state) => state.navigate);
  const getContainer = useContainersStore((state) => state.getContainer);
  const updateContainer = useContainersStore((state) => state.updateContainer);
  const showSuccess = useToastStore((state) => state.success);
  const showError = useToastStore((state) => state.error);

  const [container, setContainer] = useState<Container | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    containerType: 'novel',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract container ID from route
  const containerId =
    currentRoute.screen === 'container-settings' ? currentRoute.containerId : null;

  // Load container on mount
  useEffect(() => {
    if (!containerId) return;

    const loadContainerData = async () => {
      setIsLoading(true);
      try {
        const loadedContainer = await getContainer(containerId);
        setContainer(loadedContainer);
        setFormData({
          title: loadedContainer.title,
          description: loadedContainer.description || '',
          containerType: loadedContainer.containerType,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load container';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadContainerData();
  }, [containerId, getContainer, showError]);

  const handleBack = () => {
    if (canGoBack()) {
      goBack();
    } else {
      // Fallback to stories list if no history
      navigate({ screen: 'stories-list' });
    }
  };

  const handleCancel = () => {
    handleBack();
  };

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

    if (!containerId) {
      showError('Container ID not found');
      return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      await updateContainer(containerId, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        containerType: formData.containerType,
        order: null, // Don't change order
      });

      showSuccess('Container settings updated');
      handleBack();
    } catch (error) {
      console.error('Failed to update container settings:', error);
      showError(error instanceof Error ? error.message : 'Failed to update container settings');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-page__loading">Loading container settings...</div>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="settings-page">
        <div className="settings-page__error">Container not found</div>
      </div>
    );
  }

  return (
    <div className="settings-page option-1 typo-1 icons-1 button-2 input-5">
      {/* Header */}
      <div className="settings-page__header">
        <button
          className="settings-page__back-button"
          onClick={handleBack}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={20} weight="duotone" />
        </button>

        <div className="settings-page__header-content">
          <h1 className="settings-page__title">Container Settings</h1>
          <p className="settings-page__subtitle">Edit container metadata</p>
        </div>
      </div>

      {/* Form */}
      <div className="settings-page__content">
        <form onSubmit={handleSubmit}>
          <div className="settings-page__form-fields">
            {/* General Error */}
            {errors.general && (
              <div className="settings-page__error-banner">
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
                    setFormData({ ...formData, containerType: e.target.value })
                  }
                  disabled={isSubmitting}
                >
                  {CONTAINER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  style={{
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
              <div className="input-helper">Optional description for organization</div>
            </div>
          </div>

          {/* Footer */}
          <div className="settings-page__footer">
            <button
              type="button"
              className="btn btn-ghost btn-base"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
