/**
 * StoryVariations View
 *
 * Story variation management UI with writer-friendly terminology.
 * Allows users to create, view, and switch between different story variations.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Check, Plus, WarningCircle, GitDiff, GitMerge, Star } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, MergeResult, VariationInfo } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryVariations.css';

interface VariationListItemProps {
  variation: VariationInfo;
  onSwitch: () => void;
  onCombine: () => void;
}

function VariationListItem({ variation, onSwitch, onCombine }: VariationListItemProps) {
  return (
    <div className={`branch-item ${variation.is_current ? 'current' : ''}`}>
      <div className="branch-info">
        <GitBranch size={18} />
        <span className="branch-name">{variation.display_name}</span>
        {variation.is_original && (
          <span className="original-badge">
            <Star size={14} weight="fill" />
            Original
          </span>
        )}
        {variation.is_current && (
          <span className="current-badge">
            <Check size={14} />
            Current Variation
          </span>
        )}
      </div>
      {!variation.is_current && (
        <div className="branch-actions">
          <button className="btn btn-outline btn-sm" onClick={onSwitch}>
            Switch to
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onCombine}
            title={`Combine ${variation.display_name} into current variation`}
          >
            <GitMerge size={16} />
            Combine
          </button>
        </div>
      )}
    </div>
  );
}

export function StoryVariations() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);
  const showError = useToastStore((state) => state.error);
  const showSuccess = useToastStore((state) => state.success);

  const [story, setStory] = useState<Story | null>(null);
  const [variations, setVariations] = useState<VariationInfo[]>([]);
  const [currentVariation, setCurrentVariation] = useState<VariationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newVariationName, setNewVariationName] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-variations' ? currentRoute.storyId : null;

  // Reserved variation names (case-insensitive)
  const RESERVED_NAMES = ['original', 'main', 'master', 'head'];

  /**
   * Validates variation name against reserved names
   * @param name - The variation name to validate
   * @returns Error message if invalid, null if valid
   */
  const validateVariationName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const normalizedName = trimmedName.toLowerCase();
    if (RESERVED_NAMES.includes(normalizedName)) {
      return `"${trimmedName}" is a reserved name. Please choose a different variation name.`;
    }

    return null;
  };

  // Load story and variations on mount
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Ensure git repo exists (handles stories created before git integration)
        const loadedStory = await invoke<Story>('ensure_story_git_repo', {
          id: storyId,
        });
        setStory(loadedStory);

        // Fetch variations
        await loadVariations(loadedStory.gitRepoPath);
      } catch (error) {
        const message = typeof error === 'string' ? error : error instanceof Error ? error.message : 'Failed to load story';
        console.error('Failed to load variations:', error);
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId]);

  const loadVariations = async (repoPath: string) => {
    try {
      const [variationList, current] = await Promise.all([
        invoke<VariationInfo[]>('git_list_branches', { repoPath }),
        invoke<VariationInfo>('git_get_current_branch', { repoPath }),
      ]);

      setVariations(variationList);
      setCurrentVariation(current);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load variations';
      showError(message);
    }
  };

  const handleCreateVariation = async () => {
    if (!story?.gitRepoPath || !newVariationName.trim() || !currentVariation) return;

    // Validate variation name
    const validationErrorMessage = validateVariationName(newVariationName);
    if (validationErrorMessage) {
      showError(validationErrorMessage);
      return;
    }

    setIsCreating(true);
    try {
      await invoke('git_create_branch', {
        repoPath: story.gitRepoPath,
        parentBranch: currentVariation.slug,
        displayName: newVariationName.trim(),
      });

      showSuccess(`Created variation: ${newVariationName.trim()}`);
      setNewVariationName('');
      setValidationError(null);
      setShowCreateForm(false);

      // Reload variations
      await loadVariations(story.gitRepoPath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create variation';
      showError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchVariation = async (variation: VariationInfo) => {
    if (!story?.gitRepoPath) return;

    setIsSwitching(true);
    try {
      await invoke('git_checkout_branch', {
        repoPath: story.gitRepoPath,
        branch: variation.slug,
      });

      showSuccess(`Switched to variation: ${variation.display_name}`);
      setCurrentVariation(variation);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to switch variation';

      // Check if error is due to uncommitted changes
      if (
        typeof message === 'string' &&
        message.includes('uncommitted changes')
      ) {
        showError(
          'Cannot switch variations: You have unsaved changes. Please save or discard them first.'
        );
      } else {
        showError(message);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const handleVariationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewVariationName(value);

    // Real-time validation
    const error = validateVariationName(value);
    setValidationError(error);
  };

  const handleCreateFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateVariation();
    } else if (e.key === 'Escape') {
      setShowCreateForm(false);
      setNewVariationName('');
      setValidationError(null);
    }
  };

  const handleCombineVariation = async (fromVariation: VariationInfo) => {
    if (!story?.gitRepoPath || !storyId || !currentVariation) return;

    // Confirm combine
    const confirmMessage = `Combine "${fromVariation.display_name}" into "${currentVariation.display_name}"?\n\nThis will merge changes from both variations.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSwitching(true);
    try {
      const result = await invoke<MergeResult>('git_merge_branches', {
        repoPath: story.gitRepoPath,
        fromBranch: fromVariation.slug,
        intoBranch: currentVariation.slug,
      });

      if (result.success) {
        showSuccess(result.message);
        // Reload variations to reflect changes
        await loadVariations(story.gitRepoPath);
      } else {
        // Conflicts detected - navigate to merge resolution view
        navigate({
          screen: 'story-combine',
          storyId,
          fromBranch: fromVariation.slug,
          intoBranch: currentVariation.slug,
          conflicts: result.conflicts,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to combine variations';
      showError(message);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-branches-loading">
        <p>Loading variations...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-branches-error">
        <p>Story not found</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  if (!story.gitRepoPath) {
    return (
      <div className="story-branches-error">
        <WarningCircle size={48} weight="duotone" />
        <h2>No Version Control</h2>
        <p>This story does not have version control enabled.</p>
        <p>Enable version control to create story variations and track changes.</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  const handleNavigateToCompare = () => {
    if (!storyId) return;
    navigate({ screen: 'story-compare', storyId });
  };

  return (
    <div className="story-branches">
      {/* Header */}
      <div className="story-branches-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Story"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="story-branches-title">Story Variations</h1>

        <button
          className="btn btn-outline btn-base"
          onClick={handleNavigateToCompare}
          disabled={variations.length < 2}
          title={variations.length < 2 ? 'Need at least 2 variations to compare' : 'Compare variations'}
        >
          <GitDiff size={18} weight="duotone" />
          Compare
        </button>

        <button
          className="btn btn-primary btn-base"
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm || isCreating}
        >
          <Plus size={18} />
          New Variation
        </button>
      </div>

      {/* Content */}
      <div className="story-branches-content">
        {/* Story Info */}
        <div className="story-info">
          <h2>{story.title}</h2>
          <p className="story-subtitle">
            Explore different versions of your story
          </p>
        </div>

        {/* Create Variation Form */}
        {showCreateForm && (
          <div className="create-branch-form">
            <h3>Create New Variation</h3>
            <div className="form-group">
              <label htmlFor="variation-name">Variation Name</label>
              <input
                id="variation-name"
                type="text"
                className="input-filled"
                placeholder="e.g., What if Sarah lived?"
                value={newVariationName}
                onChange={handleVariationNameChange}
                onKeyDown={handleCreateFormKeyDown}
                autoFocus
                disabled={isCreating}
                aria-invalid={validationError !== null}
                aria-describedby={validationError ? 'variation-name-error' : 'variation-name-hint'}
              />
              {validationError ? (
                <p id="variation-name-error" className="form-error" role="alert">
                  {validationError}
                </p>
              ) : (
                <p id="variation-name-hint" className="form-hint">
                  Use a descriptive name that explains this story variation
                </p>
              )}
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary btn-base"
                onClick={handleCreateVariation}
                disabled={isCreating || !newVariationName.trim() || validationError !== null}
              >
                {isCreating ? 'Creating...' : 'Create Variation'}
              </button>
              <button
                className="btn btn-outline btn-base"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewVariationName('');
                  setValidationError(null);
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Variations List */}
        <div className="branches-section">
          <h3>Variations ({variations.length})</h3>
          <div className="branches-list">
            {variations.length === 0 ? (
              <p className="empty-message">No variations found</p>
            ) : (
              variations.map((variation) => (
                <VariationListItem
                  key={variation.slug}
                  variation={variation}
                  onSwitch={() => handleSwitchVariation(variation)}
                  onCombine={() => handleCombineVariation(variation)}
                />
              ))
            )}
          </div>
        </div>

        {/* Loading overlay when switching */}
        {isSwitching && (
          <div className="switching-overlay">
            <p>Switching variations...</p>
          </div>
        )}
      </div>
    </div>
  );
}
