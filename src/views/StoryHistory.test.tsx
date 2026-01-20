/**
 * StoryHistory View Tests
 *
 * Tests for the snapshot history view (Database-Only Versioning).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTauriInvoke, resetTauriMocks } from '@/test/utils';
import { StoryHistory } from './StoryHistory';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, StorySnapshot } from '@/types';

// Mock stores
vi.mock('@/stores/useNavigationStore');
vi.mock('@/stores/useStoriesStore');
vi.mock('@/stores/useToastStore');

// Mock data
const mockStory: Story = {
  id: 'story-1',
  universeId: 'universe-1',
  title: 'Test Story',
  description: 'A test story',
  createdAt: '2026-01-20T10:00:00Z',
  updatedAt: '2026-01-20T10:00:00Z',
  storyType: 'chapter',
  status: 'draft',
  wordCount: 100,
  targetWordCount: null,
  notes: null,
  outline: null,
  order: null,
  tags: null,
  color: null,
  favorite: null,
  relatedElementIds: null,
  containerId: null,
  seriesName: null,
  lastEditedAt: '2026-01-20T10:00:00Z',
  version: 1,
  variationGroupId: 'group-1',
  variationType: 'original',
  parentVariationId: null,
  activeVersionId: 'version-1',
  activeSnapshotId: 'snapshot-2',
  activeVersion: null,
  activeSnapshot: null,
};

const mockSnapshots: StorySnapshot[] = [
  {
    id: 'snapshot-2',
    versionId: 'version-1',
    content: '{"root":{"children":[{"children":[{"text":"New content"}]}]}}',
    createdAt: '2026-01-20T14:30:00Z',
  },
  {
    id: 'snapshot-1',
    versionId: 'version-1',
    content: '{"root":{"children":[{"children":[{"text":"Original content"}]}]}}',
    createdAt: '2026-01-20T10:00:00Z',
  },
];

describe('StoryHistory', () => {
  const mockGoBack = vi.fn();
  const mockGetStory = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetTauriMocks();

    // Mock navigation store
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          currentRoute: { screen: 'story-history', storyId: 'story-1' },
          goBack: mockGoBack,
        };
        return selector(state);
      }
    );

    // Mock stories store
    (useStoriesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          getStory: mockGetStory,
        };
        return selector(state);
      }
    );

    // Mock toast store
    (useToastStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          success: mockShowSuccess,
          error: mockShowError,
        };
        return selector(state);
      }
    );
  });

  it('renders loading state initially', () => {
    mockGetStory.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithProviders(<StoryHistory />);

    expect(screen.getByText('Loading snapshots...')).toBeInTheDocument();
  });

  it('renders empty state when no snapshots exist', async () => {
    mockGetStory.mockResolvedValue({ ...mockStory, activeVersionId: 'version-1' });
    mockTauriInvoke('list_story_snapshots', []);

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByText('No Snapshots Yet')).toBeInTheDocument();
    });
    expect(screen.getByText(/Snapshots are created automatically/)).toBeInTheDocument();
  });

  it('renders snapshots list', async () => {
    mockGetStory.mockResolvedValue(mockStory);
    mockTauriInvoke('list_story_snapshots', mockSnapshots);

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByText('Snapshots')).toBeInTheDocument();
    });

    // Should show the story title
    expect(screen.getByText('Test Story')).toBeInTheDocument();

    // Current snapshot should show "Current" badge
    expect(screen.getByText('Current')).toBeInTheDocument();

    // Other snapshot should have Restore button
    expect(screen.getByRole('button', { name: /restore this snapshot/i })).toBeInTheDocument();
  });

  it('renders back button and handles click', async () => {
    mockGetStory.mockResolvedValue(mockStory);
    mockTauriInvoke('list_story_snapshots', mockSnapshots);
    const user = userEvent.setup();

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByText('Snapshots')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('calls switch_story_snapshot when restore is clicked', async () => {
    mockGetStory.mockResolvedValue(mockStory);
    mockTauriInvoke('list_story_snapshots', mockSnapshots);
    mockTauriInvoke('switch_story_snapshot', { ...mockStory, activeSnapshotId: 'snapshot-1' });
    const user = userEvent.setup();

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restore this snapshot/i })).toBeInTheDocument();
    });

    const restoreButton = screen.getByRole('button', { name: /restore this snapshot/i });
    await user.click(restoreButton);

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith('Snapshot restored successfully');
    });
  });

  it('shows error state when loading fails', async () => {
    mockGetStory.mockRejectedValue(new Error('Failed to load story'));

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load story')).toBeInTheDocument();
    });

    // Should show go back button in error state
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('shows empty state when story has no active version', async () => {
    mockGetStory.mockResolvedValue({ ...mockStory, activeVersionId: null });

    renderWithProviders(<StoryHistory />);

    await waitFor(() => {
      expect(screen.getByText('No Snapshots Yet')).toBeInTheDocument();
    });
  });
});
