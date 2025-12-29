/**
 * StoriesList Component Tests
 *
 * Tests for filter UI to prevent regressions:
 * - Story Type filter dropdown only shows valid StoryType options
 * - Search input updates filters correctly
 * - Sort controls work properly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke } from '@/test/utils';
import { StoriesList } from './StoriesList';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useContainersStore } from '@/stores/useContainersStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import type { Universe } from '@/types';

// Mock stores
vi.mock('@/stores/useStoriesStore');
vi.mock('@/stores/useContainersStore');
vi.mock('@/stores/useNavigationStore');
vi.mock('@/stores/useUniverseStore');

// Mock useTheme hook
vi.mock('@/hooks', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    isDark: true,
    isLight: false,
  }),
}));

// Mock data
const mockUniverse: Universe = {
  id: 'universe-1',
  name: 'Test Universe',
  description: 'A test universe',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('StoriesList - Filter UI', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockLoadStories: ReturnType<typeof vi.fn>;
  let mockLoadContainers: ReturnType<typeof vi.fn>;
  let mockSetFilter: ReturnType<typeof vi.fn>;
  let mockSetSorting: ReturnType<typeof vi.fn>;
  let mockDeleteStory: ReturnType<typeof vi.fn>;
  let mockUpdateStory: ReturnType<typeof vi.fn>;
  let mockDeleteContainer: ReturnType<typeof vi.fn>;
  let mockGetFilteredAndSortedStories: ReturnType<typeof vi.fn>;
  let mockGetFilteredContainers: ReturnType<typeof vi.fn>;
  let mockSetContainerFilter: ReturnType<typeof vi.fn>;
  let mockLoadUniverses: ReturnType<typeof vi.fn>;
  let mockSetCurrentUniverse: ReturnType<typeof vi.fn>;

  // Helper functions to find specific filter dropdowns
  const getTypeFilterSelect = () => screen.getByRole('combobox', {
    name: (name, element) => {
      return element instanceof HTMLSelectElement &&
             Array.from(element.options).some(opt => opt.text === 'All Story Types');
    }
  });

  const getSortSelect = () => screen.getByRole('combobox', {
    name: (name, element) => {
      return element instanceof HTMLSelectElement &&
             Array.from(element.options).some(opt => opt.text === 'Last Edited');
    }
  });

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock functions
    mockNavigate = vi.fn();
    mockLoadStories = vi.fn();
    mockLoadContainers = vi.fn();
    mockSetFilter = vi.fn();
    mockSetSorting = vi.fn();
    mockDeleteStory = vi.fn();
    mockUpdateStory = vi.fn();
    mockDeleteContainer = vi.fn();
    mockGetFilteredAndSortedStories = vi.fn(() => []);
    mockGetFilteredContainers = vi.fn(() => []);
    mockSetContainerFilter = vi.fn();
    mockLoadUniverses = vi.fn();
    mockSetCurrentUniverse = vi.fn();

    // Mock Navigation Store
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          navigate: mockNavigate,
          currentRoute: { screen: 'stories-list' },
        };
        return selector ? selector(state) : state;
      }
    );

    // Mock Universe Store
    (useUniverseStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          currentUniverse: mockUniverse,
          universes: [mockUniverse],
          loadUniverses: mockLoadUniverses,
          setCurrentUniverse: mockSetCurrentUniverse,
        };
        return selector ? selector(state) : state;
      }
    );

    // Mock Stories Store
    (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          isLoading: false,
          error: null,
          loadStories: mockLoadStories,
          deleteStory: mockDeleteStory,
          updateStory: mockUpdateStory,
          filters: {
            searchQuery: '',
            type: null,
          },
          setFilter: mockSetFilter,
          getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
          setSorting: mockSetSorting,
          sortBy: 'lastEdited',
          sortOrder: 'desc',
        };
        return selector ? selector(state) : state;
      }
    );

    // Mock Containers Store
    (useContainersStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          containers: [],
          isLoading: false,
          error: null,
          loadContainers: mockLoadContainers,
          deleteContainer: mockDeleteContainer,
          filters: {
            containerType: null,
            searchQuery: '',
          },
          setFilter: mockSetContainerFilter,
          getFilteredContainers: mockGetFilteredContainers,
        };
        return selector ? selector(state) : state;
      }
    );
  });

  describe('Story Type Filter Dropdown', () => {
    it('renders only valid StoryType options (regression test)', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      // Get the type filter dropdown
      const typeSelect = getTypeFilterSelect();
      expect(typeSelect).toBeInTheDocument();

      // Valid StoryType options MUST be present
      const validOptions = [
        'All Story Types',
        'Chapter',
        'Short Story',
        'Scene',
        'Episode',
        'Poem',
        'Outline',
        'Treatment',
        'Screenplay',
      ];

      validOptions.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('does NOT render Container types in dropdown (critical regression test)', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      // Container types should NOT be present anywhere in the type filter
      const invalidOptions = ['Novel', 'Series', 'Collection'];

      // Get the type filter select
      const typeSelect = getTypeFilterSelect() as HTMLSelectElement;
      const options = Array.from(typeSelect.querySelectorAll('option'));
      const optionTexts = options.map((opt) => opt.textContent);

      // Verify invalid options are not in the list
      invalidOptions.forEach((invalidOption) => {
        expect(optionTexts).not.toContain(invalidOption);
      });
    });

    it('calls setFilter with correct value when type is selected', async () => {
      const user = userEvent.setup();

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      // Find type filter dropdown
      const typeSelect = getTypeFilterSelect();

      // Select "Chapter"
      await user.selectOptions(typeSelect, 'chapter');

      expect(mockSetFilter).toHaveBeenCalledWith('type', 'chapter');
    });

    it('calls setFilter with null when "All Types" is selected', async () => {
      const user = userEvent.setup();

      // Start with a type filter set
      (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            isLoading: false,
            error: null,
            loadStories: mockLoadStories,
            deleteStory: mockDeleteStory,
            updateStory: mockUpdateStory,
            filters: {
              searchQuery: '',
              type: 'chapter',
            },
            setFilter: mockSetFilter,
            getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
            setSorting: mockSetSorting,
            sortBy: 'lastEdited',
            sortOrder: 'desc',
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const typeSelect = getTypeFilterSelect();

      // Select "All Types" (empty value)
      await user.selectOptions(typeSelect, '');

      expect(mockSetFilter).toHaveBeenCalledWith('type', null);
    });

    it('has correct option values matching StoryType enum', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const typeSelect = getTypeFilterSelect() as HTMLSelectElement;

      // Get all option elements
      const options = Array.from(typeSelect.querySelectorAll('option')) as HTMLOptionElement[];

      // Verify option values match StoryType enum values
      const expectedValues = [
        '', // "All Types"
        'chapter',
        'short-story',
        'scene',
        'episode',
        'poem',
        'outline',
        'treatment',
        'screenplay',
      ];

      const actualValues = options.map((opt) => opt.value);
      expect(actualValues).toEqual(expectedValues);
    });
  });

  describe('Search Input', () => {
    it('renders search input', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search stories and containers...');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls setFilter with searchQuery when typing', async () => {
      const user = userEvent.setup();

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search stories and containers...');

      await user.type(searchInput, 'test');

      // Should be called for each character typed
      // Check that setFilter was called with searchQuery (for stories)
      const storyCalls = mockSetFilter.mock.calls.filter(call => call[0] === 'searchQuery');
      expect(storyCalls.length).toBeGreaterThan(0);

      // Check that setContainerFilter was called with searchQuery (for containers)
      const containerCalls = mockSetContainerFilter.mock.calls.filter(call => call[0] === 'searchQuery');
      expect(containerCalls.length).toBeGreaterThan(0);
    });

    it('displays current search query value', async () => {
      // Set a search query in the store
      (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            isLoading: false,
            error: null,
            loadStories: mockLoadStories,
            deleteStory: mockDeleteStory,
            updateStory: mockUpdateStory,
            filters: {
              searchQuery: 'existing query',
              type: null,
            },
            setFilter: mockSetFilter,
            getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
            setSorting: mockSetSorting,
            sortBy: 'lastEdited',
            sortOrder: 'desc',
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search stories and containers...') as HTMLInputElement;
      expect(searchInput.value).toBe('existing query');
    });
  });

  describe('Sort Controls', () => {
    it('renders sort dropdown with correct options', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      // Sort options
      expect(screen.getByText('Last Edited')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Word Count')).toBeInTheDocument();
    });

    it('calls setSorting when sort option is changed', async () => {
      const user = userEvent.setup();

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const sortSelect = getSortSelect();

      await user.selectOptions(sortSelect, 'title');

      expect(mockSetSorting).toHaveBeenCalledWith('title', 'desc');
    });

    it('renders sort order toggle button', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const sortOrderButton = screen.getByTitle('Descending');
      expect(sortOrderButton).toBeInTheDocument();
      expect(sortOrderButton.textContent).toBe('↓');
    });

    it('toggles sort order when button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const sortOrderButton = screen.getByTitle('Descending');
      await user.click(sortOrderButton);

      expect(mockSetSorting).toHaveBeenCalledWith('lastEdited', 'asc');
    });

    it('displays ascending icon when sortOrder is asc', async () => {
      // Set sort order to ascending
      (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            isLoading: false,
            error: null,
            loadStories: mockLoadStories,
            deleteStory: mockDeleteStory,
            updateStory: mockUpdateStory,
            filters: {
              searchQuery: '',
              type: null,
            },
            setFilter: mockSetFilter,
            getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
            setSorting: mockSetSorting,
            sortBy: 'lastEdited',
            sortOrder: 'asc',
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const sortOrderButton = screen.getByTitle('Ascending');
      expect(sortOrderButton.textContent).toBe('↑');
    });

    it('has correct sort option values', async () => {
      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      const sortSelect = getSortSelect() as HTMLSelectElement;

      const options = Array.from(sortSelect.querySelectorAll('option')) as HTMLOptionElement[];

      const expectedValues = ['lastEdited', 'title', 'wordCount'];
      const actualValues = options.map((opt) => opt.value);

      expect(actualValues).toEqual(expectedValues);
    });
  });

  describe('Filter Combinations', () => {
    it('allows setting multiple filters simultaneously', async () => {
      const user = userEvent.setup();

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      // Set type filter
      const typeSelect = getTypeFilterSelect();
      await user.selectOptions(typeSelect, 'chapter');

      // Set search query
      const searchInput = screen.getByPlaceholderText('Search stories and containers...');
      await user.type(searchInput, 'test');

      // All filters should be set
      expect(mockSetFilter).toHaveBeenCalledWith('type', 'chapter');
      expect(mockSetFilter).toHaveBeenCalledWith('searchQuery', expect.any(String));
    });
  });

  describe('Edge Cases', () => {
    it('handles missing universe gracefully', async () => {
      // Mock universe as null
      (useUniverseStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            currentUniverse: null,
            universes: [],
            loadUniverses: mockLoadUniverses,
            setCurrentUniverse: mockSetCurrentUniverse,
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      // Should not crash - filters should still render
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Stories' })).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Search stories and containers...')).toBeInTheDocument();
    });

    it('renders filters even when loading', async () => {
      // Mock loading state
      (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            isLoading: true,
            error: null,
            loadStories: mockLoadStories,
            deleteStory: mockDeleteStory,
            updateStory: mockUpdateStory,
            filters: {
              searchQuery: '',
              type: null,
            },
            setFilter: mockSetFilter,
            getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
            setSorting: mockSetSorting,
            sortBy: 'lastEdited',
            sortOrder: 'desc',
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      // Filters should still be visible
      expect(screen.getByPlaceholderText('Search stories and containers...')).toBeInTheDocument();
      expect(screen.getByText('All Story Types')).toBeInTheDocument();
    });

    it('renders filters even when there is an error', async () => {
      // Mock error state
      (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: (state: unknown) => unknown) => {
          const state = {
            isLoading: false,
            error: 'Failed to load stories',
            loadStories: mockLoadStories,
            deleteStory: mockDeleteStory,
            updateStory: mockUpdateStory,
            filters: {
              searchQuery: '',
              type: null,
            },
            setFilter: mockSetFilter,
            getFilteredAndSortedStories: mockGetFilteredAndSortedStories,
            setSorting: mockSetSorting,
            sortBy: 'lastEdited',
            sortOrder: 'desc',
          };
          return selector ? selector(state) : state;
        }
      );

      renderWithProviders(<StoriesList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load stories')).toBeInTheDocument();
      });

      // Filters should still be visible
      expect(screen.getByPlaceholderText('Search stories and containers...')).toBeInTheDocument();
      expect(screen.getByText('All Story Types')).toBeInTheDocument();
    });
  });
});
