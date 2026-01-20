/**
 * StoryHistory View
 *
 * Displays database snapshots for a story's active version.
 * Part of the Database-Only Versioning (DBV) system.
 *
 * Features:
 * - Lists all snapshots for the active version (newest first)
 * - Shows creation timestamp for each snapshot
 * - Allows restoring to any previous snapshot
 * - No manual delete (retention policy handles cleanup)
 */

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Clock, ArrowCounterClockwise, SpinnerGap } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, StorySnapshot } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryHistory.css';

/**
 * Format a timestamp to an absolute date/time format.
 * Example: "Jan 20, 2026 2:30 PM"
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function StoryHistory() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const getStory = useStoriesStore((state) => state.getStory);
  const showSuccess = useToastStore((state) => state.success);
  const showError = useToastStore((state) => state.error);

  const [story, setStory] = useState<Story | null>(null);
  const [snapshots, setSnapshots] = useState<StorySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-history' ? currentRoute.storyId : null;

  // Load story and snapshots
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load story first to get active_version_id
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);

        // If story has an active version, load its snapshots
        if (loadedStory.activeVersionId) {
          const loadedSnapshots = await invoke<StorySnapshot[]>('list_story_snapshots', {
            versionId: loadedStory.activeVersionId,
          });
          setSnapshots(loadedSnapshots);
        } else {
          setSnapshots([]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load snapshots';
        setError(message);
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId, getStory, showError]);

  // Handle restoring a snapshot
  const handleRestore = useCallback(
    async (snapshotId: string) => {
      if (!storyId || restoringId) return;

      setRestoringId(snapshotId);

      try {
        const updatedStory = await invoke<Story>('switch_story_snapshot', {
          storyId,
          snapshotId,
        });
        setStory(updatedStory);
        showSuccess('Snapshot restored successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to restore snapshot';
        showError(message);
      } finally {
        setRestoringId(null);
      }
    },
    [storyId, restoringId, showSuccess, showError]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="story-history-loading">
        <SpinnerGap size={48} weight="duotone" className="spinner" />
        <p>Loading snapshots...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="story-history-error">
        <p>{error}</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-history">
      <div className="story-history-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-content">
          <h1 className="page-title">Snapshots</h1>
          {story && <p className="story-name">{story.title}</p>}
        </div>
      </div>

      <div className="timeline-container">
        {snapshots.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h2>No Snapshots Yet</h2>
            <p className="empty-state-hint">
              Snapshots are created automatically as you write.
              <br />
              Keep writing and your progress will be saved here.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {snapshots.map((snapshot, index) => {
              const isCurrentSnapshot = story?.activeSnapshotId === snapshot.id;
              const isRestoring = restoringId === snapshot.id;
              const isLastItem = index === snapshots.length - 1;

              return (
                <div key={snapshot.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div
                      className={`timeline-dot ${isCurrentSnapshot ? 'active' : ''}`}
                    />
                    {!isLastItem && <div className="timeline-line" />}
                  </div>
                  <div className={`snapshot-card ${isCurrentSnapshot ? 'current' : ''}`}>
                    <div className="snapshot-header">
                      <span className="snapshot-time" title={snapshot.createdAt}>
                        {formatTimestamp(snapshot.createdAt)}
                      </span>
                      {isCurrentSnapshot ? (
                        <span className="current-badge">Current</span>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm restore-button"
                          onClick={() => handleRestore(snapshot.id)}
                          disabled={isRestoring || restoringId !== null}
                          aria-label="Restore this snapshot"
                          title="Restore this snapshot"
                        >
                          {isRestoring ? (
                            <SpinnerGap size={14} className="spinner" />
                          ) : (
                            <ArrowCounterClockwise size={14} />
                          )}
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
