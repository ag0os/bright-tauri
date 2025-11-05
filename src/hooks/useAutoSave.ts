/**
 * useAutoSave Hook
 *
 * Custom React hook for debounced auto-saving with state indicators.
 * Prevents excessive save calls by debouncing user input changes.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  /** The content to auto-save */
  content: T;
  /** Callback function to save the content */
  onSave: (content: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 2000ms) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

export interface UseAutoSaveReturn {
  /** Current save state */
  saveState: SaveState;
  /** Error message if save failed */
  error: string | null;
  /** Manually trigger a save */
  triggerSave: () => void;
  /** Reset save state and error */
  reset: () => void;
}

/**
 * useAutoSave Hook
 *
 * Automatically saves content after a specified delay of inactivity.
 * Provides save state for UI indicators.
 *
 * @example
 * ```tsx
 * const { saveState } = useAutoSave({
 *   content: editorContent,
 *   onSave: async (content) => {
 *     await updateStory(storyId, { content });
 *   },
 *   delay: 2000,
 * });
 * ```
 */
export function useAutoSave<T>({
  content,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Store the latest content to avoid stale closures
  const contentRef = useRef(content);
  contentRef.current = content;

  // Save function
  const performSave = useCallback(async () => {
    if (!enabled) return;

    setSaveState('saving');
    setError(null);

    try {
      await onSave(contentRef.current);
      setSaveState('saved');

      // Reset to idle after showing "saved" for a moment
      setTimeout(() => {
        setSaveState('idle');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      setSaveState('error');
      console.error('Auto-save error:', err);
    }
  }, [enabled, onSave]);

  // Create debounced save function
  const debouncedSave = useRef(
    debounce((callback: () => void) => {
      callback();
    }, delay)
  );

  // Update debounce delay if it changes
  useEffect(() => {
    debouncedSave.current = debounce((callback: () => void) => {
      callback();
    }, delay);

    return () => {
      debouncedSave.current.cancel();
    };
  }, [delay]);

  // Trigger auto-save when content changes
  useEffect(() => {
    // Skip auto-save on first render (initial content load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) {
      return;
    }

    // Cancel any pending save and schedule a new one
    debouncedSave.current.cancel();
    debouncedSave.current(() => {
      performSave();
    });

    // Cleanup: cancel pending saves on unmount
    return () => {
      debouncedSave.current.cancel();
    };
  }, [content, enabled, performSave]);

  // Manual save trigger
  const triggerSave = useCallback(() => {
    debouncedSave.current.cancel();
    performSave();
  }, [performSave]);

  // Reset function
  const reset = useCallback(() => {
    setSaveState('idle');
    setError(null);
    debouncedSave.current.cancel();
  }, []);

  return {
    saveState,
    error,
    triggerSave,
    reset,
  };
}
