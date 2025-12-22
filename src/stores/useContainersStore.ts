/**
 * Containers Store
 *
 * Manages the state of containers in the current universe with hierarchical
 * organization and CRUD operations. Integrates with Tauri backend.
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Container, Story, CreateContainerInput, UpdateContainerInput, ContainerChildren } from '@/types';
import { LRUCache } from '@/utils/LRUCache';

// Cache configuration
const CHILDREN_CACHE_SIZE = 100; // Maximum number of container children to cache
const CHILDREN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for cached children

interface ContainersState {
  // State
  containers: Container[];
  selectedContainer: Container | null;
  isLoading: boolean;
  error: string | null;

  // Child container/story cache (internal, use getter methods)
  _childrenCache: LRUCache<string, ContainerChildren>;
  childrenLoading: Record<string, boolean>;

  // Actions
  loadContainers: (universeId: string) => Promise<void>;
  selectContainer: (container: Container | null) => void;
  createContainer: (input: CreateContainerInput) => Promise<Container>;
  getContainer: (id: string) => Promise<Container>;
  updateContainer: (id: string, input: UpdateContainerInput) => Promise<Container>;
  deleteContainer: (id: string) => Promise<void>;

  // Child container actions
  loadContainerChildren: (containerId: string) => Promise<ContainerChildren>;
  reorderChildren: (containerId: string, containerIds: string[], storyIds: string[]) => Promise<void>;
  optimisticReorderChildren: (containerId: string, containerIds: string[], storyIds: string[]) => void;
  getContainerChildren: (containerId: string) => ContainerChildren | null;
  invalidateChildren: (containerId: string) => void;

  // Utility
  clearError: () => void;
}

export const useContainersStore = create<ContainersState>((set, get) => ({
  // Initial state
  containers: [],
  selectedContainer: null,
  isLoading: false,
  error: null,

  // Child container cache (LRU with TTL)
  _childrenCache: new LRUCache<string, ContainerChildren>({
    maxSize: CHILDREN_CACHE_SIZE,
    ttl: CHILDREN_CACHE_TTL,
  }),
  childrenLoading: {},

  // Actions
  loadContainers: async (universeId) => {
    set({ isLoading: true, error: null });
    try {
      const containers = await invoke<Container[]>('list_containers', { universeId });
      set({ containers, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load containers';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectContainer: (container) => {
    set({ selectedContainer: container });
  },

  createContainer: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const container = await invoke<Container>('create_container', { input });
      set((state) => ({
        containers: [...state.containers, container],
        selectedContainer: container,
        isLoading: false,
      }));
      return container;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create container';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const container = await invoke<Container>('get_container', { id });
      set({ isLoading: false });
      return container;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get container';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateContainer: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const container = await invoke<Container>('update_container', { id, input });
      set((state) => ({
        containers: state.containers.map((c) => (c.id === id ? container : c)),
        selectedContainer: state.selectedContainer?.id === id ? container : state.selectedContainer,
        isLoading: false,
      }));
      return container;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update container';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteContainer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Backend returns array of deleted container IDs (includes children)
      const deletedIds = await invoke<string[]>('delete_container', { id });

      set((state) => {
        // Remove all deleted IDs from containers list
        const remainingContainers = state.containers.filter((c) => !deletedIds.includes(c.id));

        // Clean up children cache - remove deleted containers from all parent caches
        // Iterate through cache and update entries that contain deleted containers
        for (const parentId of state._childrenCache.keys()) {
          const children = state._childrenCache.get(parentId);
          if (children) {
            state._childrenCache.set(parentId, {
              containers: children.containers.filter((c) => !deletedIds.includes(c.id)),
              stories: children.stories, // Stories deleted via database CASCADE, not filtered here
            });
          }
        }

        // Clear selected container if it was deleted
        const newSelectedContainer = state.selectedContainer && deletedIds.includes(state.selectedContainer.id)
          ? null
          : state.selectedContainer;

        return {
          containers: remainingContainers,
          selectedContainer: newSelectedContainer,
          isLoading: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete container';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Child container actions
  loadContainerChildren: async (containerId) => {
    set((state) => ({
      childrenLoading: { ...state.childrenLoading, [containerId]: true },
      error: null,
    }));
    try {
      const children = await invoke<ContainerChildren>('list_container_children', { containerId });
      set((state) => {
        state._childrenCache.set(containerId, children);
        return {
          childrenLoading: { ...state.childrenLoading, [containerId]: false },
        };
      });
      return children;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load container children';
      set((state) => ({
        error: errorMessage,
        childrenLoading: { ...state.childrenLoading, [containerId]: false },
      }));
      throw error;
    }
  },

  reorderChildren: async (containerId, containerIds, storyIds) => {
    // Save original state for rollback
    const originalChildren = get()._childrenCache.get(containerId);

    // Apply optimistic update immediately
    get().optimisticReorderChildren(containerId, containerIds, storyIds);

    set({ error: null });
    try {
      await invoke('reorder_container_children', { containerId, containerIds, storyIds });
      // Success - reload to ensure sync with backend
      await get().loadContainerChildren(containerId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder children';

      // Rollback to original state
      if (originalChildren) {
        set((state) => {
          state._childrenCache.set(containerId, originalChildren);
          return { error: errorMessage };
        });
      } else {
        set({ error: errorMessage });
      }

      throw error;
    }
  },

  optimisticReorderChildren: (containerId, containerIds, storyIds) => {
    const currentChildren = get()._childrenCache.get(containerId);
    if (!currentChildren) return;

    // Create maps for quick lookup
    const containerMap = new Map(currentChildren.containers.map(c => [c.id, c]));
    const storyMap = new Map(currentChildren.stories.map(s => [s.id, s]));

    // Reorder containers based on new order
    const reorderedContainers = containerIds
      .map(id => containerMap.get(id))
      .filter((c): c is Container => c !== undefined);

    // Reorder stories based on new order
    const reorderedStories = storyIds
      .map(id => storyMap.get(id))
      .filter((s): s is Story => s !== undefined);

    // Update state immediately
    set((state) => {
      state._childrenCache.set(containerId, {
        containers: reorderedContainers,
        stories: reorderedStories,
      });
      return {};
    });
  },

  getContainerChildren: (containerId) => {
    return get()._childrenCache.get(containerId) || null;
  },

  invalidateChildren: (containerId) => {
    set((state) => {
      state._childrenCache.delete(containerId);
      return {};
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
