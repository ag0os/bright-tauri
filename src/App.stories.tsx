import type { Meta, StoryObj } from '@storybook/react'
import App from './App'
import { registerMockCommand } from './test-utils/tauriMocks'

/**
 * Example story for the main App component.
 *
 * This demonstrates how to use Tauri commands in Storybook.
 * The greet command is already mocked globally in preview.ts,
 * but you can override it per-story if needed.
 */
const meta = {
  title: 'App/Main',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default story with the standard greet mock
 */
export const Default: Story = {}

/**
 * Story with a custom greet response
 */
export const CustomGreeting: Story = {
  play: async () => {
    // Override the greet command for this story
    registerMockCommand('greet', async (args) => {
      const name = (args?.name as string) || 'World'
      return `🎉 Custom greeting for ${name} from Storybook! 🎉`
    })
  },
}

/**
 * Story that simulates an error from the backend
 */
export const ErrorState: Story = {
  play: async () => {
    // Mock an error response
    registerMockCommand('greet', async () => {
      throw new Error('Failed to connect to backend')
    })
  },
}
