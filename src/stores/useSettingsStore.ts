/**
 * Settings Store
 *
 * Manages application settings and preferences with persistence to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Auto-commit mode: when to create Git commits */
export type AutoCommitMode = 'on-close' | 'timed';

interface SettingsState {
  // Auto-commit settings
  autoCommitEnabled: boolean;
  autoCommitMode: AutoCommitMode;
  autoCommitDelay: number; // milliseconds (only used when mode is 'timed')

  // Actions
  setAutoCommitEnabled: (enabled: boolean) => void;
  setAutoCommitMode: (mode: AutoCommitMode) => void;
  setAutoCommitDelay: (delay: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  autoCommitEnabled: true,
  autoCommitMode: 'on-close' as AutoCommitMode, // Default: commit when leaving editor
  autoCommitDelay: 30000, // 30 seconds (only used when mode is 'timed')
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

      setAutoCommitMode: (mode) => {
        set({ autoCommitMode: mode });
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
