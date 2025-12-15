import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetTauriMocks } from './utils';

// Cleanup after each test
afterEach(() => {
  cleanup();
  resetTauriMocks();
});

// Mock Tauri API for frontend-only tests
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock Tauri opener plugin
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}));

// Setup global test environment
// Use globalThis for cross-environment compatibility
(globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage for Zustand persist middleware
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};
(globalThis as typeof globalThis & { localStorage: Storage }).localStorage = localStorageMock as Storage;
