/**
 * StoryHistory Component Tests
 *
 * Tests for snapshot (commit) history display including:
 * - Snapshot display with formatted dates
 * - Commit message rendering
 * - Auto-save commit detection
 * - Restore functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke } from '@/test/utils';
import { StoryHistory } from './StoryHistory';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, CommitInfo } from '@/types';

// Mock stores
vi.mock('@/stores/useNavigationStore');
vi.mock('@/stores/useToastStore');

// Mock data
const mockStory: Story = {
  id: 'story-1',
  title: 'Test Story',
  description: 'A test story',
  universeId: 'universe-1',
  storyType: 'Novel',
  status: 'In Progress',
  content: '',
  notes: '',
  outline: '',
  wordCount: 0,
  targetWordCount: null,
  order: 0,
  tags: [],
  color: null,
  favorite: false,
  relatedElementIds: [],
  seriesName: null,
  parentStoryId: null,
  createdAt: '2025-01-01T00:00:00Z',
  lastEditedAt: '2025-01-01T00:00:00Z',
  gitRepoPath: '/path/to/repo',
  currentBranch: 'main',
  hasUncommittedChanges: false,
};

// Create timestamps that are a known time in the past
const now = new Date('2025-01-15T12:00:00Z');
const twoHoursAgo = Math.floor(new Date('2025-01-15T10:00:00Z').getTime() / 1000).toString();
const yesterdayTimestamp = Math.floor(new Date('2025-01-14T12:00:00Z').getTime() / 1000).toString();
const lastWeekTimestamp = Math.floor(new Date('2025-01-08T12:00:00Z').getTime() / 1000).toString();

const mockCommits: CommitInfo[] = [
  {
    hash: 'abc123def456',
    author: 'Test Author',
    message: 'Updated chapter 3',
    timestamp: twoHoursAgo,
  },
  {
    hash: 'def456ghi789',
    author: 'Test Author',
    message: 'auto-save',
    timestamp: yesterdayTimestamp,
  },
  {
    hash: 'ghi789jkl012',
    author: 'Test Author',
    message: 'Added new character',
    timestamp: lastWeekTimestamp,
  },
];

describe('StoryHistory', () => {
  let mockGoBack: ReturnType<typeof vi.fn>;
  let mockShowError: ReturnType<typeof vi.fn>;
  let mockShowSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Date constructor for consistent relative time testing
    // Using vi.spyOn instead of useFakeTimers to avoid issues with waitFor
    const DateConstructor = Date;
    vi.spyOn(global as any, 'Date').mockImplementation(((...args: any[]) => {
      if (args.length === 0) {
        return now;
      }
      return new DateConstructor(...args);
    }) as any);

    // Setup store mocks
    mockGoBack = vi.fn();
    mockShowError = vi.fn();
    mockShowSuccess = vi.fn();

    // Mock Zustand stores with selector pattern
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        currentRoute: { screen: 'story-history', storyId: 'story-1' },
        goBack: mockGoBack,
      };
      return selector ? selector(state) : state;
    });

    (useToastStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        error: mockShowError,
        success: mockShowSuccess,
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading and Display', () => {
    it('displays loading state initially', () => {
      renderWithProviders(<StoryHistory />);
      expect(screen.getByText(/loading snapshots/i)).toBeInTheDocument();
    });

    it('displays snapshots with formatted dates', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
        expect(screen.getByText(/1 day ago/i)).toBeInTheDocument();
      });
    });

    it('displays commit messages correctly', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/updated chapter 3/i)).toBeInTheDocument();
        expect(screen.getByText(/added new character/i)).toBeInTheDocument();
      });
    });

    it('displays author names', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        const authorElements = screen.getAllByText('Test Author');
        expect(authorElements.length).toBeGreaterThan(0);
      });
    });

    it('displays short commit hashes (first 7 chars)', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/abc123d/i)).toBeInTheDocument();
        expect(screen.getByText(/def456g/i)).toBeInTheDocument();
        expect(screen.getByText(/ghi789j/i)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-save Detection', () => {
    it('displays "Auto-save" for auto-save commits', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        const autoSaveElements = screen.getAllByText(/auto-save/i);
        expect(autoSaveElements.length).toBeGreaterThan(0);
      });
    });

    it('detects auto-save with various message formats', async () => {
      const autoSaveCommits: CommitInfo[] = [
        { hash: 'aaa', author: 'Test', message: 'auto-save', timestamp: twoHoursAgo },
        { hash: 'bbb', author: 'Test', message: 'Auto-save', timestamp: twoHoursAgo },
        { hash: 'ccc', author: 'Test', message: 'AUTOSAVE', timestamp: twoHoursAgo },
        { hash: 'ddd', author: 'Test', message: 'auto save', timestamp: twoHoursAgo },
        { hash: 'eee', author: 'Test', message: '', timestamp: twoHoursAgo }, // Empty message
      ];

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', autoSaveCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        const autoSaveElements = screen.getAllByText(/auto-save/i);
        // Should display "Auto-save" for all commits
        expect(autoSaveElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Restore Functionality', () => {
    it('shows restore button for each snapshot', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
        // First commit is current, so should have 2 restore buttons
        expect(restoreButtons.length).toBeGreaterThan(0);
      });
    });

    it('disables restore button for current snapshot', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        const currentButton = screen.getByRole('button', { name: /current/i });
        expect(currentButton).toBeDisabled();
      });
    });

    it('opens confirmation dialog when restore is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/updated chapter 3/i)).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
      await user.click(restoreButtons[0]);

      // Check for modal elements using getAllByText since text appears multiple times
      const restoreTexts = screen.getAllByText(/restore to this snapshot/i);
      expect(restoreTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/your current changes will be preserved/i)).toBeInTheDocument();
    });

    it('shows commit details in confirmation dialog', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/added new character/i)).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
      // Click the last restore button (for the "Added new character" commit)
      await user.click(restoreButtons[restoreButtons.length - 1]);

      // Check that commit details appear in the dialog (text may appear multiple times)
      const addedNewCharacterTexts = screen.getAllByText(/added new character/i);
      expect(addedNewCharacterTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('ghi789j')).toBeInTheDocument();
    });

    it('closes dialog on cancel', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/updated chapter 3/i)).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
      await user.click(restoreButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText(/restore to this snapshot/i)).not.toBeInTheDocument();
    });

    it('restores snapshot and reloads history on confirm', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);
      mockTauriInvoke('git_restore_commit', undefined);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/updated chapter 3/i)).toBeInTheDocument();
      });

      const restoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
      await user.click(restoreButtons[0]);

      // After modal opens, get the confirm button (now there are more restore buttons)
      const allRestoreButtons = screen.getAllByRole('button', { name: /restore this snapshot/i });
      const confirmButton = allRestoreButtons[allRestoreButtons.length - 1]; // The last one is in the modal
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.stringContaining('Restored to snapshot')
        );
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no snapshots exist', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', []);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/no snapshots yet/i)).toBeInTheDocument();
        expect(screen.getByText(/snapshots of your story will appear here/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('displays "Load More" button when more than 20 commits exist', async () => {
      // Create 25 commits
      const manyCommits: CommitInfo[] = Array.from({ length: 25 }, (_, i) => ({
        hash: `commit${i}hash`,
        author: 'Test Author',
        message: `Commit ${i}`,
        timestamp: twoHoursAgo,
      }));

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', manyCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
        expect(screen.getByText(/5 remaining/i)).toBeInTheDocument();
      });
    });

    it('loads more commits when "Load More" is clicked', async () => {
      const user = userEvent.setup();
      const manyCommits: CommitInfo[] = Array.from({ length: 25 }, (_, i) => ({
        hash: `commit${i}hash`,
        author: 'Test Author',
        message: `Commit ${i}`,
        timestamp: twoHoursAgo,
      }));

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', manyCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      await user.click(loadMoreButton);

      await waitFor(() => {
        // After loading more, all commits should be visible
        expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
      });
    });

    it('shows loading state on load more button', async () => {
      const user = userEvent.setup();
      const manyCommits: CommitInfo[] = Array.from({ length: 25 }, (_, i) => ({
        hash: `commit${i}hash`,
        author: 'Test Author',
        message: `Commit ${i}`,
        timestamp: twoHoursAgo,
      }));

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', manyCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      await user.click(loadMoreButton);

      // Button should show loading state briefly
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error when story is not found', async () => {
      mockTauriInvoke('ensure_story_git_repo', () =>
        Promise.reject(new Error('Story not found'))
      );

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText(/story not found/i)).toBeInTheDocument();
      });
    });

    it('shows go back button in error state', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', () =>
        Promise.reject(new Error('Failed to load'))
      );

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      });

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      await user.click(goBackButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('goes back when back button is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_get_history', mockCommits);

      renderWithProviders(<StoryHistory />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
