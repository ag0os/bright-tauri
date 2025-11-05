/**
 * Elements Store
 *
 * Manages the state of elements (characters, locations, etc.) in the current
 * universe with filtering and CRUD operations. Integrates with Tauri backend.
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Element, CreateElementInput, UpdateElementInput, ElementType } from '@/types';

interface ElementFilters {
  type: ElementType | null;
  searchQuery: string;
}

interface ElementsState {
  // State
  elements: Element[];
  selectedElement: Element | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: ElementFilters;

  // Actions
  loadElements: (universeId: string) => Promise<void>;
  selectElement: (element: Element | null) => void;
  createElement: (input: CreateElementInput) => Promise<Element>;
  getElement: (id: string) => Promise<Element>;
  updateElement: (id: string, input: UpdateElementInput) => Promise<Element>;
  deleteElement: (id: string) => Promise<void>;

  // Filtering
  setFilter: (key: keyof ElementFilters, value: ElementType | string | null) => void;
  clearFilters: () => void;
  getFilteredElements: () => Element[];

  // Utility
  clearError: () => void;
}

export const useElementsStore = create<ElementsState>((set, get) => ({
  // Initial state
  elements: [],
  selectedElement: null,
  isLoading: false,
  error: null,

  // Initial filters
  filters: {
    type: null,
    searchQuery: '',
  },

  // Actions
  loadElements: async (universeId) => {
    set({ isLoading: true, error: null });
    try {
      const elements = await invoke<Element[]>('list_elements_by_universe', { universeId });
      set({ elements, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load elements';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectElement: (element) => {
    set({ selectedElement: element });
  },

  createElement: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const element = await invoke<Element>('create_element', { input });
      set((state) => ({
        elements: [...state.elements, element],
        selectedElement: element,
        isLoading: false,
      }));
      return element;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create element';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getElement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const element = await invoke<Element>('get_element', { id });
      set({ isLoading: false });
      return element;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get element';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateElement: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const element = await invoke<Element>('update_element', { id, input });
      set((state) => ({
        elements: state.elements.map((e) => (e.id === id ? element : e)),
        selectedElement: state.selectedElement?.id === id ? element : state.selectedElement,
        isLoading: false,
      }));
      return element;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update element';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteElement: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_element', { id });
      set((state) => ({
        elements: state.elements.filter((e) => e.id !== id),
        selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete element';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Filtering
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
        searchQuery: '',
      },
    });
  },

  getFilteredElements: () => {
    const state = get();
    let result = [...state.elements];

    // Apply filters
    if (state.filters.type) {
      result = result.filter((e) => e.elementType === state.filters.type);
    }
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          (e.details && e.details.toLowerCase().includes(query)) ||
          (e.customTypeName && e.customTypeName.toLowerCase().includes(query))
      );
    }

    // Default sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  },

  clearError: () => {
    set({ error: null });
  },
}));
