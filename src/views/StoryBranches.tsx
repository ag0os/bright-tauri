/**
 * StoryBranches View
 *
 * Git branch management UI for story variations.
 * Allows users to create, view, and switch between different story branches.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, Check, Plus, WarningCircle, GitDiff, GitMerge } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, MergeResult } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryBranches.css';

interface BranchListItemProps {
  name: string;
  isCurrent: boolean;
  onSwitch: () => void;
  onMerge: () => void;
}

function BranchListItem({ name, isCurrent, onSwitch, onMerge }: BranchListItemProps) {
  return (
    <div className={`branch-item ${isCurrent ? 'current' : ''}`}>
      <div className="branch-info">
        <GitBranch size={18} />
        <span className="branch-name">{name}</span>
        {isCurrent && (
          <span className="current-badge">
            <Check size={14} />
            Current
          </span>
        )}
      </div>
      {!isCurrent && (
        <div className="branch-actions">
          <button className="btn btn-outline btn-sm" onClick={onSwitch}>
            Switch
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onMerge}
            title={`Merge ${name} into current branch`}
          >
            <GitMerge size={16} />
            Merge
          </button>
        </div>
      )}
    </div>
  );
}

export function StoryBranches() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);
  const getStory = useStoriesStore((state) => state.getStory);
  const showError = useToastStore((state) => state.error);
  const showSuccess = useToastStore((state) => state.success);

  const [story, setStory] = useState<Story | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-branches' ? currentRoute.storyId : null;

  // Load story and branches on mount
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);

        // Only fetch branches if story has a Git repo
        if (loadedStory.gitRepoPath) {
          await loadBranches(loadedStory.gitRepoPath);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId, getStory]);

  const loadBranches = async (repoPath: string) => {
    try {
      const [branchList, current] = await Promise.all([
        invoke<string[]>('git_list_branches', { repoPath }),
        invoke<string>('git_get_current_branch', { repoPath }),
      ]);

      setBranches(branchList);
      setCurrentBranch(current);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load branches';
      showError(message);
    }
  };

  const handleCreateBranch = async () => {
    if (!story?.gitRepoPath || !newBranchName.trim()) return;

    // Validate branch name (no spaces, lowercase)
    const trimmedName = newBranchName.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmedName !== newBranchName.trim()) {
      showError('Branch name must be lowercase with no spaces');
      return;
    }

    setIsCreating(true);
    try {
      await invoke('git_create_branch', {
        repoPath: story.gitRepoPath,
        parentBranch: currentBranch,
        newBranch: trimmedName,
      });

      showSuccess(`Created branch: ${trimmedName}`);
      setNewBranchName('');
      setShowCreateForm(false);

      // Reload branches
      await loadBranches(story.gitRepoPath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create branch';
      showError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    if (!story?.gitRepoPath) return;

    setIsSwitching(true);
    try {
      await invoke('git_checkout_branch', {
        repoPath: story.gitRepoPath,
        branch: branchName,
      });

      showSuccess(`Switched to branch: ${branchName}`);
      setCurrentBranch(branchName);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to switch branch';

      // Check if error is due to uncommitted changes
      if (
        typeof message === 'string' &&
        message.includes('uncommitted changes')
      ) {
        showError(
          'Cannot switch branches: You have unsaved changes. Please save or discard them first.'
        );
      } else {
        showError(message);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCreateFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateBranch();
    } else if (e.key === 'Escape') {
      setShowCreateForm(false);
      setNewBranchName('');
    }
  };

  const handleMergeBranch = async (fromBranch: string) => {
    if (!story?.gitRepoPath || !storyId) return;

    // Confirm merge
    const confirmMessage = `Merge "${fromBranch}" into "${currentBranch}"?\n\nThis will combine changes from both branches.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSwitching(true);
    try {
      const result = await invoke<MergeResult>('git_merge_branches', {
        repoPath: story.gitRepoPath,
        fromBranch,
        intoBranch: currentBranch,
      });

      if (result.success) {
        showSuccess(result.message);
        // Reload branches to reflect changes
        await loadBranches(story.gitRepoPath);
      } else {
        // Conflicts detected - navigate to merge resolution view
        navigate({
          screen: 'story-merge',
          storyId,
          fromBranch,
          intoBranch: currentBranch,
          conflicts: result.conflicts,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to merge branches';
      showError(message);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-branches-loading">
        <p>Loading branches...</p>
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
        <p>Enable Git to create story variations and track changes.</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  const handleNavigateToCompare = () => {
    if (!storyId) return;
    navigate({ screen: 'story-diff', storyId });
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
          disabled={branches.length < 2}
          title={branches.length < 2 ? 'Need at least 2 branches to compare' : 'Compare branches'}
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
          New Branch
        </button>
      </div>

      {/* Content */}
      <div className="story-branches-content">
        {/* Story Info */}
        <div className="story-info">
          <h2>{story.title}</h2>
          <p className="story-subtitle">
            Manage different variations of your story using branches
          </p>
        </div>

        {/* Create Branch Form */}
        {showCreateForm && (
          <div className="create-branch-form">
            <h3>Create New Branch</h3>
            <div className="form-group">
              <label htmlFor="branch-name">Branch Name</label>
              <input
                id="branch-name"
                type="text"
                className="input-filled"
                placeholder="e.g., alternate-ending"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={handleCreateFormKeyDown}
                autoFocus
                disabled={isCreating}
              />
              <p className="form-hint">
                Use lowercase letters, numbers, and hyphens only
              </p>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary btn-base"
                onClick={handleCreateBranch}
                disabled={isCreating || !newBranchName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Branch'}
              </button>
              <button
                className="btn btn-outline btn-base"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewBranchName('');
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Branches List */}
        <div className="branches-section">
          <h3>Branches ({branches.length})</h3>
          <div className="branches-list">
            {branches.length === 0 ? (
              <p className="empty-message">No branches found</p>
            ) : (
              branches.map((branch) => (
                <BranchListItem
                  key={branch}
                  name={branch}
                  isCurrent={branch === currentBranch}
                  onSwitch={() => handleSwitchBranch(branch)}
                  onMerge={() => handleMergeBranch(branch)}
                />
              ))
            )}
          </div>
        </div>

        {/* Loading overlay when switching */}
        {isSwitching && (
          <div className="switching-overlay">
            <p>Switching branches...</p>
          </div>
        )}
      </div>
    </div>
  );
}
