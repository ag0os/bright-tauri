/**
 * Mock utilities for Tauri commands in Storybook
 *
 * Since Storybook runs in the browser without the Tauri backend,
 * we need to mock the invoke function and other Tauri APIs.
 */

type InvokeArgs = Record<string, unknown>;
type InvokeHandler = (args?: InvokeArgs) => unknown | Promise<unknown>;

const mockHandlers = new Map<string, InvokeHandler>();

/**
 * Mock implementation of Tauri's invoke function
 */
export const mockInvoke = async (
  command: string,
  args?: InvokeArgs
): Promise<unknown> => {
  const handler = mockHandlers.get(command);

  if (!handler) {
    console.warn(`No mock handler registered for command: ${command}`);
    return null;
  }

  return handler(args);
};

/**
 * Register a mock handler for a Tauri command
 */
export const registerMockCommand = (
  command: string,
  handler: InvokeHandler
): void => {
  mockHandlers.set(command, handler);
};

/**
 * Clear all registered mock handlers
 */
export const clearMockCommands = (): void => {
  mockHandlers.clear();
};

/**
 * Setup default mock handlers for common commands
 * Add your default mocks here as you develop more components
 */
export const setupDefaultMocks = (): void => {
  // Example: Mock the greet command
  registerMockCommand('greet', async (args) => {
    const name = (args?.name as string) || 'World';
    return `Hello, ${name}! You've been greeted from Rust!`;
  });

  // Add more default mocks as needed
};
