/**
 * Settings Store
 *
 * Manages application settings and preferences with persistence to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Auto-commit settings
  autoCommitEnabled: boolean;
  autoCommitDelay: number; // milliseconds

  // Actions
  setAutoCommitEnabled: (enabled: boolean) => void;
  setAutoCommitDelay: (delay: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  autoCommitEnabled: true,
  autoCommitDelay: 30000, // 30 seconds
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_SETTINGS,

      // Actions
      setAutoCommitEnabled: (enabled) => {
        set({ autoCommitEnabled: enabled });
      },

      setAutoCommitDelay: (delay) => {
        set({ autoCommitDelay: delay });
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'bright-tauri-settings', // localStorage key
    }
  )
);
