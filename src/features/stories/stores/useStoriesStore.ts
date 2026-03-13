/**
 * Stories Store
 *
 * Manages the state of stories in the current universe with filtering,
 * sorting, and CRUD operations. Integrates with Tauri backend.
 */

import { create } from 'zustand';
import * as api from '@/features/stories/api/stories';
import type { StorySummary, StoryDetail, CreateStoryInput, UpdateStoryInput, StoryStatus, StoryType, StoryUpdate } from '@/types';

/**
 * Convert partial update to full UpdateStoryInput with null values for missing fields.
 * This allows callers to only specify the fields they want to update.
 *
 * Note: `content` is not included because content is managed through
 * the versioning system (update_snapshot_content command in DBV).
 */
function toUpdateStoryInput(partial: StoryUpdate): UpdateStoryInput {
  return {
    title: partial.title ?? null,
    description: partial.description ?? null,
    storyType: partial.storyType ?? null,
    status: partial.status ?? null,
    notes: partial.notes ?? null,
    outline: partial.outline ?? null,
    targetWordCount: partial.targetWordCount ?? null,
    order: partial.order ?? null,
    tags: partial.tags ?? null,
    color: partial.color ?? null,
    favorite: partial.favorite ?? null,
    relatedElementIds: partial.relatedElementIds ?? null,
    seriesName: partial.seriesName ?? null,
  };
}

type SortBy = 'lastEdited' | 'title' | 'wordCount';
type SortOrder = 'asc' | 'desc';

interface StoryFilters {
  type: StoryType | null;
  status: StoryStatus | null;
  searchQuery: string;
}

interface StoriesState {
  // State
  stories: StorySummary[];
  selectedStory: StorySummary | null;
  isLoading: boolean;
  error: string | null;

  // Filters and sorting
  filters: StoryFilters;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Actions
  loadStories: (universeId: string) => Promise<void>;
  selectStory: (story: StorySummary | null) => void;
  createStory: (input: CreateStoryInput) => Promise<StoryDetail>;
  getStory: (id: string) => Promise<StoryDetail>;
  updateStory: (id: string, input: StoryUpdate) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;

  // Filtering and sorting
  setFilter: (key: keyof StoryFilters, value: StoryType | StoryStatus | string | null) => void;
  clearFilters: () => void;
  setSorting: (sortBy: SortBy, sortOrder?: SortOrder) => void;
  getFilteredAndSortedStories: () => StorySummary[];

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
      const stories = await api.listStoriesByUniverse(universeId);
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
      const detail = await api.createStory(input);
      // Convert StoryDetail to StorySummary for the list
      const summary: StorySummary = {
        id: detail.id,
        universeId: detail.universeId,
        title: detail.title,
        description: detail.description,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        storyType: detail.storyType,
        status: detail.status,
        wordCount: detail.wordCount,
        targetWordCount: detail.targetWordCount,
        order: detail.order,
        tags: detail.tags,
        color: detail.color,
        favorite: detail.favorite,
        containerId: detail.containerId,
        seriesName: detail.seriesName,
        lastEditedAt: detail.lastEditedAt,
        version: detail.version,
        variationGroupId: detail.variationGroupId,
        variationType: detail.variationType,
        parentVariationId: detail.parentVariationId,
      };
      set((state) => ({
        stories: [...state.stories, summary],
        selectedStory: summary,
        isLoading: false,
      }));
      return detail;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getStory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const story = await api.getStory(id);
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
      // Convert partial update to full input with null for missing fields
      const fullInput = toUpdateStoryInput(input);
      const updated = await api.updateStory(id, fullInput);
      // Convert Story to StorySummary for the list
      const summary: StorySummary = {
        id: updated.id,
        universeId: updated.universeId,
        title: updated.title,
        description: updated.description,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        storyType: updated.storyType,
        status: updated.status,
        wordCount: updated.wordCount,
        targetWordCount: updated.targetWordCount,
        order: updated.order,
        tags: updated.tags,
        color: updated.color,
        favorite: updated.favorite,
        containerId: updated.containerId,
        seriesName: updated.seriesName,
        lastEditedAt: updated.lastEditedAt,
        version: updated.version,
        variationGroupId: updated.variationGroupId,
        variationType: updated.variationType,
        parentVariationId: updated.parentVariationId,
      };
      set((state) => ({
        stories: state.stories.map((s) => (s.id === id ? summary : s)),
        selectedStory: state.selectedStory?.id === id ? summary : state.selectedStory,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteStory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteStory(id);

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
          s.description.toLowerCase().includes(query)
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
