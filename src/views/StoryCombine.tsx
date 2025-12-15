/**
 * StoryCombine View
 *
 * Conflict resolution UI for combining story variations.
 * Allows users to resolve conflicts by choosing between variation versions.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Warning, Check, X } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryCombine.css';

interface ConflictResolution {
  filePath: string;
  resolution: 'ours' | 'theirs' | null;
}

export function StoryCombine() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);
  const getStory = useStoriesStore((state) => state.getStory);
  const showError = useToastStore((state) => state.error);
  const showSuccess = useToastStore((state) => state.success);

  const [story, setStory] = useState<Story | null>(null);
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [isAborting, setIsAborting] = useState(false);

  // Extract data from route
  const storyId =
    currentRoute.screen === 'story-combine' ? currentRoute.storyId : null;
  const fromBranch =
    currentRoute.screen === 'story-combine' ? currentRoute.fromBranch : null;
  const intoBranch =
    currentRoute.screen === 'story-combine' ? currentRoute.intoBranch : null;
  const conflicts =
    currentRoute.screen === 'story-combine' ? currentRoute.conflicts : [];

  // Load story on mount
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);

        // Initialize resolutions
        setResolutions(
          conflicts.map((filePath) => ({
            filePath,
            resolution: null,
          }))
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      }
    };

    loadData();
  }, [storyId, getStory]);

  const handleResolutionChange = (filePath: string, resolution: 'ours' | 'theirs') => {
    setResolutions((prev) =>
      prev.map((r) =>
        r.filePath === filePath ? { ...r, resolution } : r
      )
    );
  };

  const handleResolveAndCommit = async () => {
    if (!story?.gitRepoPath || !fromBranch || !intoBranch) return;

    // Check all conflicts have resolutions
    const unresolved = resolutions.filter((r) => r.resolution === null);
    if (unresolved.length > 0) {
      showError(
        `Please resolve all conflicts (${unresolved.length} remaining)`
      );
      return;
    }

    setIsResolving(true);
    try {
      // Resolve each conflict
      for (const resolution of resolutions) {
        await invoke('git_resolve_conflict', {
          repoPath: story.gitRepoPath,
          filePath: resolution.filePath,
          takeTheirs: resolution.resolution === 'theirs',
        });
      }

      // Commit the combined version
      await invoke('git_commit_all', {
        repoPath: story.gitRepoPath,
        message: `Combine ${fromBranch} into ${intoBranch}`,
      });

      showSuccess(`Successfully combined ${fromBranch} into ${intoBranch}`);

      // Navigate back to branches view
      navigate({ screen: 'story-variations', storyId: story.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to resolve conflicts';
      showError(message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleAbortMerge = async () => {
    if (!story?.gitRepoPath) return;

    setIsAborting(true);
    try {
      await invoke('git_abort_merge', {
        repoPath: story.gitRepoPath,
      });

      showSuccess('Combine cancelled');

      // Navigate back to branches view
      navigate({ screen: 'story-variations', storyId: story.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to abort merge';
      showError(message);
    } finally {
      setIsAborting(false);
    }
  };

  if (!story || !fromBranch || !intoBranch) {
    return (
      <div className="story-combine-error">
        <p>Invalid combine state</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  const allResolved = resolutions.every((r) => r.resolution !== null);

  return (
    <div className="story-combine">
      {/* Header */}
      <div className="story-combine-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Variations"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="story-combine-title">Combine Variations</h1>
      </div>

      {/* Content */}
      <div className="story-combine-content">
        {/* Combine Info */}
        <div className="combine-info">
          <Warning size={24} weight="duotone" className="warning-icon" />
          <div>
            <h2>
              Combining <strong>{fromBranch}</strong> into <strong>{intoBranch}</strong>
            </h2>
            <p>
              {conflicts.length} {conflicts.length === 1 ? 'file has' : 'files have'} conflicts that need to be resolved.
            </p>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="conflicts-section">
          <h3>Conflicting Files</h3>
          <div className="conflicts-list">
            {resolutions.map((resolution) => (
              <div
                key={resolution.filePath}
                className={`conflict-item ${resolution.resolution ? 'resolved' : ''}`}
              >
                <div className="conflict-header">
                  <div className="file-info">
                    {resolution.resolution ? (
                      <Check size={18} className="resolved-icon" />
                    ) : (
                      <Warning size={18} weight="duotone" className="conflict-icon" />
                    )}
                    <span className="file-path">{resolution.filePath}</span>
                  </div>
                  {resolution.resolution && (
                    <span className="resolution-badge">
                      {resolution.resolution === 'ours'
                        ? `Keeping from ${intoBranch}`
                        : `Keeping from ${fromBranch}`}
                    </span>
                  )}
                </div>

                <div className="conflict-actions">
                  <button
                    className={`btn btn-sm ${
                      resolution.resolution === 'ours'
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() =>
                      handleResolutionChange(resolution.filePath, 'ours')
                    }
                    disabled={isResolving}
                  >
                    Keep from {intoBranch}
                  </button>
                  <button
                    className={`btn btn-sm ${
                      resolution.resolution === 'theirs'
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() =>
                      handleResolutionChange(resolution.filePath, 'theirs')
                    }
                    disabled={isResolving}
                  >
                    Keep from {fromBranch}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="combine-actions">
          <button
            className="btn btn-outline btn-base"
            onClick={handleAbortMerge}
            disabled={isResolving || isAborting}
          >
            <X size={18} />
            {isAborting ? 'Cancelling...' : 'Cancel'}
          </button>
          <button
            className="btn btn-primary btn-base"
            onClick={handleResolveAndCommit}
            disabled={!allResolved || isResolving || isAborting}
            title={
              !allResolved
                ? 'Resolve all conflicts first'
                : 'Save the combined version with resolved conflicts'
            }
          >
            <Check size={18} />
            {isResolving ? 'Saving...' : 'Save Combined Version'}
          </button>
        </div>
      </div>
    </div>
  );
}
