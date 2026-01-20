/**
 * StoryHistory View Tests
 *
 * STUB: This view is being refactored as part of the DBV migration.
 * Tests are minimal for the placeholder view (task-112).
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { StoryHistory } from './StoryHistory';
import { useNavigationStore } from '@/stores/useNavigationStore';

// Mock stores
vi.mock('@/stores/useNavigationStore');

describe('StoryHistory (Stub)', () => {
  it('renders feature unavailable message', () => {
    const mockGoBack = vi.fn();
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { goBack: typeof mockGoBack }) => unknown) => {
        const state = { goBack: mockGoBack };
        return selector(state);
      }
    );

    renderWithProviders(<StoryHistory />);

    expect(screen.getByText('Feature Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/versioning system migration/)).toBeInTheDocument();
  });

  it('renders back button', () => {
    const mockGoBack = vi.fn();
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: { goBack: typeof mockGoBack }) => unknown) => {
        const state = { goBack: mockGoBack };
        return selector(state);
      }
    );

    renderWithProviders(<StoryHistory />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});
