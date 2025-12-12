/**
 * StoryDiff View
 *
 * Visual diff viewer for comparing two Git branches.
 * Shows file-level changes between story variations.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, GitDiff, FileText, WarningCircle } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story } from '@/types';
import type { DiffResult, FileChange, ChangeStatus } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryDiff.css';

interface FileChangeItemProps {
  fileChange: FileChange;
}

function FileChangeItem({ fileChange }: FileChangeItemProps) {
  const statusColors: Record<ChangeStatus, string> = {
    Added: 'status-added',
    Modified: 'status-modified',
    Deleted: 'status-deleted',
  };

  const statusLabels: Record<ChangeStatus, string> = {
    Added: 'Added',
    Modified: 'Modified',
    Deleted: 'Deleted',
  };

  return (
    <div className="file-change-item">
      <div className="file-info">
        <FileText size={18} />
        <span className="file-path">{fileChange.path}</span>
      </div>
      <span className={`status-badge ${statusColors[fileChange.status]}`}>
        {statusLabels[fileChange.status]}
      </span>
    </div>
  );
}

export function StoryDiff() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const getStory = useStoriesStore((state) => state.getStory);
  const showError = useToastStore((state) => state.error);

  const [story, setStory] = useState<Story | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [branchA, setBranchA] = useState<string>('');
  const [branchB, setBranchB] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  // Extract story ID and optional branch selections from route
  const storyId =
    currentRoute.screen === 'story-diff' ? currentRoute.storyId : null;
  const initialBranchA =
    currentRoute.screen === 'story-diff' ? currentRoute.branchA : undefined;
  const initialBranchB =
    currentRoute.screen === 'story-diff' ? currentRoute.branchB : undefined;

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
          const [branchList, currentBranch] = await Promise.all([
            invoke<string[]>('git_list_branches', {
              repoPath: loadedStory.gitRepoPath,
            }),
            invoke<string>('git_get_current_branch', {
              repoPath: loadedStory.gitRepoPath,
            }),
          ]);

          setBranches(branchList);

          // Set initial branch selections
          if (initialBranchA && branchList.includes(initialBranchA)) {
            setBranchA(initialBranchA);
          } else {
            setBranchA(currentBranch);
          }

          if (initialBranchB && branchList.includes(initialBranchB)) {
            setBranchB(initialBranchB);
          } else if (branchList.length > 1) {
            // Select first non-current branch
            const otherBranch = branchList.find((b) => b !== currentBranch);
            setBranchB(otherBranch || currentBranch);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId, getStory, initialBranchA, initialBranchB]);

  const handleCompare = async () => {
    if (!story?.gitRepoPath || !branchA || !branchB) return;

    if (branchA === branchB) {
      showError('Cannot compare a branch with itself');
      return;
    }

    setIsComparing(true);
    setDiffResult(null);

    try {
      const result = await invoke<DiffResult>('git_diff_branches', {
        repoPath: story.gitRepoPath,
        branchA,
        branchB,
      });

      setDiffResult(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to compare branches';
      showError(message);
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-diff-loading">
        <p>Loading branches...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-diff-error">
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
      <div className="story-diff-error">
        <WarningCircle size={48} weight="duotone" />
        <h2>No Version Control</h2>
        <p>This story does not have version control enabled.</p>
        <p>Enable Git to compare story variations.</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-diff">
      {/* Header */}
      <div className="story-diff-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Story"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="story-diff-title">Compare Versions</h1>
      </div>

      {/* Content */}
      <div className="story-diff-content">
        {/* Story Info */}
        <div className="story-info">
          <h2>{story.title}</h2>
          <p className="story-subtitle">
            Compare different variations of your story
          </p>
        </div>

        {/* Branch Selector */}
        <div className="branch-selector">
          <div className="selector-group">
            <label htmlFor="branch-a">Compare</label>
            <div className="select-wrapper">
              <select
                id="branch-a"
                value={branchA}
                onChange={(e) => setBranchA(e.target.value)}
                disabled={isComparing}
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="selector-divider">
            <GitDiff size={20} weight="duotone" />
          </div>

          <div className="selector-group">
            <label htmlFor="branch-b">with</label>
            <div className="select-wrapper">
              <select
                id="branch-b"
                value={branchB}
                onChange={(e) => setBranchB(e.target.value)}
                disabled={isComparing}
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary btn-base"
            onClick={handleCompare}
            disabled={isComparing || !branchA || !branchB || branchA === branchB}
          >
            {isComparing ? 'Comparing...' : 'Compare'}
          </button>
        </div>

        {/* Diff Results */}
        {diffResult && (
          <div className="diff-results">
            <h3>
              {diffResult.changes.length}{' '}
              {diffResult.changes.length === 1 ? 'file' : 'files'} changed
            </h3>

            {diffResult.changes.length === 0 ? (
              <div className="empty-diff">
                <p>No differences found between these branches</p>
              </div>
            ) : (
              <>
                <div className="file-changes-list">
                  {diffResult.changes.map((change, index) => (
                    <FileChangeItem key={index} fileChange={change} />
                  ))}
                </div>

                <div className="diff-note">
                  <p>
                    Note: Line-level diff view is not yet available. Compare
                    files by switching between branches in the editor.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!diffResult && !isComparing && (
          <div className="empty-state">
            <GitDiff size={64} weight="duotone" />
            <p>Select two branches and click Compare to see the differences</p>
          </div>
        )}
      </div>
    </div>
  );
}
