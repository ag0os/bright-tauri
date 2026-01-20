/**
 * Settings Store
 *
 * Manages application settings and preferences with persistence to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Snapshot trigger mode: when to create automatic snapshots */
export type SnapshotTrigger = 'on_leave' | 'character_count';

interface SettingsState {
  // Snapshot settings (DBV: replaces Git auto-commit settings)
  snapshotTrigger: SnapshotTrigger;
  snapshotCharacterThreshold: number; // characters typed before auto-snapshot (only when trigger is 'character_count')
  maxSnapshotsPerVersion: number; // maximum snapshots to keep per version

  // Actions
  setSnapshotTrigger: (trigger: SnapshotTrigger) => void;
  setSnapshotCharacterThreshold: (threshold: number) => void;
  setMaxSnapshotsPerVersion: (max: number) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  snapshotTrigger: 'character_count' as SnapshotTrigger, // Default: create snapshot after typing threshold
  snapshotCharacterThreshold: 500, // Create snapshot every 500 characters
  maxSnapshotsPerVersion: 50, // Keep up to 50 snapshots per version
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_SETTINGS,

      // Actions
      setSnapshotTrigger: (trigger) => {
        set({ snapshotTrigger: trigger });
      },

      setSnapshotCharacterThreshold: (threshold) => {
        set({ snapshotCharacterThreshold: threshold });
      },

      setMaxSnapshotsPerVersion: (max) => {
        set({ maxSnapshotsPerVersion: max });
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
