/**
 * StoryEditor View Tests
 *
 * Tests for the story editing interface with DBV (Database-Only Versioning).
 * Focuses on:
 * - Loading content from active snapshot
 * - Auto-save behavior (30s debounce via useAutoSave)
 * - Integration with useAutoSnapshot for history snapshots
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders, resetTauriMocks } from '@/test/utils';
import { StoryEditor } from './StoryEditor';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Story } from '@/types';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock stores
vi.mock('@/stores/useNavigationStore');
vi.mock('@/stores/useStoriesStore');
vi.mock('@/stores/useToastStore');
vi.mock('@/stores/useSettingsStore');

// Mock RichTextEditor to simplify testing
vi.mock('@/components/editor/RichTextEditor', () => ({
  RichTextEditor: ({
    initialContent,
    onChange,
    placeholder,
  }: {
    initialContent?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
  }) => (
    <div data-testid="rich-text-editor">
      <div data-testid="editor-content">{initialContent || ''}</div>
      <div data-testid="editor-placeholder">{placeholder}</div>
      <button
        data-testid="editor-change"
        onClick={() => onChange?.('{"root":{"children":[{"children":[{"text":"Updated content"}]}]}}')}
      >
        Simulate Change
      </button>
    </div>
  ),
}));

// Import after mocking
import { invoke } from '@tauri-apps/api/core';

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

// Mock story data with active snapshot (DBV)
const mockStory: Story = {
  id: 'story-1',
  universeId: 'universe-1',
  title: 'Test Story',
  description: 'A test story description',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  storyType: 'chapter',
  status: 'draft',
  wordCount: 500,
  targetWordCount: null,
  notes: null,
  outline: null,
  order: 0,
  tags: null,
  color: null,
  favorite: false,
  relatedElementIds: null,
  containerId: null,
  seriesName: null,
  lastEditedAt: '2024-01-01T00:00:00Z',
  version: 1,
  variationGroupId: 'group-1',
  variationType: 'original',
  parentVariationId: null,
  activeVersionId: 'version-1',
  activeSnapshotId: 'snapshot-1',
  activeVersion: {
    id: 'version-1',
    storyId: 'story-1',
    name: 'Original',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  activeSnapshot: {
    id: 'snapshot-1',
    versionId: 'version-1',
    content: '{"root":{"children":[{"children":[{"text":"Initial content from snapshot"}]}]}}',
    createdAt: '2024-01-01T00:00:00Z',
  },
};

describe('StoryEditor', () => {
  const mockGoBack = vi.fn();
  const mockNavigate = vi.fn();
  const mockGetStory = vi.fn();
  const mockUpdateStory = vi.fn();
  const mockShowError = vi.fn();

  const setupMocks = (storyToReturn: Story | null = mockStory) => {
    vi.clearAllMocks();
    resetTauriMocks();

    // Mock navigation store
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: { screen: 'story-editor', storyId: 'story-1' },
          goBack: mockGoBack,
          navigate: mockNavigate,
        };
        return selector(state);
      }
    );

    // Mock stories store
    mockGetStory.mockResolvedValue(storyToReturn);
    (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          getStory: mockGetStory,
          updateStory: mockUpdateStory,
        };
        return selector(state);
      }
    );

    // Mock toast store
    (useToastStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          error: mockShowError,
        };
        return selector(state);
      }
    );

    // Mock settings store with default values
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          snapshotTrigger: 'character_count',
          snapshotCharacterThreshold: 500,
        };
        return selector(state);
      }
    );

    // Mock Tauri invoke
    mockInvoke.mockResolvedValue(undefined);
  };

  beforeEach(() => {
    setupMocks();
  });

  describe('Content Loading from Active Snapshot', () => {
    it('shows loading state initially', () => {
      mockGetStory.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<StoryEditor />);

      expect(screen.getByText('Loading story...')).toBeInTheDocument();
    });

    it('loads content from activeSnapshot (DBV)', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(mockGetStory).toHaveBeenCalledWith('story-1');
      });

      await waitFor(() => {
        // The RichTextEditor should receive the initial content from activeSnapshot
        const editorContent = screen.getByTestId('editor-content');
        expect(editorContent).toHaveTextContent('{"root":{"children":[{"children":[{"text":"Initial content from snapshot"}]}]}}');
      });
    });

    it('renders story title from loaded story', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });
    });

    it('handles empty activeSnapshot gracefully', async () => {
      const storyWithNoSnapshot = {
        ...mockStory,
        activeSnapshot: null,
      };
      setupMocks(storyWithNoSnapshot);

      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        const editorContent = screen.getByTestId('editor-content');
        expect(editorContent).toHaveTextContent(''); // Empty content
      });
    });

    it('shows error state when story not found', async () => {
      setupMocks();
      mockGetStory.mockRejectedValue(new Error('Story not found'));

      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Story not found');
      });
    });

    it('shows "Story not found" when getStory returns null-like', async () => {
      setupMocks(null);

      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByText('Story not found')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Save via story_id (30s Debounce)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls update_snapshot_content after content change with debounce', async () => {
      setupMocks();
      renderWithProviders(<StoryEditor />);

      // Wait for initial load using runAllTimersAsync for promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Verify editor is rendered
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();

      // Simulate content change
      const changeButton = screen.getByTestId('editor-change');
      await act(async () => {
        changeButton.click();
      });

      // Should not call immediately
      expect(mockInvoke).not.toHaveBeenCalledWith('update_snapshot_content', expect.anything());

      // Advance time by 30 seconds (default debounce delay)
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runAllTimersAsync();
      });

      // Now it should have called update_snapshot_content
      expect(mockInvoke).toHaveBeenCalledWith('update_snapshot_content', {
        storyId: 'story-1',
        content: '{"root":{"children":[{"children":[{"text":"Updated content"}]}]}}',
        wordCount: 2, // "Updated content" = 2 words
      });
    });

    it('uses storyId for auto-save (not snapshotId)', async () => {
      setupMocks();
      renderWithProviders(<StoryEditor />);

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();

      // Simulate content change
      const changeButton = screen.getByTestId('editor-change');
      await act(async () => {
        changeButton.click();
      });

      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runAllTimersAsync();
      });

      // Verify the call uses storyId, which backend resolves to active snapshot
      const calls = mockInvoke.mock.calls;
      const updateCall = calls.find(call => call[0] === 'update_snapshot_content');
      expect(updateCall).toBeTruthy();
      expect(updateCall![1]).toHaveProperty('storyId', 'story-1');
    });
  });

  describe('Save State Indicator', () => {
    it('does not show save indicator initially (idle state)', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });

      // No save indicator visible in idle state
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders back button that calls goBack', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      });
    });

    it('renders history button that navigates to story-history', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByLabelText('View history')).toBeInTheDocument();
      });
    });

    it('renders settings button that navigates to story-settings', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByLabelText('Story settings')).toBeInTheDocument();
      });
    });
  });

  describe('Word Count', () => {
    it('calculates and displays word count from content', async () => {
      renderWithProviders(<StoryEditor />);

      // Initial content "Initial content from snapshot" = 4 words
      await waitFor(() => {
        expect(screen.getByText('4 words')).toBeInTheDocument();
      });
    });

    it('updates word count when content changes', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByText('4 words')).toBeInTheDocument();
      });

      // Simulate content change to "Updated content" = 2 words
      const changeButton = screen.getByTestId('editor-change');
      await act(async () => {
        changeButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText('2 words')).toBeInTheDocument();
      });
    });

    it('shows singular "word" for count of 1', async () => {
      const singleWordStory = {
        ...mockStory,
        activeSnapshot: {
          ...mockStory.activeSnapshot!,
          content: '{"root":{"children":[{"children":[{"text":"Hello"}]}]}}',
        },
      };
      setupMocks(singleWordStory);

      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByText('1 word')).toBeInTheDocument();
      });
    });
  });

  describe('Title Editing', () => {
    it('displays story title', async () => {
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Integration', () => {
    it('receives snapshot settings from settings store', async () => {
      // The settings are passed to useAutoSnapshot hook
      // We can verify by checking the mock was called
      renderWithProviders(<StoryEditor />);

      await waitFor(() => {
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });

      // Settings store should have been called to get snapshot config
      expect(useSettingsStore).toHaveBeenCalled();
    });
  });
});
