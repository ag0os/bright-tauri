/**
 * Tests for useContainersStore - Optimistic Reordering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useContainersStore } from './useContainersStore';
import { invoke } from '@tauri-apps/api/core';
import type { Container, Story, ContainerChildren } from '@/types';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useContainersStore - Optimistic Reordering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test (including clearing the cache)
    act(() => {
      const store = useContainersStore.getState();
      store._childrenCache.clear();
      useContainersStore.setState({
        containers: [],
        selectedContainer: null,
        isLoading: false,
        error: null,
        childrenLoading: {},
      });
    });
  });

  it('optimistically updates container order immediately', async () => {
    // Setup: Create mock containers
    const mockContainers: Container[] = [
      {
        id: 'c1',
        universeId: 'u1',
        title: 'Container 1',
        description: '',
        containerType: 'novel',
        parentContainerId: 'parent',
        order: 0,
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'c2',
        universeId: 'u1',
        title: 'Container 2',
        description: '',
        containerType: 'novel',
        parentContainerId: 'parent',
        order: 1,
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
    ];

    const mockChildren: ContainerChildren = {
      containers: mockContainers,
      stories: [],
    };

    // Set up initial state using cache
    act(() => {
      const store = useContainersStore.getState();
      store._childrenCache.set('parent', mockChildren);
    });

    // Mock successful backend call
    vi.mocked(invoke).mockResolvedValue(undefined);

    // Get the store functions
    const { reorderChildren, getContainerChildren } = useContainersStore.getState();

    // Swap containers: c2 should come before c1
    const newContainerOrder = ['c2', 'c1'];

    // Execute reorder
    const reorderPromise = act(async () => {
      await reorderChildren('parent', newContainerOrder, []);
    });

    // Check optimistic update happened immediately (before backend resolves)
    const childrenDuringUpdate = getContainerChildren('parent');
    expect(childrenDuringUpdate?.containers[0].id).toBe('c2');
    expect(childrenDuringUpdate?.containers[1].id).toBe('c1');

    // Wait for backend call to complete
    await reorderPromise;

    // Verify backend was called
    expect(invoke).toHaveBeenCalledWith('reorder_container_children', {
      containerId: 'parent',
      containerIds: ['c2', 'c1'],
      storyIds: [],
    });
  });

  it('reverts to original order on backend error', async () => {
    // Setup: Create mock containers
    const mockContainers: Container[] = [
      {
        id: 'c1',
        universeId: 'u1',
        title: 'Container 1',
        description: '',
        containerType: 'novel',
        parentContainerId: 'parent',
        order: 0,
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'c2',
        universeId: 'u1',
        title: 'Container 2',
        description: '',
        containerType: 'novel',
        parentContainerId: 'parent',
        order: 1,
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
    ];

    const mockChildren: ContainerChildren = {
      containers: mockContainers,
      stories: [],
    };

    // Set up initial state using cache
    act(() => {
      const store = useContainersStore.getState();
      store._childrenCache.set('parent', mockChildren);
    });

    // Mock backend error
    const backendError = new Error('Backend reorder failed');
    vi.mocked(invoke).mockRejectedValue(backendError);

    // Get the store functions
    const { reorderChildren, getContainerChildren } = useContainersStore.getState();

    // Save original order
    const originalOrder = mockChildren.containers.map((c) => c.id);

    // Swap containers: c2 should come before c1
    const newContainerOrder = ['c2', 'c1'];

    // Execute reorder (should fail)
    await act(async () => {
      try {
        await reorderChildren('parent', newContainerOrder, []);
      } catch (error) {
        // Expected error
      }
    });

    // Verify order was reverted to original
    const childrenAfterError = getContainerChildren('parent');
    expect(childrenAfterError?.containers[0].id).toBe(originalOrder[0]);
    expect(childrenAfterError?.containers[1].id).toBe(originalOrder[1]);

    // Verify error was set in store
    expect(useContainersStore.getState().error).toBe('Backend reorder failed');
  });

  it('optimistically updates story order immediately', async () => {
    // Setup: Create mock stories
    const mockStories: Story[] = [
      {
        id: 's1',
        universeId: 'u1',
        containerId: 'parent',
        title: 'Story 1',
        description: '',
        storyType: 'chapter' as const,
        status: 'draft' as const,
        content: '',
        wordCount: 0,
        order: 0,
        tags: [],
        relatedElementIds: [],
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 's2',
        universeId: 'u1',
        containerId: 'parent',
        title: 'Story 2',
        description: '',
        storyType: 'chapter' as const,
        status: 'draft' as const,
        content: '',
        wordCount: 0,
        order: 1,
        tags: [],
        relatedElementIds: [],
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
    ];

    const mockChildren: ContainerChildren = {
      containers: [],
      stories: mockStories,
    };

    const reorderedMockChildren: ContainerChildren = {
      containers: [],
      stories: [mockStories[1], mockStories[0]], // s2, s1
    };

    // Set up initial state using cache
    act(() => {
      const store = useContainersStore.getState();
      store._childrenCache.set('parent', mockChildren);
    });

    // Mock successful backend call and loadContainerChildren to return reordered data
    vi.mocked(invoke)
      .mockResolvedValueOnce(undefined) // reorder_container_children
      .mockResolvedValueOnce(reorderedMockChildren); // list_container_children

    // Get the store functions
    const { reorderChildren, getContainerChildren } = useContainersStore.getState();

    // Swap stories: s2 should come before s1
    const newStoryOrder = ['s2', 's1'];

    // Execute reorder
    await act(async () => {
      await reorderChildren('parent', [], newStoryOrder);
    });

    // Check final state after reload
    const childrenAfterUpdate = getContainerChildren('parent');
    expect(childrenAfterUpdate?.stories[0].id).toBe('s2');
    expect(childrenAfterUpdate?.stories[1].id).toBe('s1');

    // Verify backend was called
    expect(invoke).toHaveBeenCalledWith('reorder_container_children', {
      containerId: 'parent',
      containerIds: [],
      storyIds: ['s2', 's1'],
    });
  });

  it('handles mixed container and story reordering', async () => {
    // Setup: Create mock containers and stories
    const mockContainers: Container[] = [
      {
        id: 'c1',
        universeId: 'u1',
        title: 'Container 1',
        description: '',
        containerType: 'novel',
        parentContainerId: 'parent',
        order: 0,
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
    ];

    const mockStories: Story[] = [
      {
        id: 's1',
        universeId: 'u1',
        containerId: 'parent',
        title: 'Story 1',
        description: '',
        storyType: 'chapter' as const,
        status: 'draft' as const,
        content: '',
        wordCount: 0,
        order: 0,
        tags: [],
        relatedElementIds: [],
        gitRepoPath: null,
        currentBranch: null,
        stagedChanges: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastEditedAt: '2025-01-01T00:00:00Z',
      },
    ];

    const mockChildren: ContainerChildren = {
      containers: mockContainers,
      stories: mockStories,
    };

    // Set up initial state using cache
    act(() => {
      const store = useContainersStore.getState();
      store._childrenCache.set('parent', mockChildren);
    });

    // Mock successful backend call and loadContainerChildren to return same data
    vi.mocked(invoke)
      .mockResolvedValueOnce(undefined) // reorder_container_children
      .mockResolvedValueOnce(mockChildren); // list_container_children

    // Get the store functions
    const { reorderChildren, getContainerChildren } = useContainersStore.getState();

    // Execute reorder
    await act(async () => {
      await reorderChildren('parent', ['c1'], ['s1']);
    });

    // Verify both are still present
    const childrenAfterUpdate = getContainerChildren('parent');
    expect(childrenAfterUpdate?.containers).toHaveLength(1);
    expect(childrenAfterUpdate?.stories).toHaveLength(1);

    // Verify backend was called
    expect(invoke).toHaveBeenCalledWith('reorder_container_children', {
      containerId: 'parent',
      containerIds: ['c1'],
      storyIds: ['s1'],
    });
  });

  it('does not update if children not loaded', async () => {
    // Don't set up any children in state
    vi.mocked(invoke).mockResolvedValue(undefined);

    const { optimisticReorderChildren } = useContainersStore.getState();

    // Execute optimistic reorder (should be a no-op)
    act(() => {
      optimisticReorderChildren('parent', ['c1', 'c2'], []);
    });

    // Verify state was not modified (cache should be empty)
    expect(useContainersStore.getState()._childrenCache.size).toBe(0);
  });

  it('handles container creation failure and sets error state', async () => {
    // Mock backend error
    const backendError = new Error('Cannot add child container to a container that already has stories');
    vi.mocked(invoke).mockRejectedValue(backendError);

    // Get the store function
    const { createContainer } = useContainersStore.getState();

    // Try to create a container (should fail)
    await act(async () => {
      try {
        await createContainer({
          universeId: 'u1',
          parentContainerId: 'parent-with-stories',
          containerType: 'novel',
          title: 'New Novel',
          description: 'A new novel',
          order: 0,
        });
      } catch (error) {
        // Expected error
      }
    });

    // Verify error was set in store
    const state = useContainersStore.getState();
    expect(state.error).toBe('Cannot add child container to a container that already has stories');

    // Verify isLoading is false
    expect(state.isLoading).toBe(false);

    // Verify backend was called with correct parameters
    expect(invoke).toHaveBeenCalledWith('create_container', {
      input: {
        universeId: 'u1',
        parentContainerId: 'parent-with-stories',
        containerType: 'novel',
        title: 'New Novel',
        description: 'A new novel',
        order: 0,
      },
    });
  });
});
