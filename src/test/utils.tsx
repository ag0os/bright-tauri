import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import * as tauriCore from '@tauri-apps/api/core';

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

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
