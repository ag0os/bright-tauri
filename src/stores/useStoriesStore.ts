/**
 * Stories Store
 *
 * Manages the state of stories in the current universe with filtering,
 * sorting, and CRUD operations. Integrates with Tauri backend.
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Story, CreateStoryInput, UpdateStoryInput, StoryStatus, StoryType } from '@/types';

type SortBy = 'lastEdited' | 'title' | 'wordCount';
type SortOrder = 'asc' | 'desc';

interface StoryFilters {
  type: StoryType | null;
  status: StoryStatus | null;
  searchQuery: string;
}

interface StoriesState {
  // State
  stories: Story[];
  selectedStory: Story | null;
  isLoading: boolean;
  error: string | null;

  // Filters and sorting
  filters: StoryFilters;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Actions
  loadStories: (universeId: string) => Promise<void>;
  selectStory: (story: Story | null) => void;
  createStory: (input: CreateStoryInput) => Promise<Story>;
  getStory: (id: string) => Promise<Story>;
  updateStory: (id: string, input: UpdateStoryInput) => Promise<Story>;
  deleteStory: (id: string) => Promise<void>;

  // Filtering and sorting
  setFilter: (key: keyof StoryFilters, value: StoryType | StoryStatus | string | null) => void;
  clearFilters: () => void;
  setSorting: (sortBy: SortBy, sortOrder?: SortOrder) => void;
  getFilteredAndSortedStories: () => Story[];

  // Utility
  clearError: () => void;
}

export const useStoriesStore = create<StoriesState>((set, get) => ({
  // Initial state
  stories: [],
  selectedStory: null,
  isLoading: false,
  error: null,

  // Initial filters and sorting
  filters: {
    type: null,
    status: null,
    searchQuery: '',
  },
  sortBy: 'lastEdited',
  sortOrder: 'desc',

  // Actions
  loadStories: async (universeId) => {
    set({ isLoading: true, error: null });
    try {
      const stories = await invoke<Story[]>('list_stories_by_universe', { universeId });
      set({ stories, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load stories';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectStory: (story) => {
    set({ selectedStory: story });
  },

  createStory: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const story = await invoke<Story>('create_story', { input });
      set((state) => ({
        stories: [...state.stories, story],
        selectedStory: story,
        isLoading: false,
      }));
      return story;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getStory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const story = await invoke<Story>('get_story', { id });
      set({ isLoading: false });
      return story;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateStory: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const story = await invoke<Story>('update_story', { id, input });
      set((state) => ({
        stories: state.stories.map((s) => (s.id === id ? story : s)),
        selectedStory: state.selectedStory?.id === id ? story : state.selectedStory,
        isLoading: false,
      }));
      return story;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteStory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_story', { id });
      set((state) => ({
        stories: state.stories.filter((s) => s.id !== id),
        selectedStory: state.selectedStory?.id === id ? null : state.selectedStory,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Filtering and sorting
  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        type: null,
        status: null,
        searchQuery: '',
      },
    });
  },

  setSorting: (sortBy, sortOrder) => {
    set((state) => ({
      sortBy,
      sortOrder: sortOrder || (state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc'),
    }));
  },

  getFilteredAndSortedStories: () => {
    const state = get();
    let result = [...state.stories];

    // Apply filters
    if (state.filters.type) {
      result = result.filter((s) => s.storyType === state.filters.type);
    }
    if (state.filters.status) {
      result = result.filter((s) => s.status === state.filters.status);
    }
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          (s.notes && s.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case 'lastEdited':
          comparison = new Date(a.lastEditedAt).getTime() - new Date(b.lastEditedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
      }

      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  },

  clearError: () => {
    set({ error: null });
  },
}));
