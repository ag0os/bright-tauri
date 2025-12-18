/**
 * Story Settings View
 *
 * Full-page view for editing story metadata after creation.
 * Allows users to update title, description, story type, and target word count.
 */

import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, StoryType } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StorySettings.css';

export function StorySettings() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const navigate = useNavigationStore((state) => state.navigate);
  const getStory = useStoriesStore((state) => state.getStory);
  const updateStory = useStoriesStore((state) => state.updateStory);
  const showSuccess = useToastStore((state) => state.success);
  const showError = useToastStore((state) => state.error);

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storyType: 'novel' as StoryType,
    targetWordCount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-settings' ? currentRoute.storyId : null;

  // Load story on mount
  useEffect(() => {
    if (!storyId) return;

    const loadStoryData = async () => {
      setIsLoading(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);
        setFormData({
          title: loadedStory.title,
          description: loadedStory.description,
          storyType: loadedStory.storyType,
          targetWordCount: loadedStory.targetWordCount?.toString() || '',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoryData();
  }, [storyId, getStory, showError]);

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
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!storyId) {
      showError('Story ID not found');
      return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      await updateStory(storyId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        storyType: formData.storyType,
        targetWordCount: formData.targetWordCount ? parseInt(formData.targetWordCount, 10) : null,
      });

      showSuccess('Story settings updated');
      handleBack();
    } catch (error) {
      console.error('Failed to update story settings:', error);
      showError(error instanceof Error ? error.message : 'Failed to update story settings');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-settings">
        <div className="story-settings__loading">Loading story settings...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-settings">
        <div className="story-settings__error">Story not found</div>
      </div>
    );
  }

  return (
    <div className="story-settings option-1 typo-1 icons-1 button-2 input-5">
      {/* Header */}
      <div className="story-settings__header">
        <button
          className="story-settings__back-button"
          onClick={handleBack}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={20} weight="duotone" />
        </button>

        <div className="story-settings__header-content">
          <h1 className="story-settings__title">Story Settings</h1>
          <p className="story-settings__subtitle">Edit story metadata</p>
        </div>
      </div>

      {/* Form */}
      <div className="story-settings__content">
        <form onSubmit={handleSubmit}>
          <div className="story-settings__form-fields">
            {/* General Error */}
            {errors.general && (
              <div className="story-settings__error-banner">
                {errors.general}
              </div>
            )}

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
                  disabled={isSubmitting}
                >
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  min="0"
                />
              </div>
              <div className="input-helper">Optional goal for story length</div>
            </div>
          </div>

          {/* Footer */}
          <div className="story-settings__footer">
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
