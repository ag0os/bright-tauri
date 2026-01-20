/**
 * useAutoSnapshot Hook
 *
 * Custom React hook for creating automatic history restore points (snapshots)
 * based on character count threshold or component unmount (on-leave) trigger.
 *
 * Part of Database-Only Versioning (DBV) implementation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { SnapshotTrigger } from '@/stores/useSettingsStore';

export interface UseAutoSnapshotProps {
  /** The story ID to create snapshots for */
  storyId: string;
  /** The current content to snapshot */
  content: string;
  /** Whether auto-snapshot is enabled */
  enabled: boolean;
  /** Trigger mode: 'on_leave' or 'character_count' */
  trigger: SnapshotTrigger;
  /** Character count threshold for 'character_count' trigger (default: 500) */
  characterThreshold?: number;
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
  enabled,
  trigger,
  characterThreshold = 500,
}: UseAutoSnapshotProps): void {
  // Track the character count at the time of last snapshot
  const lastSnapshotCharCount = useRef(content.length);

  // Track if this is the initial render (to avoid immediate snapshot)
  const isInitialRender = useRef(true);

  // Store latest values in refs to avoid stale closures in cleanup
  const storyIdRef = useRef(storyId);
  const contentRef = useRef(content);
  const enabledRef = useRef(enabled);
  const triggerRef = useRef(trigger);

  // Update refs when values change
  storyIdRef.current = storyId;
  contentRef.current = content;
  enabledRef.current = enabled;
  triggerRef.current = trigger;

  // Create snapshot function
  const createSnapshot = useCallback(async (snapshotContent: string, snapshotStoryId: string) => {
    try {
      await invoke('create_story_snapshot', {
        storyId: snapshotStoryId,
        content: snapshotContent,
      });
    } catch (error) {
      console.error('Auto-snapshot error:', error);
    }
  }, []);

  // Character count trigger: create snapshot when chars increase by threshold
  useEffect(() => {
    // Skip if disabled or not using character_count trigger
    if (!enabled || trigger !== 'character_count') {
      return;
    }

    // Skip initial render to avoid immediate snapshot on load
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Calculate the character difference from last snapshot
    const charsDelta = content.length - lastSnapshotCharCount.current;

    // Only trigger on content INCREASE (positive delta) meeting threshold
    if (charsDelta >= characterThreshold) {
      createSnapshot(content, storyId).then(() => {
        lastSnapshotCharCount.current = content.length;
      });
    }
  }, [content, storyId, enabled, trigger, characterThreshold, createSnapshot]);

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
        contentRef.current.length !== lastSnapshotCharCount.current;

      if (shouldSnapshot) {
        // Use sync-compatible approach for cleanup
        // Note: invoke returns a Promise, but we're in a cleanup function
        // The snapshot will be attempted but may not complete if the component
        // unmounts due to navigation. This is intentional - on_leave is best-effort.
        invoke('create_story_snapshot', {
          storyId: storyIdRef.current,
          content: contentRef.current,
        }).catch((error) => {
          console.error('Auto-snapshot cleanup error:', error);
        });
      }
    };
  }, []); // Empty deps - cleanup only runs on unmount

  // Track the previous storyId to detect changes (not just initial mount)
  const prevStoryIdRef = useRef(storyId);

  // Reset tracking when storyId changes (switching to different story)
  // This should NOT run on initial mount, only when storyId actually changes
  useEffect(() => {
    if (prevStoryIdRef.current !== storyId) {
      lastSnapshotCharCount.current = content.length;
      isInitialRender.current = true;
      prevStoryIdRef.current = storyId;
    }
  }, [storyId, content.length]);
}
