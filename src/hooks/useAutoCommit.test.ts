/**
 * Tests for useAutoCommit Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoCommit } from './useAutoCommit';
import { invoke } from '@tauri-apps/api/core';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock lodash.debounce to execute immediately in tests
vi.mock('lodash.debounce', () => ({
  default: (fn: (...args: unknown[]) => void) => {
    const debounced = (...args: unknown[]) => fn(...args);
    debounced.cancel = vi.fn();
    return debounced;
  },
}));

describe('useAutoCommit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not commit on first render (initial content load)', () => {
    renderHook(() =>
      useAutoCommit({
        storyId: 'story-1',
        gitRepoPath: '/path/to/repo',
        filePath: 'content.md',
        content: 'Initial content',
        delay: 1000,
        enabled: true,
      })
    );

    expect(invoke).not.toHaveBeenCalled();
  });

  it('does not commit if gitRepoPath is null', () => {
    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: null,
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    // Change content
    act(() => {
      rerender({ content: 'Updated' });
    });

    expect(invoke).not.toHaveBeenCalled();
  });

  it('does not commit if disabled', () => {
    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: false,
        }),
      { initialProps: { content: 'Initial' } }
    );

    // Change content
    act(() => {
      rerender({ content: 'Updated' });
    });

    expect(invoke).not.toHaveBeenCalled();
  });

  it('commits when content changes and conditions are met', () => {
    vi.mocked(invoke).mockResolvedValue('commit-hash-123');

    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    // Change content
    act(() => {
      rerender({ content: 'Updated content' });
    });

    expect(invoke).toHaveBeenCalledWith('git_commit_file', {
      repoPath: '/path/to/repo',
      filePath: 'content.md',
      content: 'Updated content',
      message: expect.stringMatching(/^Auto-save: \d{4}-\d{2}-\d{2}T/),
    });
  });

  it('uses timestamp-based commit messages', () => {
    vi.mocked(invoke).mockResolvedValue('commit-hash-123');

    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    act(() => {
      rerender({ content: 'Updated' });
    });

    const lastCall = vi.mocked(invoke).mock.calls[0];
    expect(lastCall[1]).toHaveProperty('message');
    const message = (lastCall[1] as { message: string }).message;
    expect(message).toMatch(/^Auto-save: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('handles commit errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(invoke).mockRejectedValue(new Error('Git error'));

    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    act(() => {
      rerender({ content: 'Updated' });
    });

    // Wait for the promise rejection to be handled
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AutoCommit] Failed to commit:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('commits only the specified file, not entire repo', () => {
    vi.mocked(invoke).mockResolvedValue('commit-hash-123');

    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    act(() => {
      rerender({ content: 'Updated' });
    });

    // Verify it calls git_commit_file (single file) not git_commit_all
    expect(invoke).toHaveBeenCalledWith('git_commit_file', expect.any(Object));
    expect(invoke).not.toHaveBeenCalledWith('git_commit_all', expect.any(Object));
  });

  it('logs commit success to console', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(invoke).mockResolvedValue('commit-hash-123');

    const { rerender } = renderHook(
      ({ content }) =>
        useAutoCommit({
          storyId: 'story-1',
          gitRepoPath: '/path/to/repo',
          filePath: 'content.md',
          content,
          delay: 1000,
          enabled: true,
        }),
      { initialProps: { content: 'Initial' } }
    );

    act(() => {
      rerender({ content: 'Updated' });
    });

    // Wait for the promise to resolve
    await vi.waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[AutoCommit\] Committed story story-1 at/)
      );
    });

    consoleLogSpy.mockRestore();
  });
});
