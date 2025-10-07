import type { Preview } from '@storybook/react-vite'
import { setupDefaultMocks, mockInvoke } from '../src/test-utils/tauriMocks'

// Mock Tauri's invoke function globally
// This allows components to import from '@tauri-apps/api/core' in Storybook
if (typeof window !== 'undefined') {
  // Setup default mocks
  setupDefaultMocks()

  // Mock the Tauri API module
  // @ts-expect-error - Adding mock to window for Storybook
  window.__TAURI_INTERNALS__ = {
    invoke: mockInvoke,
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;