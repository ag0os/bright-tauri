/**
 * Tests for useAutoSave Hook
 *
 * Tests debounced auto-saving with state indicators for the DBV system.
 * This hook updates the current snapshot in place (30s debounce) for crash protection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with idle save state', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useAutoSave({
          content: 'Initial content',
          onSave,
        })
      );

      expect(result.current.saveState).toBe('idle');
      expect(result.current.error).toBeNull();
    });

    it('does not call onSave on initial render', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      renderHook(() =>
        useAutoSave({
          content: 'Initial content',
          onSave,
        })
      );

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('Debounced Saving', () => {
    it('calls onSave after delay when content changes', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 1000,
          }),
        { initialProps: { content: 'Initial' } }
      );

      // Change content
      rerender({ content: 'Updated content' });

      // Not called immediately
      expect(onSave).not.toHaveBeenCalled();

      // Advance time by delay
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onSave).toHaveBeenCalledWith('Updated content');
    });

    it('debounces multiple rapid changes', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 1000,
          }),
        { initialProps: { content: 'Initial' } }
      );

      // Rapid changes
      rerender({ content: 'Change 1' });
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      rerender({ content: 'Change 2' });
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      rerender({ content: 'Change 3' });

      // Wait for debounce delay
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should only save the final value
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith('Change 3');
    });

    it('uses default 30 second delay', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            // No delay specified - should default to 30000ms
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      // Not called before 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(29000);
      });
      expect(onSave).not.toHaveBeenCalled();

      // Called after 30 seconds
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe('Save State Transitions', () => {
    it('transitions to saving state when saving', async () => {
      let resolvePromise: () => void;
      const onSave = vi.fn().mockImplementation(
        () => new Promise<void>((resolve) => { resolvePromise = resolve; })
      );

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.saveState).toBe('saving');

      // Resolve the save
      await act(async () => {
        resolvePromise!();
      });
    });

    it('transitions to saved state after successful save', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.saveState).toBe('saved');
    });

    it('transitions back to idle after 2 seconds of saved state', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.saveState).toBe('saved');

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.saveState).toBe('idle');
    });

    it('transitions to error state on save failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onSave = vi.fn().mockRejectedValue(new Error('Database error'));

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.saveState).toBe('error');
      expect(result.current.error).toBe('Database error');

      consoleSpy.mockRestore();
    });
  });

  describe('Enabled State', () => {
    it('does not save when disabled', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content, enabled }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
            enabled,
          }),
        { initialProps: { content: 'Initial', enabled: false } }
      );

      rerender({ content: 'Updated', enabled: false });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('resumes saving when enabled', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content, enabled }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
            enabled,
          }),
        { initialProps: { content: 'Initial', enabled: false } }
      );

      // Enable and change content
      rerender({ content: 'Updated', enabled: true });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(onSave).toHaveBeenCalledWith('Updated');
    });
  });

  describe('Manual Trigger', () => {
    it('allows manual save trigger', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 30000, // Long delay
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated content' });

      // Manually trigger save without waiting for debounce
      await act(async () => {
        result.current.triggerSave();
      });

      expect(onSave).toHaveBeenCalledWith('Updated content');
      expect(result.current.saveState).toBe('saved');
    });

    it('cancels pending debounced save on manual trigger', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 1000,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      // Advance partially
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Manual trigger
      await act(async () => {
        result.current.triggerSave();
      });

      // Wait for rest of debounce
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Should only have been called once (from manual trigger)
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset Function', () => {
    it('resets state to idle', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.saveState).toBe('saved');

      act(() => {
        result.current.reset();
      });

      expect(result.current.saveState).toBe('idle');
      expect(result.current.error).toBeNull();
    });

    it('cancels pending saves on reset', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 1000,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      act(() => {
        result.current.reset();
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('Content Reference Stability', () => {
    it('saves the latest content value', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 100,
          }),
        { initialProps: { content: 'Initial' } }
      );

      // First change
      rerender({ content: 'Update 1' });

      // Change content again before debounce fires
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
      rerender({ content: 'Update 2' });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should save the latest content
      expect(onSave).toHaveBeenCalledWith('Update 2');
    });
  });

  describe('Cleanup', () => {
    it('cancels pending saves on unmount', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      const { rerender, unmount } = renderHook(
        ({ content }) =>
          useAutoSave({
            content,
            onSave,
            delay: 1000,
          }),
        { initialProps: { content: 'Initial' } }
      );

      rerender({ content: 'Updated' });

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
