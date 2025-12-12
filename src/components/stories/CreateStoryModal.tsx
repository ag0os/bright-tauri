/**
 * Create Story Modal
 *
 * Modal component for creating a new story with form validation and error handling.
 */

import { useState, FormEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
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
  parentStory?: {
    id: string;
    title: string;
    storyType: StoryType;
  };
}

// Determine the default child story type based on parent type
const getDefaultChildType = (parentType: StoryType): StoryType => {
  switch (parentType) {
    case 'screenplay':
      return 'scene';
    case 'novel':
    case 'series':
    case 'collection':
    default:
      return 'chapter';
  }
};

// Get child type options based on parent type
const getChildTypeOptions = (parentType: StoryType): { value: StoryType; label: string }[] => {
  switch (parentType) {
    case 'screenplay':
      return [
        { value: 'scene', label: 'Scene' },
        { value: 'chapter', label: 'Chapter' },
      ];
    default:
      return [
        { value: 'chapter', label: 'Chapter' },
        { value: 'scene', label: 'Scene' },
      ];
  }
};

export function CreateStoryModal({ onClose, parentStory }: CreateStoryModalProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);
  const { createStory, invalidateChildren } = useStoriesStore();

  const isCreatingChild = !!parentStory;
  const defaultChildType = parentStory ? getDefaultChildType(parentStory.storyType) : 'novel';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storyType: isCreatingChild ? defaultChildType : ('novel' as StoryType),
    targetWordCount: '',
    tags: '',
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
      const story = await createStory({
        universeId: currentUniverse.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        storyType: formData.storyType,
        content: null,
        notes: null,
        outline: null,
        targetWordCount: formData.targetWordCount ? parseInt(formData.targetWordCount, 10) : null,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null,
        color: null,
        seriesName: null,
        parentStoryId: parentStory?.id || null,
        variationType: null,
        parentVariationId: null,
      });

      // Invalidate parent's children cache if creating a child
      if (parentStory) {
        invalidateChildren(parentStory.id);
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
              {isCreatingChild ? 'Add Chapter' : 'Create New Story'}
            </h2>
            {isCreatingChild && parentStory && (
              <p
                style={{
                  fontFamily: 'var(--typography-body-font)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: '4px 0 0 0',
                }}
              >
                Adding to: {parentStory.title}
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

            {/* Story Type */}
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-type">
                {isCreatingChild ? 'Chapter Type' : 'Story Type'}
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
                  {isCreatingChild && parentStory ? (
                    getChildTypeOptions(parentStory.storyType).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="novel">Novel</option>
                      <option value="series">Series</option>
                      <option value="screenplay">Screenplay</option>
                      <option value="short-story">Short Story</option>
                      <option value="poem">Poem</option>
                      <option value="chapter">Chapter</option>
                      <option value="scene">Scene</option>
                      <option value="episode">Episode</option>
                      <option value="outline">Outline</option>
                      <option value="treatment">Treatment</option>
                      <option value="collection">Collection</option>
                    </>
                  )}
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
            <div className="input-group input-5">
              <label className="input-label" htmlFor="story-description">
                Description
              </label>
              <div className="input-wrapper">
                <textarea
                  id="story-description"
                  className="input-field input-base"
                  placeholder="Brief description of your story"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    resize: 'vertical',
                    minHeight: '80px',
                  }}
                />
              </div>
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
              {isSubmitting ? 'Creating...' : isCreatingChild ? 'Add Chapter' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
