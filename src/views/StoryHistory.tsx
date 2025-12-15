/**
 * StoryHistory View
 *
 * Displays Git commit history for a story in a visual timeline.
 * Allows users to browse past versions and restore to any commit.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, ArrowCounterClockwise } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useToastStore } from '@/stores/useToastStore';
import type { CommitInfo, Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryHistory.css';

const COMMITS_PER_PAGE = 20;

interface ConfirmRestoreDialogProps {
  commit: CommitInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmRestoreDialog({ commit, onConfirm, onCancel }: ConfirmRestoreDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Restore to Previous Version?</h2>

        <div className="modal-body">
          <p className="modal-warning">
            This will restore your story to an older version. Any uncommitted changes will be lost.
          </p>

          <div className="commit-preview">
            <div className="commit-preview-label">Restoring to:</div>
            <div className="commit-preview-hash">{commit.hash.substring(0, 7)}</div>
            <div className="commit-preview-message">{commit.message}</div>
            <div className="commit-preview-meta">
              by {commit.author} on {formatTimestamp(commit.timestamp)}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline btn-base" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary btn-base" onClick={onConfirm}>
            <ArrowCounterClockwise size={16} weight="duotone" />
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

  return formatTimestamp(timestamp);
}

export function StoryHistory() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const showSuccess = useToastStore((state) => state.success);
  const showError = useToastStore((state) => state.error);

  const [story, setStory] = useState<Story | null>(null);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(COMMITS_PER_PAGE);
  const [confirmRestore, setConfirmRestore] = useState<CommitInfo | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-history' ? currentRoute.storyId : null;

  // Load story and history on mount
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Ensure git repo exists (handles stories created before git integration)
        const loadedStory = await invoke<Story>('ensure_story_git_repo', {
          id: storyId,
        });
        setStory(loadedStory);

        // Load commit history
        const history = await invoke<CommitInfo[]>('git_get_history', {
          repoPath: loadedStory.gitRepoPath,
          branch: loadedStory.currentBranch,
        });

        setCommits(history);
      } catch (err) {
        // Tauri invoke errors are strings, not Error objects
        const message = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Failed to load history';
        console.error('Failed to load history:', err);
        setError(message);
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate a small delay for smooth UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + COMMITS_PER_PAGE);
      setIsLoadingMore(false);
    }, 200);
  };

  const handleRestoreClick = (commit: CommitInfo) => {
    setConfirmRestore(commit);
  };

  const handleRestoreConfirm = async () => {
    if (!confirmRestore || !story) return;

    setIsRestoring(true);
    try {
      await invoke('git_restore_commit', {
        repoPath: story.gitRepoPath,
        commitHash: confirmRestore.hash,
      });

      showSuccess(`Restored to version ${confirmRestore.hash.substring(0, 7)}`);

      // Reload history after restore
      const history = await invoke<CommitInfo[]>('git_get_history', {
        repoPath: story.gitRepoPath,
        branch: story.currentBranch,
      });
      setCommits(history);
      setConfirmRestore(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore commit';
      showError(message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreCancel = () => {
    setConfirmRestore(null);
  };

  const visibleCommits = commits.slice(0, displayCount);
  const hasMoreCommits = displayCount < commits.length;

  if (isLoading) {
    return (
      <div className="story-history-loading">
        <Clock size={48} />
        <p>Loading history...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="story-history-error">
        <p>{error || 'Story not found'}</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-history">
      {/* Header */}
      <div className="story-history-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Editor"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="header-content">
          <h1 className="page-title">Version History</h1>
          <p className="story-name">{story.title}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        {commits.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>No history yet</p>
            <p className="empty-state-hint">
              Changes to your story will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="timeline">
              {visibleCommits.map((commit, index) => (
                <div key={commit.hash} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot" />
                    {index < visibleCommits.length - 1 && (
                      <div className="timeline-line" />
                    )}
                  </div>

                  <div className="commit-card">
                    <div className="commit-header">
                      <div className="commit-hash">
                        {commit.hash.substring(0, 7)}
                      </div>
                      <button
                        className="btn btn-outline btn-sm restore-button"
                        onClick={() => handleRestoreClick(commit)}
                        disabled={isRestoring || index === 0}
                        title={index === 0 ? 'Current version' : 'Restore to this version'}
                      >
                        <ArrowCounterClockwise size={14} weight="duotone" />
                        {index === 0 ? 'Current' : 'Restore'}
                      </button>
                    </div>

                    <div className="commit-message">{commit.message}</div>

                    <div className="commit-meta">
                      <span className="commit-author">{commit.author}</span>
                      <span className="commit-separator">•</span>
                      <span className="commit-time" title={formatTimestamp(commit.timestamp)}>
                        {formatRelativeTime(commit.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreCommits && (
              <div className="load-more-container">
                <button
                  className="btn btn-outline btn-base"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : `Load More (${commits.length - displayCount} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restore Confirmation Dialog */}
      {confirmRestore && (
        <ConfirmRestoreDialog
          commit={confirmRestore}
          onConfirm={handleRestoreConfirm}
          onCancel={handleRestoreCancel}
        />
      )}
    </div>
  );
}
