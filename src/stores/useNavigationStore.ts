/**
 * Navigation Store
 *
 * Manages application navigation state using a simple state-based approach.
 * Suitable for a desktop application where URL routing is not necessary.
 */

import { create } from 'zustand';

// Navigation routes
export type Route =
  | { screen: 'universe-selection' }
  | { screen: 'stories-list' }
  | { screen: 'universe-list' }
  | { screen: 'story-editor'; storyId: string }
  | { screen: 'story-history'; storyId: string }
  | { screen: 'story-variations'; storyId: string }
  | { screen: 'story-compare'; storyId: string; branchA?: string; branchB?: string }
  | { screen: 'story-combine'; storyId: string; fromBranch: string; intoBranch: string; conflicts: string[] }
  | { screen: 'story-settings'; storyId: string }
  | { screen: 'element-detail'; elementId: string }
  | { screen: 'settings' }
  | { screen: 'container-view'; containerId: string }
  | { screen: 'container-create'; parentContainerId: string | null }
  | { screen: 'container-settings'; containerId: string };

interface NavigationState {
  // State
  currentRoute: Route;
  history: Route[];

  // Actions
  navigate: (route: Route) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  resetNavigation: () => void;

  // Container Navigation Helpers
  navigateToContainer: (containerId: string) => void;
  navigateToContainerCreate: (parentContainerId: string | null) => void;
  navigateToContainerSettings: (containerId: string) => void;

  // Story Navigation Helpers
  navigateToStoryEditor: (storyId: string) => void;
  navigateToStorySettings: (storyId: string) => void;
  navigateToStoryHistory: (storyId: string) => void;
  navigateToStoryVariations: (storyId: string) => void;
}

const initialRoute: Route = { screen: 'universe-selection' };

export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  currentRoute: initialRoute,
  history: [],

  // Actions
  navigate: (route) => {
    const currentRoute = get().currentRoute;
    set((state) => ({
      currentRoute: route,
      history: [...state.history, currentRoute],
    }));
  },

  goBack: () => {
    const { history } = get();
    if (history.length > 0) {
      const previousRoute = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      set({
        currentRoute: previousRoute,
        history: newHistory,
      });
    }
  },

  canGoBack: () => {
    return get().history.length > 0;
  },

  resetNavigation: () => {
    set({
      currentRoute: initialRoute,
      history: [],
    });
  },

  // Container Navigation Helpers
  navigateToContainer: (containerId) => {
    get().navigate({ screen: 'container-view', containerId });
  },

  navigateToContainerCreate: (parentContainerId) => {
    get().navigate({ screen: 'container-create', parentContainerId });
  },

  navigateToContainerSettings: (containerId) => {
    get().navigate({ screen: 'container-settings', containerId });
  },

  // Story Navigation Helpers
  navigateToStoryEditor: (storyId) => {
    get().navigate({ screen: 'story-editor', storyId });
  },

  navigateToStorySettings: (storyId) => {
    get().navigate({ screen: 'story-settings', storyId });
  },

  navigateToStoryHistory: (storyId) => {
    get().navigate({ screen: 'story-history', storyId });
  },

  navigateToStoryVariations: (storyId) => {
    get().navigate({ screen: 'story-variations', storyId });
  },
}));
