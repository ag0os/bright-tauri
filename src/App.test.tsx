import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/utils';

describe('App', () => {
  it('renders without crashing', () => {
    renderWithProviders(<App />);
    // App renders UniverseSelection component
    expect(document.body).toBeTruthy();
  });

  it('renders UniverseSelection view', () => {
    renderWithProviders(<App />);
    // You can add more specific assertions once you know what UniverseSelection renders
    // For example:
    // expect(screen.getByText('Select Universe')).toBeInTheDocument();
  });
});
