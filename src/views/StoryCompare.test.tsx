/**
 * StoryCompare Component Tests
 *
 * Tests for variation comparison UI including:
 * - Variation selector functionality
 * - Comparison panel display
 * - Content loading and display
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke } from '@/test/utils';
import { StoryCompare } from './StoryCompare';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, VariationInfo } from '@/types';

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

const mockVariations: VariationInfo[] = [
  {
    slug: 'main',
    display_name: 'Original Story',
    is_current: true,
    is_original: true,
  },
  {
    slug: 'alternate-ending',
    display_name: 'Alternate Ending',
    is_current: false,
    is_original: false,
  },
  {
    slug: 'what-if-sarah-lived',
    display_name: 'What if Sarah lived?',
    is_current: false,
    is_original: false,
  },
];

describe('StoryCompare', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockGoBack: ReturnType<typeof vi.fn>;
  let mockGetStory: ReturnType<typeof vi.fn>;
  let mockShowError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup store mocks
    mockNavigate = vi.fn();
    mockGoBack = vi.fn();
    mockGetStory = vi.fn().mockResolvedValue(mockStory);
    mockShowError = vi.fn();

    // Mock Zustand stores with selector pattern
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        currentRoute: { screen: 'story-compare', storyId: 'story-1' },
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
      };
      return selector ? selector(state) : state;
    });
  });

  describe('Loading and Display', () => {
    it('displays loading state initially', () => {
      renderWithProviders(<StoryCompare />);
      expect(screen.getByText(/loading variations/i)).toBeInTheDocument();
    });

    it('displays story title', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });
    });

    it('displays variation selector dropdowns', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        const selectors = screen.getAllByRole('combobox');
        expect(selectors).toHaveLength(2);
      });
    });

    it('populates selectors with variation display names', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Original Story')).toBeInTheDocument();
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
        expect(screen.getByText('What if Sarah lived?')).toBeInTheDocument();
      });
    });

    it('selects current variation as default for first selector', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        const firstSelector = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
        expect(firstSelector.value).toBe('main');
      });
    });

    it('selects first non-current variation as default for second selector', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        const secondSelector = screen.getAllByRole('combobox')[1] as HTMLSelectElement;
        expect(secondSelector.value).toBe('alternate-ending');
      });
    });
  });

  describe('Variation Selection', () => {
    it('allows changing first variation selection', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const firstSelector = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstSelector, 'alternate-ending');

      expect((firstSelector as HTMLSelectElement).value).toBe('alternate-ending');
    });

    it('allows changing second variation selection', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const secondSelector = screen.getAllByRole('combobox')[1];
      await user.selectOptions(secondSelector, 'what-if-sarah-lived');

      expect((secondSelector as HTMLSelectElement).value).toBe('what-if-sarah-lived');
    });

    it('disables compare button when same variation is selected', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const secondSelector = screen.getAllByRole('combobox')[1];
      await user.selectOptions(secondSelector, 'main'); // Same as first selector

      const compareButton = screen.getByRole('button', { name: /compare/i });
      expect(compareButton).toBeDisabled();
    });
  });

  describe('Comparison Execution', () => {
    it('loads and displays comparison when Compare is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);
      mockTauriInvoke('git_get_file_content', 'Content from variation A');

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        expect(screen.getByText('Content from variation A')).toBeInTheDocument();
      });
    });

    it('displays both comparison panels with correct headers', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      let callCount = 0;
      mockTauriInvoke('git_get_file_content', () => {
        callCount++;
        return Promise.resolve(
          callCount === 1 ? 'Content from main' : 'Content from alternate-ending'
        );
      });

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        // Check for panel headers
        expect(screen.getByText('Original Story')).toBeInTheDocument();
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();

        // Check for content
        expect(screen.getByText('Content from main')).toBeInTheDocument();
        expect(screen.getByText('Content from alternate-ending')).toBeInTheDocument();
      });
    });

    it('shows loading state during comparison', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      let resolvePromise: (value: string) => void;
      const slowPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      mockTauriInvoke('git_get_file_content', slowPromise);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!('Content loaded');
    });

    it('disables selectors and compare button during loading', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      let resolvePromise: (value: string) => void;
      const slowPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      mockTauriInvoke('git_get_file_content', slowPromise);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      const selectors = screen.getAllByRole('combobox');
      expect(selectors[0]).toBeDisabled();
      expect(selectors[1]).toBeDisabled();
      expect(compareButton).toBeDisabled();

      // Resolve the promise
      resolvePromise!('Content loaded');
    });

    it('shows error when comparing same variation with itself', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const secondSelector = screen.getAllByRole('combobox')[1];
      await user.selectOptions(secondSelector, 'main');

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          expect.stringContaining('cannot compare a variation with itself')
        );
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state before comparison is run', async () => {
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      expect(screen.getByText(/select two variations and click compare/i)).toBeInTheDocument();
    });

    it('hides empty state after comparison is loaded', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);
      mockTauriInvoke('git_get_file_content', 'Content loaded');

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        expect(screen.queryByText(/select two variations and click compare/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('shows error when story is not found', async () => {
      mockGetStory.mockResolvedValue(null);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText(/story not found/i)).toBeInTheDocument();
      });
    });

    it('shows error when story has no git repo', async () => {
      const storyWithoutGit = { ...mockStory, gitRepoPath: null };
      mockGetStory.mockResolvedValue(storyWithoutGit);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText(/no version control/i)).toBeInTheDocument();
        expect(screen.getByText(/enable version control/i)).toBeInTheDocument();
      });
    });

    it('shows go back button in error state', async () => {
      const user = userEvent.setup();
      mockGetStory.mockResolvedValue(null);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText(/story not found/i)).toBeInTheDocument();
      });

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      await user.click(goBackButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('shows error toast when content fails to load', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);
      mockTauriInvoke('git_get_file_content', Promise.reject(new Error('Failed to load content')));

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load content')
        );
      });
    });
  });

  describe('Navigation', () => {
    it('goes back when back button is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to story/i });
      await user.click(backButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Initial Route Parameters', () => {
    it('uses branchA from route if provided', async () => {
      (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: {
            screen: 'story-compare',
            storyId: 'story-1',
            branchA: 'alternate-ending',
          },
          navigate: mockNavigate,
          goBack: mockGoBack,
        };
        return selector ? selector(state) : state;
      });

      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        const firstSelector = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
        expect(firstSelector.value).toBe('alternate-ending');
      });
    });

    it('uses branchB from route if provided', async () => {
      (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: {
            screen: 'story-compare',
            storyId: 'story-1',
            branchB: 'what-if-sarah-lived',
          },
          navigate: mockNavigate,
          goBack: mockGoBack,
        };
        return selector ? selector(state) : state;
      });

      mockTauriInvoke('git_list_variations', mockVariations);

      renderWithProviders(<StoryCompare />);

      await waitFor(() => {
        const secondSelector = screen.getAllByRole('combobox')[1] as HTMLSelectElement;
        expect(secondSelector.value).toBe('what-if-sarah-lived');
      });
    });
  });
});
