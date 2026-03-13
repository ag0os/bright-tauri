/**
 * useAutoSnapshot Hook
 *
 * Custom React hook for creating automatic history restore points (snapshots)
 * based on character count threshold or component unmount (on-leave) trigger.
 *
 * Part of Database-Only Versioning (DBV) implementation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { createStorySnapshot } from '@/features/stories/api/snapshots';
import type { SnapshotTrigger } from '@/features/settings/stores/useSettingsStore';

export interface UseAutoSnapshotProps {
  /** The story ID to create snapshots for */
  storyId: string;
  /** The current content to snapshot */
  content: string;
  /** Current word count for the editor content */
  wordCount?: number;
  /** Whether auto-snapshot is enabled */
  enabled: boolean;
  /** Trigger mode: 'on_leave' or 'character_count' */
  trigger: SnapshotTrigger;
  /** Character count threshold for 'character_count' trigger (default: 500) */
  characterThreshold?: number;
  /** Maximum snapshots to keep for the current version */
  maxSnapshots?: number;
}

/**
 * useAutoSnapshot Hook
 *
 * Creates automatic snapshots based on the configured trigger mode:
 * - 'character_count': Creates a snapshot when the content length increases by the threshold
 * - 'on_leave': Creates a snapshot when the component unmounts
 *
 * Key behaviors:
 * - Only triggers on content INCREASE (deletions don't create snapshots)
 * - Handles initial load correctly (no immediate snapshot)
 * - Tracks last snapshot character count to avoid duplicates
 *
 * @example
 * ```tsx
 * useAutoSnapshot({
 *   storyId: story.id,
 *   content: editorContent,
 *   enabled: true,
 *   trigger: 'character_count',
 *   characterThreshold: 500,
 * });
 * ```
 */
export function useAutoSnapshot({
  storyId,
  content,
  wordCount,
  enabled,
  trigger,
  characterThreshold = 500,
  maxSnapshots,
}: UseAutoSnapshotProps): void {
  // Track the character count and content at the time of last snapshot
  const lastSnapshotCharCount = useRef(0);
  const lastSnapshotContentRef = useRef(content);
  const hasInitializedBaseline = useRef(false);
  const previousEnabledRef = useRef(enabled);
  const previousStoryIdRef = useRef(storyId);

  // Store latest values in refs to avoid stale closures in cleanup
  const storyIdRef = useRef(storyId);
  const contentRef = useRef(content);
  const wordCountRef = useRef(wordCount);
  const enabledRef = useRef(enabled);
  const triggerRef = useRef(trigger);
  const maxSnapshotsRef = useRef(maxSnapshots);

  // Update refs when values change
  storyIdRef.current = storyId;
  contentRef.current = content;
  wordCountRef.current = wordCount;
  enabledRef.current = enabled;
  triggerRef.current = trigger;
  maxSnapshotsRef.current = maxSnapshots;

  // Create snapshot function
  const createSnapshot = useCallback(async (
    snapshotContent: string,
    snapshotStoryId: string,
    snapshotWordCount?: number,
    snapshotMaxSnapshots?: number
  ) => {
    try {
      await createStorySnapshot({
        storyId: snapshotStoryId,
        content: snapshotContent,
        wordCount: snapshotWordCount,
        maxSnapshots: snapshotMaxSnapshots,
      });
    } catch (error) {
      console.error('Auto-snapshot error:', error);
    }
  }, []);

  // Rebase the snapshot baseline when a story finishes loading or tracking is re-enabled.
  useEffect(() => {
    const storyChanged = previousStoryIdRef.current !== storyId;
    const enabledChanged = previousEnabledRef.current !== enabled;

    previousStoryIdRef.current = storyId;
    previousEnabledRef.current = enabled;

    if (!enabled) {
      hasInitializedBaseline.current = false;
      lastSnapshotCharCount.current = content.length;
      lastSnapshotContentRef.current = content;
      return;
    }

    if (storyChanged || enabledChanged || !hasInitializedBaseline.current) {
      lastSnapshotCharCount.current = content.length;
      lastSnapshotContentRef.current = content;
      hasInitializedBaseline.current = true;
    }
  }, [storyId, content, enabled]);

  // Character count trigger: create snapshot when chars increase by threshold
  useEffect(() => {
    // Skip if disabled or not using character_count trigger
    if (!enabled || trigger !== 'character_count' || !hasInitializedBaseline.current) {
      return;
    }

    // Calculate the character difference from last snapshot
    const charsDelta = content.length - lastSnapshotCharCount.current;

    // Only trigger on content INCREASE (positive delta) meeting threshold
    if (charsDelta >= characterThreshold) {
      createSnapshot(content, storyId, wordCount, maxSnapshots).then(() => {
        lastSnapshotCharCount.current = content.length;
        lastSnapshotContentRef.current = content;
      });
    }
  }, [content, storyId, enabled, trigger, characterThreshold, wordCount, maxSnapshots, createSnapshot]);

  // On-leave trigger: create snapshot on component unmount
  useEffect(() => {
    // Return cleanup function for unmount
    return () => {
      // Check enabled state from ref (latest value)
      if (!enabledRef.current) {
        return;
      }

      // Determine if we should snapshot on unmount
      const shouldSnapshot =
        triggerRef.current === 'on_leave' ||
        // Also snapshot if there are unsaved changes (content changed since last snapshot)
        contentRef.current !== lastSnapshotContentRef.current;

      if (shouldSnapshot) {
        createStorySnapshot({
          storyId: storyIdRef.current,
          content: contentRef.current,
          wordCount: wordCountRef.current,
          maxSnapshots: maxSnapshotsRef.current,
        }).catch((error) => {
          console.error('Auto-snapshot cleanup error:', error);
        });
      }
    };
  }, []); // Empty deps - cleanup only runs on unmount
}
