/**
 * StoryVariations Component Tests
 *
 * Tests for variation (branch) management UI including:
 * - Variation list display with proper naming
 * - Badges for original and current variations
 * - Creating new variations
 * - Switching between variations
 * - Combining variations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke } from '@/test/utils';
import { StoryVariations } from './StoryVariations';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, VariationInfo } from '@/types';

// Mock stores
vi.mock('@/stores/useNavigationStore');
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

describe('StoryVariations', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockGoBack: ReturnType<typeof vi.fn>;
  let mockShowError: ReturnType<typeof vi.fn>;
  let mockShowSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup store mocks
    mockNavigate = vi.fn();
    mockGoBack = vi.fn();
    mockShowError = vi.fn();
    mockShowSuccess = vi.fn();

    // Mock Zustand stores with selector pattern
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const state = {
        currentRoute: { screen: 'story-variations', storyId: 'story-1' },
        navigate: mockNavigate,
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

  describe('Loading and Display', () => {
    it('displays loading state initially', () => {
      renderWithProviders(<StoryVariations />);
      expect(screen.getByText(/loading variations/i)).toBeInTheDocument();
    });

    it('displays variations with display names (not slugs)', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Original Story')).toBeInTheDocument();
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
        expect(screen.getByText('What if Sarah lived?')).toBeInTheDocument();
      });

      // Should not display slugs
      expect(screen.queryByText('main')).not.toBeInTheDocument();
      expect(screen.queryByText('alternate-ending')).not.toBeInTheDocument();
    });

    it('shows "Original" badge for the original variation', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        const originalElements = screen.getAllByText(/original/i);
        expect(originalElements.length).toBeGreaterThan(0);
      });

      // Only one "Original" badge should exist
      const originalBadges = screen.getAllByText(/original/i).filter(
        (el) => el.className.includes('original-badge')
      );
      expect(originalBadges).toHaveLength(1);
    });

    it('shows "Current Variation" indicator for active variation', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText(/current variation/i)).toBeInTheDocument();
      });
    });

    it('displays variation count correctly', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText(/variations \(3\)/i)).toBeInTheDocument();
      });
    });

    it('does not show action buttons for current variation', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Original Story')).toBeInTheDocument();
      });

      // Current variation should not have Switch/Combine buttons
      const currentVariationItem = screen.getByText('Current Variation').closest('.branch-item');

      // Use queryAllBy to handle multiple matches, then check if none are in current item
      const switchButtons = screen.queryAllByText(/switch to/i);
      const combineButtons = screen.queryAllByText(/combine/i);

      switchButtons.forEach(button => {
        expect(currentVariationItem).not.toContainElement(button);
      });

      combineButtons.forEach(button => {
        expect(currentVariationItem).not.toContainElement(button);
      });
    });
  });

  describe('Creating Variations', () => {
    it('opens create variation dialog when "New Variation" is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      expect(screen.getByText('Create New Variation')).toBeInTheDocument();
      expect(screen.getByLabelText(/variation name/i)).toBeInTheDocument();
    });

    it('blocks creation with reserved name "original" (case-insensitive)', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'original');

      // Validation error should be shown
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).toBeDisabled();
    });

    it('blocks creation with reserved name "main" (case-insensitive)', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'MAIN');

      // Validation error should be shown
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).toBeDisabled();
    });

    it('blocks creation with reserved name "master"', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'Master');

      // Validation error should be shown
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).toBeDisabled();
    });

    it('blocks creation with reserved name "HEAD"', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'head');

      // Validation error should be shown
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).toBeDisabled();
    });

    it('shows toast error when attempting to create with reserved name', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'original');

      // Clear validation to allow click
      await user.clear(input);
      await user.type(input, 'original');

      // Try to submit with Enter key (should be blocked)
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          expect.stringContaining('reserved name')
        );
      });
    });

    it('clears validation error when typing valid name after invalid', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);

      // Type reserved name
      await user.type(input, 'main');
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Clear and type valid name
      await user.clear(input);
      await user.type(input, 'Valid Variation Name');

      // Error should be gone
      expect(screen.queryByText(/is a reserved name/i)).not.toBeInTheDocument();

      // Create button should be enabled
      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).not.toBeDisabled();
    });

    it('clears validation error when closing form', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'original');

      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();

      // Close form with Escape
      await user.keyboard('{Escape}');

      expect(screen.queryByText('Create New Variation')).not.toBeInTheDocument();

      // Reopen form - error should not persist
      await user.click(newVariationButton);
      expect(screen.queryByText(/is a reserved name/i)).not.toBeInTheDocument();
    });

    it('creates variation with special characters (tests slug generation)', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'What if Sarah lived?!');

      mockTauriInvoke('git_create_branch', undefined);
      mockTauriInvoke('git_list_branches', [
        ...mockVariations,
        {
          slug: 'what-if-sarah-lived',
          display_name: 'What if Sarah lived?!',
          is_current: false,
          is_original: false,
        },
      ]);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      const createButton = screen.getByRole('button', { name: /create variation/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.stringContaining('What if Sarah lived?!')
        );
      });
    });

    it('disables create button when input is empty', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const createButton = screen.getByRole('button', { name: /create variation/i });
      expect(createButton).toBeDisabled();
    });

    it('closes create dialog on cancel', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Create New Variation')).not.toBeInTheDocument();
    });

    it('closes create dialog on Escape key', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      input.focus();
      await user.keyboard('{Escape}');

      expect(screen.queryByText('Create New Variation')).not.toBeInTheDocument();
    });

    it('creates variation on Enter key press', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'New Variation');

      mockTauriInvoke('git_create_branch', undefined);
      mockTauriInvoke('git_list_branches', [...mockVariations]);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Slug Preview', () => {
    it('shows slug preview when typing variation name', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'What if Sarah lived?');

      expect(screen.getByText(/branch name: what-if-sarah-lived/i)).toBeInTheDocument();
    });

    it('does not show slug preview when input is empty', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      expect(screen.queryByText(/branch name:/i)).not.toBeInTheDocument();
    });

    it('does not show slug preview when there is a validation error', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'original');

      // Should show validation error, not slug preview
      expect(screen.getByText(/is a reserved name/i)).toBeInTheDocument();
      expect(screen.queryByText(/branch name:/i)).not.toBeInTheDocument();
    });

    it('updates slug preview in real-time as user types', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);

      // Type "What"
      await user.type(input, 'What');
      expect(screen.getByText(/branch name: what/i)).toBeInTheDocument();

      // Add " if"
      await user.type(input, ' if');
      expect(screen.getByText(/branch name: what-if/i)).toBeInTheDocument();

      // Add " Sarah"
      await user.type(input, ' Sarah');
      expect(screen.getByText(/branch name: what-if-sarah/i)).toBeInTheDocument();
    });

    it('handles special characters in slug preview', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, "The Knight's Tale!");

      // Should strip special characters
      expect(screen.getByText(/branch name: the-knights-tale/i)).toBeInTheDocument();
    });

    it('shows "untitled" in preview for input with only special characters', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, '!!!@@@###');

      expect(screen.getByText(/branch name: untitled/i)).toBeInTheDocument();
    });

    it('handles accented characters in slug preview', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const newVariationButton = screen.getByRole('button', { name: /new variation/i });
      await user.click(newVariationButton);

      const input = screen.getByLabelText(/variation name/i);
      await user.type(input, 'Café Résumé');

      // Should transliterate accented characters
      expect(screen.getByText(/branch name: cafe-resume/i)).toBeInTheDocument();
    });
  });

  describe('Switching Variations', () => {
    it('switches to variation when "Switch to" is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
      });

      mockTauriInvoke('git_checkout_branch', undefined);

      const switchButtons = screen.getAllByRole('button', { name: /switch to/i });
      await user.click(switchButtons[0]);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          expect.stringContaining('Alternate Ending')
        );
      });
    });

    it('shows error when switching with uncommitted changes', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
      });

      // Mock error for uncommitted changes - use function that returns rejected promise
      mockTauriInvoke('git_checkout_branch', () =>
        Promise.reject(new Error('Cannot checkout: uncommitted changes in working directory'))
      );

      const switchButtons = screen.getAllByRole('button', { name: /switch to/i });
      await user.click(switchButtons[0]);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          expect.stringContaining('unsaved changes')
        );
      });
    });
  });

  describe('Combining Variations', () => {
    it('shows confirmation dialog before combining', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => false); // User clicks cancel

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
      });

      const combineButtons = screen.getAllByRole('button', { name: /combine/i });
      await user.click(combineButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Alternate Ending')
      );
    });

    it('navigates to combine view when conflicts exist', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => true); // User confirms

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
      });

      // Mock merge with conflicts
      mockTauriInvoke('git_merge_branches', {
        success: false,
        message: 'Conflicts detected',
        conflicts: ['story.md'],
      });

      const combineButtons = screen.getAllByRole('button', { name: /combine/i });
      await user.click(combineButtons[0]);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          screen: 'story-combine',
          storyId: 'story-1',
          fromBranch: 'alternate-ending',
          intoBranch: 'main',
          conflicts: ['story.md'],
        });
      });
    });

    it('shows success and reloads when merge succeeds without conflicts', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => true); // User confirms

      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
      });

      // Mock successful merge
      mockTauriInvoke('git_merge_branches', {
        success: true,
        message: 'Merged successfully',
        conflicts: [],
      });

      const combineButtons = screen.getAllByRole('button', { name: /combine/i });
      await user.click(combineButtons[0]);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('Merged successfully');
      });
    });
  });

  describe('Error States', () => {
    it('shows error when story has no git repo', async () => {
      const storyWithoutGit = { ...mockStory, gitRepoPath: null };
      mockTauriInvoke('ensure_story_git_repo', storyWithoutGit);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText(/no version control/i)).toBeInTheDocument();
        expect(screen.getByText(/enable version control/i)).toBeInTheDocument();
      });
    });

    it('shows go back button in error state', async () => {
      const user = userEvent.setup();
      const storyWithoutGit = { ...mockStory, gitRepoPath: null };
      mockTauriInvoke('ensure_story_git_repo', storyWithoutGit);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText(/no version control/i)).toBeInTheDocument();
      });

      const goBackButton = screen.getByRole('button', { name: /go back/i });
      await user.click(goBackButton);

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('navigates to compare view when "Compare" is clicked', async () => {
      const user = userEvent.setup();
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', mockVariations);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      expect(mockNavigate).toHaveBeenCalledWith({
        screen: 'story-compare',
        storyId: 'story-1',
      });
    });

    it('disables compare button when less than 2 variations exist', async () => {
      mockTauriInvoke('ensure_story_git_repo', mockStory);
      mockTauriInvoke('git_list_branches', [mockVariations[0]]);
      mockTauriInvoke('git_get_current_branch', mockVariations[0]);

      renderWithProviders(<StoryVariations />);

      await waitFor(() => {
        expect(screen.getByText('Test Story')).toBeInTheDocument();
      });

      const compareButton = screen.getByRole('button', { name: /compare/i });
      expect(compareButton).toBeDisabled();
    });
  });
});
