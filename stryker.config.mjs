/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.config.ts' },
  coverageAnalysis: 'perTest',
  // Bound memory usage when each worker loads React, jsdom, and the icon library.
  concurrency: 4,
  mutate: [
    // Stryker mutates executable TS/TSX, not CSS, images, JSON data, or documentation.
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}', // Tests are the proof, not application subjects.
    '!src/**/*.spec.{ts,tsx}', // Same rule for spec-named tests.
    '!src/**/*.stories.{ts,tsx}', // Storybook examples are not shipped app behavior.
    '!src/types/**', // Generated Rust bindings must not be edited or mutated.
    '!src/test/**', // Test setup and provider helpers are test infrastructure.
    '!src/test-utils/**', // Tauri mocks are test infrastructure.
    '!src/**/*.d.ts', // Ambient declarations have no executable behavior.
  ],
  // Native build artifacts and documentation are not needed in a frontend sandbox.
  ignorePatterns: ['src-tauri', 'docs', 'missions', 'backlog', 'dist', 'storybook-static'],
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/mutation.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  incrementalFile: 'stryker-incremental.json',
  // Measurement only. A merge-base survivor gate is a separate, unsettled decision.
  thresholds: { break: 0 },
};
