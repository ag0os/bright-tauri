/**
 * useAutoCommit Hook
 *
 * Automatically commits story changes to Git after a debounced delay.
 * Works alongside useAutoSave to provide automatic versioning.
 */

import { useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import debounce from 'lodash.debounce';

export interface UseAutoCommitOptions {
  /** The story ID */
  storyId: string;
  /** The Git repository path (null if no repo) */
  gitRepoPath: string | null;
  /** The file path within the repo (e.g., "content.md") */
  filePath: string;
  /** The content to commit */
  content: string;
  /** Debounce delay in milliseconds (default: 30000ms = 30s) */
  delay?: number;
  /** Whether auto-commit is enabled (default: true) */
  enabled?: boolean;
}

/**
 * useAutoCommit Hook
 *
 * Automatically commits story content to Git after a debounced delay.
 * Only commits if the story has a Git repository configured.
 *
 * @example
 * ```tsx
 * useAutoCommit({
 *   storyId: story.id,
 *   gitRepoPath: story.gitRepoPath,
 *   filePath: 'content.md',
 *   content: editorContent,
 *   delay: 30000,
 *   enabled: settings.autoCommitEnabled,
 * });
 * ```
 */
export function useAutoCommit({
  storyId,
  gitRepoPath,
  filePath,
  content,
  delay = 30000,
  enabled = true,
}: UseAutoCommitOptions): void {
  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Store the latest content to avoid stale closures
  const contentRef = useRef(content);
  contentRef.current = content;

  // Commit function
  const performCommit = useCallback(async () => {
    if (!enabled || !gitRepoPath) {
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const message = `Auto-save: ${timestamp}`;

      await invoke('git_commit_file', {
        repoPath: gitRepoPath,
        filePath,
        content: contentRef.current,
        message,
      });

      console.log(`[AutoCommit] Committed story ${storyId} at ${timestamp}`);
    } catch (error) {
      // Handle errors gracefully - log to console but don't interrupt user
      console.error('[AutoCommit] Failed to commit:', error);
    }
  }, [enabled, gitRepoPath, filePath, storyId]);

  // Create debounced commit function
  const debouncedCommit = useRef(
    debounce((callback: () => void) => {
      callback();
    }, delay)
  );

  // Update debounce delay if it changes
  useEffect(() => {
    debouncedCommit.current = debounce((callback: () => void) => {
      callback();
    }, delay);

    return () => {
      debouncedCommit.current.cancel();
    };
  }, [delay]);

  // Trigger auto-commit when content changes
  useEffect(() => {
    // Skip auto-commit on first render (initial content load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled || !gitRepoPath) {
      return;
    }

    // Cancel any pending commit and schedule a new one
    debouncedCommit.current.cancel();
    debouncedCommit.current(() => {
      performCommit();
    });

    // Cleanup: cancel pending commits on unmount
    return () => {
      debouncedCommit.current.cancel();
    };
  }, [content, enabled, gitRepoPath, performCommit]);
}
