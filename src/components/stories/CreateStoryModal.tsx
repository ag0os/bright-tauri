/**
 * Create Story Modal
 *
 * Modal component for creating a new story with form validation and error handling.
 */

import { useState, FormEvent, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import { useContainersStore } from '@/stores/useContainersStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { StoryType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';

interface CreateStoryModalProps {
  onClose: () => void;
  containerId?: string; // If provided, story will be created in this container
}

// Content-only story types (no container types like 'novel', 'series')
const storyTypeOptions: { value: StoryType; label: string }[] = [
  { value: 'chapter', label: 'Chapter' },
  { value: 'scene', label: 'Scene' },
  { value: 'short-story', label: 'Short Story' },
  { value: 'episode', label: 'Episode' },
  { value: 'poem', label: 'Poem' },
  { value: 'outline', label: 'Outline' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'screenplay', label: 'Screenplay' },
];

export function CreateStoryModal({ onClose, containerId }: CreateStoryModalProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);
  const { createStory } = useStoriesStore();
  const { containers } = useContainersStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storyType: 'chapter' as StoryType,
    containerId: containerId || '', // Empty string means standalone
    targetWordCount: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load containers on mount if universe is selected
  useEffect(() => {
    if (currentUniverse && containers.length === 0) {
      useContainersStore.getState().loadContainers(currentUniverse.id);
    }
  }, [currentUniverse, containers.length]);

  // Show all containers - backend will validate when creating story
  // A container can hold stories if it doesn't have child containers
  // Backend has leaf protection to prevent adding stories to containers with children
  const availableContainers = containers;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      const story = await createStory({
        universeId: currentUniverse.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        storyType: formData.storyType,
        // Note: content is managed via DBV (versions/snapshots), not CreateStoryInput
        notes: null,
        outline: null,
        targetWordCount: formData.targetWordCount ? parseInt(formData.targetWordCount, 10) : null,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null,
        color: null,
        seriesName: null,
        containerId: formData.containerId || null, // null = standalone story
        variationType: null,
        parentVariationId: null,
      });

      // Invalidate container children cache if story was added to container
      if (formData.containerId) {
        useContainersStore.getState().invalidateChildren(formData.containerId);
      }

      // Navigate to story editor
      navigate({ screen: 'story-editor', storyId: story.id });
      onClose();
    } catch (error) {
      console.error('Failed to create story:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create story',
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
              Create New Story
            </h2>
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

            {/* Container Selection (optional) */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-container">
                Container
              </label>
              <div className="input-wrapper">
                <select
                  id="story-container"
                  className="input-field input-base"
                  value={formData.containerId}
                  onChange={(e) =>
                    setFormData({ ...formData, containerId: e.target.value })
                  }
                  disabled={!!containerId} // Disable if container was pre-selected
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
                  <option value="">Standalone (no container)</option>
                  {availableContainers.map((container) => (
                    <option key={container.id} value={container.id}>
                      {container.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-helper">Optional: Add story to a container</div>
            </div>

            {/* Story Type */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-type">
                Story Type
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <select
                  id="story-type"
                  className="input-field input-base"
                  value={formData.storyType}
                  onChange={(e) =>
                    setFormData({ ...formData, storyType: e.target.value as StoryType })
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
                  {storyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className={`input-group input-5 ${errors.title ? 'has-error' : ''}`}>
              <label className="input-label" htmlFor="story-title">
                Title
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="story-title"
                  type="text"
                  className="input-field input-base"
                  placeholder="Enter story title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              {errors.title && <div className="input-helper">{errors.title}</div>}
            </div>

            {/* Description */}
            <div className={`input-group input-5 ${errors.description ? 'has-error' : ''}`}>
              <label className="input-label" htmlFor="story-description">
                Description
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <textarea
                  id="story-description"
                  className="input-field input-base"
                  placeholder="Brief description of your story"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  style={{
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
              {errors.description && <div className="input-helper">{errors.description}</div>}
            </div>

            {/* Target Word Count */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-word-count">
                Target Word Count
              </label>
              <div className="input-wrapper">
                <input
                  id="story-word-count"
                  type="number"
                  className="input-field input-base"
                  placeholder="e.g., 80000"
                  value={formData.targetWordCount}
                  onChange={(e) => setFormData({ ...formData, targetWordCount: e.target.value })}
                  min="0"
                />
              </div>
              <div className="input-helper">Optional goal for story length</div>
            </div>

            {/* Tags */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-tags">
                Tags
              </label>
              <div className="input-wrapper">
                <input
                  id="story-tags"
                  type="text"
                  className="input-field input-base"
                  placeholder="fantasy, adventure, epic"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="input-helper">Comma-separated tags</div>
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
              {isSubmitting ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
