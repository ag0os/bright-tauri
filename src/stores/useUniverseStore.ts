/**
 * Universe Store
 *
 * Manages the state of universes in the application with persistence.
 * Uses Zustand for state management and persist middleware to remember
 * the selected universe across sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { Universe, CreateUniverseInput } from '@/types';

interface UniverseState {
  // State
  currentUniverse: Universe | null;
  universes: Universe[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentUniverse: (universe: Universe | null) => void;
  loadUniverses: () => Promise<void>;
  createUniverse: (input: CreateUniverseInput) => Promise<Universe>;
  getUniverse: (id: string) => Promise<Universe>;
  updateUniverse: (id: string, input: Partial<CreateUniverseInput>) => Promise<Universe>;
  deleteUniverse: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set) => ({
      // Initial state
      currentUniverse: null,
      universes: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentUniverse: (universe) => {
        set({ currentUniverse: universe });
      },

      loadUniverses: async () => {
        set({ isLoading: true, error: null });
        try {
          const universes = await invoke<Universe[]>('list_universes');
          set({ universes, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load universes';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      createUniverse: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const universe = await invoke<Universe>('create_universe', { input });
          set((state) => ({
            universes: [...state.universes, universe],
            currentUniverse: universe,
            isLoading: false,
          }));
          return universe;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create universe';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getUniverse: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const universe = await invoke<Universe>('get_universe', { id });
          set({ isLoading: false });
          return universe;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get universe';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateUniverse: async (id, input) => {
        set({ isLoading: true, error: null });
        try {
          const universe = await invoke<Universe>('update_universe', { id, input });
          set((state) => ({
            universes: state.universes.map((u) => (u.id === id ? universe : u)),
            currentUniverse: state.currentUniverse?.id === id ? universe : state.currentUniverse,
            isLoading: false,
          }));
          return universe;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update universe';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteUniverse: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await invoke('delete_universe', { id });
          set((state) => ({
            universes: state.universes.filter((u) => u.id !== id),
            currentUniverse: state.currentUniverse?.id === id ? null : state.currentUniverse,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete universe';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'universe-storage',
      // Only persist the current universe selection
      partialize: (state) => ({
        currentUniverse: state.currentUniverse,
      }),
    }
  )
);
