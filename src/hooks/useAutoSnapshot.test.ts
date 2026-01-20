/**
 * Tests for useAutoSnapshot Hook
 *
 * Tests both trigger modes:
 * - character_count: snapshot when content increases by threshold
 * - on_leave: snapshot on component unmount
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoSnapshot } from './useAutoSnapshot';
import { invoke } from '@tauri-apps/api/core';
import { mockTauriInvoke, resetTauriMocks } from '@/test/utils';

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('useAutoSnapshot', () => {
  beforeEach(() => {
    resetTauriMocks();
    mockTauriInvoke('create_story_snapshot', { id: 'snapshot-1', versionId: 'version-1', content: '', createdAt: '' });
  });

  describe('Character Count Trigger', () => {
    it('does not create snapshot on initial render', () => {
      renderHook(() =>
        useAutoSnapshot({
          storyId: 'story-1',
          content: 'Initial content',
          enabled: true,
          trigger: 'character_count',
          characterThreshold: 500,
        })
      );

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('creates snapshot when content increases by threshold', async () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { content: 'Initial' } }
      );

      // Add content that exceeds threshold (10 chars)
      rerender({ content: 'Initial content that is longer than before' });

      await vi.waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('create_story_snapshot', {
          storyId: 'story-1',
          content: 'Initial content that is longer than before',
        });
      });
    });

    it('does not create snapshot when content increases below threshold', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      // Add only 5 characters (below threshold of 100)
      rerender({ content: 'Initial text' });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('does not create snapshot when content decreases (deletion)', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { content: 'This is some initial content' } }
      );

      // Delete content (should NOT trigger snapshot)
      rerender({ content: 'Short' });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('tracks character count from last snapshot', async () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { content: 'Start' } } // 5 chars
      );

      // First increase: 5 -> 19 chars (delta = 14, exceeds threshold of 10)
      rerender({ content: 'Start and more text' }); // 19 chars

      // Wait for the async snapshot to be called AND the promise chain to complete
      await vi.waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledTimes(1);
      });

      // Allow microtasks to complete (the .then() that updates lastSnapshotCharCount)
      await new Promise(resolve => setTimeout(resolve, 10));

      // Small increase from 19 -> 21 (delta = 2, below threshold)
      // This should NOT trigger because we're measuring from last snapshot
      mockInvoke.mockClear();
      rerender({ content: 'Start and more text!!' }); // 21 chars, delta from 19 = 2

      // Give the effect a chance to run
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockInvoke).not.toHaveBeenCalled();

      // Large increase from 21 -> 34 (delta = 13, exceeds threshold)
      rerender({ content: 'Start and more text plus even more' }); // 34 chars

      await vi.waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledTimes(1);
      });
    });

    it('does not create snapshot when disabled', () => {
      const { rerender } = renderHook(
        ({ content, enabled }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { content: 'Initial', enabled: false } }
      );

      // Add content that would exceed threshold
      rerender({ content: 'Initial content that is much longer now', enabled: false });

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('uses default threshold of 500 when not specified', () => {
      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            // characterThreshold not specified, should default to 500
          }),
        { initialProps: { content: 'Start' } }
      );

      // Add 100 characters (below default threshold of 500)
      const shortAddition = 'a'.repeat(100);
      rerender({ content: 'Start' + shortAddition });
      expect(mockInvoke).not.toHaveBeenCalled();

      // Add 500+ characters (exceeds default threshold)
      const longAddition = 'b'.repeat(500);
      rerender({ content: 'Start' + shortAddition + longAddition });
      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe('On-Leave Trigger', () => {
    it('creates snapshot on unmount when trigger is on_leave', () => {
      const { unmount } = renderHook(() =>
        useAutoSnapshot({
          storyId: 'story-1',
          content: 'Some content to save',
          enabled: true,
          trigger: 'on_leave',
          characterThreshold: 500,
        })
      );

      expect(mockInvoke).not.toHaveBeenCalled();

      // Unmount the component
      unmount();

      expect(mockInvoke).toHaveBeenCalledWith('create_story_snapshot', {
        storyId: 'story-1',
        content: 'Some content to save',
      });
    });

    it('creates snapshot on unmount with character_count trigger when content changed', () => {
      const { rerender, unmount } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 1000, // High threshold so it won't trigger during typing
          }),
        { initialProps: { content: 'Initial' } }
      );

      // Change content but not enough to trigger threshold
      rerender({ content: 'Initial modified' });
      expect(mockInvoke).not.toHaveBeenCalled();

      // Unmount - should still create snapshot because content changed
      unmount();

      expect(mockInvoke).toHaveBeenCalledWith('create_story_snapshot', {
        storyId: 'story-1',
        content: 'Initial modified',
      });
    });

    it('does not create snapshot on unmount when disabled', () => {
      const { unmount } = renderHook(() =>
        useAutoSnapshot({
          storyId: 'story-1',
          content: 'Some content',
          enabled: false,
          trigger: 'on_leave',
          characterThreshold: 500,
        })
      );

      unmount();

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('does not create snapshot on unmount when no changes', () => {
      const { unmount } = renderHook(() =>
        useAutoSnapshot({
          storyId: 'story-1',
          content: 'Same content',
          enabled: true,
          trigger: 'character_count', // Not on_leave
          characterThreshold: 500,
        })
      );

      // Content hasn't changed from initial, and trigger is not on_leave
      // Since lastSnapshotCharCount equals content.length, no snapshot should be created
      unmount();

      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('Story ID Changes', () => {
    it('resets tracking when storyId changes', async () => {
      const { rerender } = renderHook(
        ({ storyId, content }) =>
          useAutoSnapshot({
            storyId,
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { storyId: 'story-1', content: 'Initial content for story 1' } }
      );

      // Change to a different story
      rerender({ storyId: 'story-2', content: 'New story content' });

      // Now add content - this should NOT trigger because we reset on story change
      // The initial render flag is reset, so the next content change is treated as initial
      mockInvoke.mockClear();
      rerender({ storyId: 'story-2', content: 'New story content with more' });

      // Should not have triggered because first render after storyId change is skipped
      expect(mockInvoke).not.toHaveBeenCalled();

      // But the next change should work
      rerender({ storyId: 'story-2', content: 'New story content with more and even more text' });

      await vi.waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('create_story_snapshot', {
          storyId: 'story-2',
          content: 'New story content with more and even more text',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('logs error when snapshot creation fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockInvoke.mockRejectedValueOnce(new Error('Database error'));

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger: 'character_count',
            characterThreshold: 10,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Initial with lots more content added' });

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-snapshot error:',
          expect.any(Error)
        );
      }, { timeout: 1000 });

      consoleSpy.mockRestore();
    });

    it('logs error when cleanup snapshot fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockInvoke.mockRejectedValueOnce(new Error('Cleanup error'));

      const { unmount } = renderHook(() =>
        useAutoSnapshot({
          storyId: 'story-1',
          content: 'Content to save',
          enabled: true,
          trigger: 'on_leave',
          characterThreshold: 500,
        })
      );

      unmount();

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Auto-snapshot cleanup error:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Trigger Mode Switching', () => {
    it('respects trigger mode changes', () => {
      type TriggerProps = { trigger: 'on_leave' | 'character_count'; content: string };
      const { rerender } = renderHook<void, TriggerProps>(
        ({ trigger, content }) =>
          useAutoSnapshot({
            storyId: 'story-1',
            content,
            enabled: true,
            trigger,
            characterThreshold: 10,
          }),
        { initialProps: { trigger: 'on_leave', content: 'Initial' } }
      );

      // With on_leave trigger, content changes should not trigger snapshots
      rerender({ trigger: 'on_leave', content: 'Initial with a lot more content now' });
      expect(mockInvoke).not.toHaveBeenCalled();

      // Switch to character_count trigger
      rerender({ trigger: 'character_count', content: 'Initial with a lot more content now' });

      // Now content changes should trigger (but this render is treated as "initial" for the new trigger)
      // Add more content to trigger
      rerender({ trigger: 'character_count', content: 'Initial with a lot more content now and even more' });
      expect(mockInvoke).toHaveBeenCalled();
    });
  });
});
