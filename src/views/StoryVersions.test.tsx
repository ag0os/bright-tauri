/**
 * StoryVersions View Tests
 *
 * Tests for the StoryVersions view which manages database-based versioning.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { StoryVersions } from './StoryVersions';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { Story, StoryVersion } from '@/types';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock stores
vi.mock('@/stores/useNavigationStore');

// Import after mocking
import { invoke } from '@tauri-apps/api/core';

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

const mockStory: Story = {
  id: 'story-1',
  universeId: 'universe-1',
  title: 'Test Story',
  description: 'A test story',
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
    content: 'Once upon a time...',
    createdAt: '2024-01-01T00:00:00Z',
  },
};

const mockVersions: StoryVersion[] = [
  {
    id: 'version-1',
    storyId: 'story-1',
    name: 'Original',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'version-2',
    storyId: 'story-1',
    name: 'Alternate Ending',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('StoryVersions', () => {
  const mockGoBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigation store mock
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { currentRoute: { screen: string; storyId: string }; goBack: typeof mockGoBack }) => unknown) => {
        const state = {
          currentRoute: { screen: 'story-versions', storyId: 'story-1' },
          goBack: mockGoBack,
        };
        return selector(state);
      }
    );

    // Setup default mock responses
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve(mockVersions);
      }
      return Promise.resolve(null);
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<StoryVersions />);
    expect(screen.getByText('Loading versions...')).toBeInTheDocument();
  });

  it('renders story title and version count after loading', async () => {
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument();
    });

    expect(screen.getByText('2 versions')).toBeInTheDocument();
  });

  it('renders all versions in the list', async () => {
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
  });

  it('marks active version with badge', async () => {
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('renders back button and calls goBack on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /go back/i });
    await user.click(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows create version form when "New Version" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New Version'));

    expect(screen.getByText('Create New Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Version Name')).toBeInTheDocument();
  });

  it('creates a new version when form is submitted', async () => {
    const user = userEvent.setup();

    mockInvoke.mockImplementation((command: string, args?: Record<string, unknown>) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve(mockVersions);
      }
      if (command === 'create_story_version') {
        return Promise.resolve({
          id: 'version-3',
          storyId: args?.storyId as string,
          name: args?.name as string,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        });
      }
      return Promise.resolve(null);
    });

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New Version'));
    await user.type(screen.getByLabelText('Version Name'), 'Director Cut');
    await user.click(screen.getByText('Create Version'));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('create_story_version', {
        storyId: 'story-1',
        name: 'Director Cut',
        content: 'Once upon a time...',
      });
    });
  });

  it('switches version when Switch button is clicked', async () => {
    const user = userEvent.setup();

    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve(mockVersions);
      }
      if (command === 'switch_story_version') {
        return Promise.resolve({ ...mockStory, activeVersionId: 'version-2' });
      }
      return Promise.resolve(null);
    });

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
    });

    // Find the Switch button (only non-active versions have it)
    const switchButtons = screen.getAllByText('Switch');
    await user.click(switchButtons[0]);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('switch_story_version', {
        storyId: 'story-1',
        versionId: 'version-2',
      });
    });
  });

  it('shows rename input when pencil icon is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    const renameButtons = screen.getAllByRole('button', { name: /rename version/i });
    await user.click(renameButtons[0]);

    const input = screen.getByDisplayValue('Original');
    expect(input).toBeInTheDocument();
  });

  it('renames version when save is clicked', async () => {
    const user = userEvent.setup();

    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve(mockVersions);
      }
      if (command === 'rename_story_version') {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(null);
    });

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    const renameButtons = screen.getAllByRole('button', { name: /rename version/i });
    await user.click(renameButtons[0]);

    const input = screen.getByDisplayValue('Original');
    await user.clear(input);
    await user.type(input, 'Final Draft');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('rename_story_version', {
        versionId: 'version-1',
        newName: 'Final Draft',
      });
    });
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete version/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Delete Version')).toBeInTheDocument();
    expect(screen.getByText(/is your active version/i)).toBeInTheDocument();
  });

  it('shows warning for deleting active version', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    // Click delete on the active version (first one)
    const deleteButtons = screen.getAllByRole('button', { name: /delete version/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/automatically switch to another version/i)).toBeInTheDocument();
  });

  it('deletes version when confirmed', async () => {
    const user = userEvent.setup();

    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve(mockVersions);
      }
      if (command === 'delete_story_version') {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(null);
    });

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Alternate Ending')).toBeInTheDocument();
    });

    // Click delete on the non-active version (second one)
    const deleteButtons = screen.getAllByRole('button', { name: /delete version/i });
    await user.click(deleteButtons[1]);

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('delete_story_version', {
        versionId: 'version-2',
      });
    });
  });

  it('shows error when trying to delete last version', async () => {
    const user = userEvent.setup();

    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_story') {
        return Promise.resolve(mockStory);
      }
      if (command === 'list_story_versions') {
        return Promise.resolve([mockVersions[0]]); // Only one version
      }
      if (command === 'delete_story_version') {
        return Promise.reject(new Error('Cannot delete the last version of a story'));
      }
      return Promise.resolve(null);
    });

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete version/i });
    await user.click(deleteButton);

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cannot delete the only version/i)).toBeInTheDocument();
    });
  });

  it('cancels delete when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete version/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Delete Version')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Modal should be closed
    expect(screen.queryByText('Delete Version')).not.toBeInTheDocument();
  });

  it('renders error state when loading fails', async () => {
    mockInvoke.mockRejectedValue(new Error('Failed to load story'));

    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Story')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load story')).toBeInTheDocument();
  });

  it('renders page title "Versions"', async () => {
    renderWithProviders(<StoryVersions />);

    await waitFor(() => {
      expect(screen.getByText('Versions')).toBeInTheDocument();
    });
  });
});
