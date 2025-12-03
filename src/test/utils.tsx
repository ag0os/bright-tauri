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

/**
 * Mock Tauri invoke function for testing
 * Usage: mockTauriInvoke('command_name', returnValue)
 */
export function mockTauriInvoke(command: string, returnValue: unknown) {
  const invoke = tauriCore.invoke as ReturnType<typeof vi.fn>;
  invoke.mockImplementation((cmd: string) => {
    if (cmd === command) {
      return Promise.resolve(returnValue);
    }
    return Promise.reject(new Error(`Unhandled command: ${cmd}`));
  });
}

/**
 * Reset all Tauri mocks
 */
export function resetTauriMocks() {
  const invoke = tauriCore.invoke as ReturnType<typeof vi.fn>;
  invoke.mockReset();
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
