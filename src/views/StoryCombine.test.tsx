/**
 * StoryCombine Component Tests
 *
 * Tests for conflict resolution UI including:
 * - Displaying source and target variation names
 * - Conflict resolution UI
 * - "Keep from" button functionality
 * - Merge completion
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke } from '@/test/utils';
import { StoryCombine } from './StoryCombine';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story } from '@/types';

// Mock stores
vi.mock('@/stores/useNavigationStore');
vi.mock('@/stores/useStoriesStore');
vi.mock('@/stores/useToastStore');

// Mock data
const mockStory: Story = {
  id: 'story-1',
  title: 'Test Story',
  description: 'A test story',
  universeId: 'universe-1',
  storyType: 'novel',
  status: 'inprogress',
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
  updatedAt: '2025-01-01T00:00:00Z',
  lastEditedAt: '2025-01-01T00:00:00Z',
  gitRepoPath: '/path/to/repo',
  currentBranch: 'main',
  stagedChanges: false,
  version: 1,
  variationGroupId: 'vg-1',
  variationType: 'original',
  parentVariationId: null,
};

describe('StoryCombine', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockGoBack: ReturnType<typeof vi.fn>;
  let mockGetStory: ReturnType<typeof vi.fn>;
  let mockShowError: ReturnType<typeof vi.fn>;
  let mockShowSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup store mocks
    mockNavigate = vi.fn();
    mockGoBack = vi.fn();
    mockGetStory = vi.fn().mockResolvedValue(mockStory);
    mockShowError = vi.fn();
    mockShowSuccess = vi.fn();

    // Mock Zustand stores with selector pattern
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        currentRoute: {
          screen: 'story-combine',
          storyId: 'story-1',
          fromBranch: 'alternate-ending',
          intoBranch: 'main',
          conflicts: ['story.md', 'chapters/chapter-1.md'],
        },
        navigate: mockNavigate,
        goBack: mockGoBack,
      };
      return selector ? selector(state) : state;
    });

    (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        getStory: mockGetStory,
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

  describe('Display', () => {
    it('displays source and target variation names', async () => {
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        const alternateElements = screen.getAllByText(/alternate-ending/i);
        const mainElements = screen.getAllByText(/main/i);
        expect(alternateElements.length).toBeGreaterThan(0);
        expect(mainElements.length).toBeGreaterThan(0);
      });
    });

    it('displays conflict count correctly', async () => {
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText(/2 files have conflicts/i)).toBeInTheDocument();
      });
    });

    it('displays singular "file has" when only one conflict', async () => {
      (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: {
            screen: 'story-combine',
            storyId: 'story-1',
            fromBranch: 'alternate-ending',
            intoBranch: 'main',
            conflicts: ['story.md'],
          },
          navigate: mockNavigate,
          goBack: mockGoBack,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText(/1 file has conflicts/i)).toBeInTheDocument();
      });
    });

    it('displays all conflicting file paths', async () => {
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
        expect(screen.getByText('chapters/chapter-1.md')).toBeInTheDocument();
      });
    });

    it('shows warning icons for unresolved conflicts', async () => {
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        const warningIcons = document.querySelectorAll('.conflict-icon');
        expect(warningIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Conflict Resolution', () => {
    it('"Keep from" buttons work correctly for target branch', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      await user.click(keepMainButtons[0]);

      // Button should now be highlighted as primary
      expect(keepMainButtons[0]).toHaveClass('btn-primary');
    });

    it('"Keep from" buttons work correctly for source branch', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepFromButtons = screen.getAllByRole('button', { name: /keep from alternate-ending/i });
      await user.click(keepFromButtons[0]);

      // Button should now be highlighted as primary
      expect(keepFromButtons[0]).toHaveClass('btn-primary');
    });

    it('shows resolution badge after selecting a resolution', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      await user.click(keepMainButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/keeping from main/i)).toBeInTheDocument();
      });
    });

    it('shows check icon after conflict is resolved', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      await user.click(keepMainButtons[0]);

      await waitFor(() => {
        const checkIcons = document.querySelectorAll('.resolved-icon');
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });

    it('can switch between resolutions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      const keepFromButtons = screen.getAllByRole('button', { name: /keep from alternate-ending/i });

      // First select "Keep from main"
      await user.click(keepMainButtons[0]);
      expect(screen.getByText(/keeping from main/i)).toBeInTheDocument();

      // Then switch to "Keep from alternate-ending"
      await user.click(keepFromButtons[0]);
      expect(screen.getByText(/keeping from alternate-ending/i)).toBeInTheDocument();
    });

    it('tracks resolution state independently for each conflict', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
        expect(screen.getByText('chapters/chapter-1.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      const keepFromButtons = screen.getAllByRole('button', { name: /keep from alternate-ending/i });

      // Resolve first conflict with "main"
      await user.click(keepMainButtons[0]);

      // Resolve second conflict with "alternate-ending"
      await user.click(keepFromButtons[1]);

      // Both should show resolution badges
      const resolutionBadges = screen.getAllByText(/keeping from/i);
      expect(resolutionBadges).toHaveLength(2);
    });
  });

  describe('Save Combined Version', () => {
    it('disables save button when not all conflicts are resolved', async () => {
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save combined version/i });
      expect(saveButton).toBeDisabled();
    });

    it('enables save button when all conflicts are resolved', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });

      // Resolve all conflicts
      for (const button of keepMainButtons) {
        await user.click(button);
      }

      const saveButton = screen.getByRole('button', { name: /save combined version/i });
      expect(saveButton).toBeEnabled();
    });

    it('shows error when trying to save with unresolved conflicts', async () => {
      const user = userEvent.setup();
      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      // Resolve only one conflict
      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });
      await user.click(keepMainButtons[0]);

      const saveButton = screen.getByRole('button', { name: /save combined version/i });

      // Save button should still be disabled since not all conflicts are resolved
      expect(saveButton).toBeDisabled();
    });

    it('successfully saves and navigates back when all resolved', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_resolve_conflict', undefined);
      mockTauriInvoke('git_commit_all', undefined);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });

      // Resolve all conflicts
      for (const button of keepMainButtons) {
        await user.click(button);
      }

      const saveButton = screen.getByRole('button', { name: /save combined version/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.stringContaining('Successfully combined')
        );
        expect(mockNavigate).toHaveBeenCalledWith({
          screen: 'story-variations',
          storyId: 'story-1',
        });
      });
    });

    it('shows loading state while saving', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      const slowPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockTauriInvoke('git_resolve_conflict', slowPromise);
      mockTauriInvoke('git_commit_all', undefined);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const keepMainButtons = screen.getAllByRole('button', { name: /keep from main/i });

      // Resolve all conflicts
      for (const button of keepMainButtons) {
        await user.click(button);
      }

      const saveButton = screen.getByRole('button', { name: /save combined version/i });
      await user.click(saveButton);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!();
    });
  });

  describe('Cancel', () => {
    it('aborts merge and navigates back on cancel', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_abort_merge', undefined);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('Combine cancelled');
        expect(mockNavigate).toHaveBeenCalledWith({
          screen: 'story-variations',
          storyId: 'story-1',
        });
      });
    });

    it('disables buttons while aborting', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      const slowPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockTauriInvoke('git_abort_merge', slowPromise);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText('story.md')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(cancelButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /save combined version/i })).toBeDisabled();

      // Resolve the promise
      resolvePromise!();
    });
  });

  describe('Error States', () => {
    it('shows error when invalid combine state (no story)', async () => {
      mockGetStory.mockResolvedValue(null);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText(/invalid combine state/i)).toBeInTheDocument();
      });
    });

    it('shows error when missing branch information', async () => {
      (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: {
            screen: 'story-combine',
            storyId: 'story-1',
            fromBranch: null,
            intoBranch: 'main',
            conflicts: ['story.md'],
          },
          navigate: mockNavigate,
          goBack: mockGoBack,
        };
        return selector ? selector(state) : state;
      });

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText(/invalid combine state/i)).toBeInTheDocument();
      });
    });

    it('shows go back button in error state', async () => {
      const user = userEvent.setup();
      mockGetStory.mockResolvedValue(null);

      renderWithProviders(<StoryCombine />);

      await waitFor(() => {
        expect(screen.getByText(/invalid combine state/i)).toBeInTheDocument();
      });

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      await user.click(goBackButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
