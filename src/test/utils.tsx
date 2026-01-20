import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import * as tauriCore from '@tauri-apps/api/core';
import type { Story, Container } from '@/types';

/**
 * Custom render function that wraps components with common providers
 * Add any global providers here (e.g., ThemeProvider, Router, etc.)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // For now, just use the default render
  // In the future, you can add providers here:
  // const Wrapper = ({ children }: { children: React.ReactNode }) => (
  //   <ThemeProvider>
  //     {children}
  //   </ThemeProvider>
  // );

  return render(ui, options);
}

// Internal state for storing mock responses
const mockResponses = new Map<string, unknown>();

/**
 * Update the mock implementation of invoke to use the current mockResponses
 */
function updateInvokeMock() {
  const invoke = tauriCore.invoke as ReturnType<typeof vi.fn>;
  invoke.mockImplementation((cmd: string) => {
    if (mockResponses.has(cmd)) {
      const value = mockResponses.get(cmd);
      // If returnValue is a function, call it to get the actual value
      if (typeof value === 'function') {
        return Promise.resolve(value());
      }
      return Promise.resolve(value);
    }
    return Promise.reject(new Error(`Unhandled command: ${cmd}`));
  });
}

/**
 * Mock Tauri invoke function for testing
 * Usage: mockTauriInvoke('command_name', returnValue)
 * Supports multiple commands - call multiple times to set up multiple mocks
 */
export function mockTauriInvoke(command: string, returnValue: unknown) {
  mockResponses.set(command, returnValue);
  updateInvokeMock();
}

/**
 * Reset all Tauri mocks
 */
export function resetTauriMocks() {
  mockResponses.clear();
  const invoke = tauriCore.invoke as ReturnType<typeof vi.fn>;
  invoke.mockReset();
  updateInvokeMock();
}

/**
 * Create a mock Story object with DBV fields (Database-Only Versioning)
 * Content is stored in activeSnapshot, not directly on the story
 */
export function createMockStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'story-1',
    universeId: 'universe-1',
    title: 'Test Story',
    description: 'Test description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    storyType: 'chapter',
    status: 'inprogress',
    wordCount: 1000,
    targetWordCount: 5000,
    notes: null,
    outline: null,
    order: null,
    tags: null,
    color: null,
    favorite: null,
    relatedElementIds: null,
    containerId: null,
    seriesName: null,
    lastEditedAt: '2024-01-01T00:00:00Z',
    version: 1,
    variationGroupId: 'group-1',
    variationType: 'original',
    parentVariationId: null,
    activeVersionId: 'version-1',
    activeSnapshotId: 'snapshot-1',
    activeVersion: null,
    activeSnapshot: null,
    ...overrides,
  };
}

/**
 * Create a mock Container object (DBV: no git fields)
 */
export function createMockContainer(overrides: Partial<Container> = {}): Container {
  return {
    id: 'container-1',
    universeId: 'universe-1',
    parentContainerId: null,
    containerType: 'novel',
    title: 'Test Container',
    description: 'Test description',
    order: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
