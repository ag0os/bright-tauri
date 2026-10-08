import { beforeEach, describe, expect, it } from 'vitest';
import { useUniverseStore } from '@/features/universe/stores/useUniverseStore';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import type { Universe } from '@/types/Universe';
import App from './App';
import { mockTauriInvoke, renderWithProviders, screen } from './test/utils';

const universe: Universe = {
  id: 'universe-1',
  name: 'Middle Kingdom',
  description: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  genre: null,
  tone: null,
  worldbuildingNotes: null,
  themes: null,
  status: 'active',
  color: null,
  icon: null,
  tags: null,
};

describe('App', () => {
  beforeEach(() => {
    useNavigationStore.getState().resetNavigation();
    useUniverseStore.setState({ currentUniverse: null, universes: [], error: null });
  });

  it('opens on universe selection with the empty state when there are no universes', async () => {
    mockTauriInvoke('list_universes', []);

    renderWithProviders(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Create your first universe' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Universe' })).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('lists existing universes to choose from', async () => {
    mockTauriInvoke('list_universes', [universe]);

    renderWithProviders(<App />);

    expect(await screen.findByRole('heading', { name: 'Select a Universe' })).toBeInTheDocument();
    expect(screen.getByText('Middle Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Create New Universe')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
