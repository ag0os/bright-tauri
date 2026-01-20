/**
 * Tests for Container Store Filtering Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useContainersStore } from './useContainersStore';
import type { Container } from '@/types';

// Helper to create mock Container (DBV: no git fields)
const createMockContainer = (overrides: Partial<Container> = {}): Container => ({
  id: 'container-1',
  universeId: 'universe-1',
  parentContainerId: null,
  containerType: 'novel',
  title: 'Test Container',
  description: '',
  order: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock containers for testing
const mockContainers: Container[] = [
  createMockContainer({
    id: 'container-1',
    title: 'The Adventure Series',
    description: 'An epic adventure series',
    containerType: 'series',
    order: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }),
  createMockContainer({
    id: 'container-2',
    title: 'Mystery Novel',
    description: 'A thrilling mystery novel',
    containerType: 'novel',
    order: 1,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  }),
  createMockContainer({
    id: 'container-3',
    title: 'Short Stories Collection',
    description: 'A collection of short stories',
    containerType: 'collection',
    order: 2,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  }),
  createMockContainer({
    id: 'container-4',
    title: 'Another Novel',
    description: 'Another fantastic novel',
    containerType: 'novel',
    order: 3,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  }),
];

describe('useContainersStore - Filtering', () => {
  beforeEach(() => {
    // Reset store state
    useContainersStore.setState({
      containers: mockContainers,
      filters: {
        containerType: null,
        searchQuery: '',
      },
    });
  });

  describe('getFilteredContainers', () => {
    it('returns all containers when no filters are set', () => {
      const { getFilteredContainers } = useContainersStore.getState();
      const result = getFilteredContainers();

      expect(result).toHaveLength(4);
      // Should be sorted alphabetically by title
      expect(result[0].title).toBe('Another Novel');
      expect(result[1].title).toBe('Mystery Novel');
      expect(result[2].title).toBe('Short Stories Collection');
      expect(result[3].title).toBe('The Adventure Series');
    });

    it('filters by containerType: novel', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('containerType', 'novel');

      const result = getFilteredContainers();
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.containerType === 'novel')).toBe(true);
      // Should be sorted alphabetically
      expect(result[0].title).toBe('Another Novel');
      expect(result[1].title).toBe('Mystery Novel');
    });

    it('filters by containerType: series', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('containerType', 'series');

      const result = getFilteredContainers();
      expect(result).toHaveLength(1);
      expect(result[0].containerType).toBe('series');
      expect(result[0].title).toBe('The Adventure Series');
    });

    it('filters by containerType: collection', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('containerType', 'collection');

      const result = getFilteredContainers();
      expect(result).toHaveLength(1);
      expect(result[0].containerType).toBe('collection');
      expect(result[0].title).toBe('Short Stories Collection');
    });

    it('filters by searchQuery in title (case-insensitive)', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('searchQuery', 'novel');

      const result = getFilteredContainers();
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.title.toLowerCase().includes('novel'))).toBe(true);
      expect(result[0].title).toBe('Another Novel');
      expect(result[1].title).toBe('Mystery Novel');
    });

    it('filters by searchQuery in description (case-insensitive)', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('searchQuery', 'adventure');

      const result = getFilteredContainers();
      expect(result).toHaveLength(1);
      expect(result[0].description?.toLowerCase()).toContain('adventure');
      expect(result[0].title).toBe('The Adventure Series');
    });

    it('combines containerType and searchQuery filters', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('containerType', 'novel');
      setFilter('searchQuery', 'mystery');

      const result = getFilteredContainers();
      expect(result).toHaveLength(1);
      expect(result[0].containerType).toBe('novel');
      expect(result[0].title).toBe('Mystery Novel');
    });

    it('returns empty array when no matches found', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('searchQuery', 'nonexistent');

      const result = getFilteredContainers();
      expect(result).toHaveLength(0);
    });
  });

  describe('setFilter', () => {
    it('sets containerType filter', () => {
      const { setFilter } = useContainersStore.getState();
      setFilter('containerType', 'novel');

      const updatedFilters = useContainersStore.getState().filters;
      expect(updatedFilters.containerType).toBe('novel');
    });

    it('sets searchQuery filter', () => {
      const { setFilter } = useContainersStore.getState();
      setFilter('searchQuery', 'test query');

      const updatedFilters = useContainersStore.getState().filters;
      expect(updatedFilters.searchQuery).toBe('test query');
    });

    it('updates only specified filter key', () => {
      const { setFilter } = useContainersStore.getState();
      setFilter('containerType', 'series');
      setFilter('searchQuery', 'adventure');

      const updatedFilters = useContainersStore.getState().filters;
      expect(updatedFilters.containerType).toBe('series');
      expect(updatedFilters.searchQuery).toBe('adventure');
    });
  });

  describe('clearFilters', () => {
    it('resets all filters to default values', () => {
      const { setFilter, clearFilters } = useContainersStore.getState();

      // Set some filters
      setFilter('containerType', 'novel');
      setFilter('searchQuery', 'test');

      // Clear filters
      clearFilters();

      const updatedFilters = useContainersStore.getState().filters;
      expect(updatedFilters.containerType).toBeNull();
      expect(updatedFilters.searchQuery).toBe('');
    });
  });

  describe('alphabetical sorting', () => {
    it('sorts containers by title alphabetically (ascending)', () => {
      const { getFilteredContainers } = useContainersStore.getState();
      const result = getFilteredContainers();

      const titles = result.map((c) => c.title);
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sortedTitles);
    });

    it('maintains alphabetical sorting with filters applied', () => {
      const { setFilter, getFilteredContainers } = useContainersStore.getState();
      setFilter('containerType', 'novel');

      const result = getFilteredContainers();
      const titles = result.map((c) => c.title);
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sortedTitles);
    });
  });
});
