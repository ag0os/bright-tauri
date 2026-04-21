/**
 * StoryCompare View Tests
 *
 * STUB: This view will provide version/snapshot comparison functionality.
 * Tests are minimal for the placeholder view.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import { renderWithProviders } from '@/test/utils';
import { StoryCompare } from './StoryCompare';

// Mock stores
vi.mock('@/shared/stores/useNavigationStore');

describe('StoryCompare (Stub)', () => {
  it('renders coming soon message', () => {
    const mockGoBack = vi.fn();
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { goBack: typeof mockGoBack }) => unknown) => {
        const state = { goBack: mockGoBack };
        return selector(state);
      },
    );

    renderWithProviders(<StoryCompare />);

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/Version comparison will be available/)).toBeInTheDocument();
  });

  it('renders back button', () => {
    const mockGoBack = vi.fn();
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { goBack: typeof mockGoBack }) => unknown) => {
        const state = { goBack: mockGoBack };
        return selector(state);
      },
    );

    renderWithProviders(<StoryCompare />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});
