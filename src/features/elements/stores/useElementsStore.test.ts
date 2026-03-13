/**
 * Tests for useElementsStore - Filter Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useElementsStore } from './useElementsStore';
import type { Element, ElementType } from '@/types';

describe('useElementsStore - Filter Functionality', () => {
  // Helper function to create mock elements
  const createMockElement = (overrides: Partial<Element> = {}): Element => ({
    id: 'element-1',
    universeId: 'universe-1',
    name: 'Test Element',
    description: 'Test description',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    elementType: 'character',
    customTypeName: null,
    details: null,
    attributes: null,
    imageUrl: null,
    tags: null,
    relationships: null,
    relatedStoryIds: null,
    color: null,
    icon: null,
    favorite: null,
    order: null,
    ...overrides,
  });

  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useElementsStore.setState({
        elements: [],
        selectedElement: null,
        isLoading: false,
        error: null,
        filters: {
          type: null,
          searchQuery: '',
        },
      });
    });
  });

  describe('Filtering by ElementType', () => {
    it('filters elements by character type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'John Doe' }),
        createMockElement({ id: 'e2', elementType: 'location', name: 'Tavern' }),
        createMockElement({ id: 'e3', elementType: 'character', name: 'Jane Smith' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'character');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].elementType).toBe('character');
      expect(filtered[1].elementType).toBe('character');
    });

    it('filters elements by location type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'John' }),
        createMockElement({ id: 'e2', elementType: 'location', name: 'Castle' }),
        createMockElement({ id: 'e3', elementType: 'location', name: 'Forest' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'location');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.elementType === 'location')).toBe(true);
    });

    it('filters elements by vehicle type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'vehicle', name: 'Spaceship' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Pilot' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'vehicle');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].elementType).toBe('vehicle');
    });

    it('filters elements by item type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'item', name: 'Sword' }),
        createMockElement({ id: 'e2', elementType: 'item', name: 'Shield' }),
        createMockElement({ id: 'e3', elementType: 'location', name: 'Armory' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'item');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.elementType === 'item')).toBe(true);
    });

    it('filters elements by organization type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'organization', name: 'Guild' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Member' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'organization');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].elementType).toBe('organization');
    });

    it('filters elements by creature type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'creature', name: 'Dragon' }),
        createMockElement({ id: 'e2', elementType: 'creature', name: 'Phoenix' }),
        createMockElement({ id: 'e3', elementType: 'character', name: 'Hero' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'creature');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.elementType === 'creature')).toBe(true);
    });

    it('filters elements by event type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'event', name: 'Battle of Helm\'s Deep' }),
        createMockElement({ id: 'e2', elementType: 'location', name: 'Battlefield' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'event');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].elementType).toBe('event');
    });

    it('filters elements by concept type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'concept', name: 'Magic System' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Wizard' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'concept');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].elementType).toBe('concept');
    });

    it('filters elements by custom type', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'custom', customTypeName: 'Spell' }),
        createMockElement({ id: 'e2', elementType: 'custom', customTypeName: 'Potion' }),
        createMockElement({ id: 'e3', elementType: 'character', name: 'Alchemist' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'custom');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.elementType === 'custom')).toBe(true);
    });

    it('returns empty array when no elements match type filter', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'John' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Jane' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'vehicle');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(0);
    });

    it('returns all elements when type filter is null', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'John' }),
        createMockElement({ id: 'e2', elementType: 'location', name: 'Castle' }),
        createMockElement({ id: 'e3', elementType: 'vehicle', name: 'Ship' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', null);
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Search Functionality', () => {
    it('searches elements by name (case-insensitive)', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Gandalf the Grey' }),
        createMockElement({ id: 'e2', name: 'Aragorn' }),
        createMockElement({ id: 'e3', name: 'Gandalf the White' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'gandalf');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.some(e => e.name.includes('Gandalf'))).toBe(true);
    });

    it('searches elements by description (case-insensitive)', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'John', description: 'A skilled warrior' }),
        createMockElement({ id: 'e2', name: 'Jane', description: 'A powerful mage' }),
        createMockElement({ id: 'e3', name: 'Bob', description: 'Another warrior in the guild' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'warrior');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.description.toLowerCase().includes('warrior'))).toBe(true);
    });

    it('searches elements by details (case-insensitive)', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Element 1', description: 'Desc 1', details: 'Has magical powers' }),
        createMockElement({ id: 'e2', name: 'Element 2', description: 'Desc 2', details: 'Ordinary person' }),
        createMockElement({ id: 'e3', name: 'Element 3', description: 'Desc 3', details: 'Uses magic daily' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'magic');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.details?.toLowerCase().includes('magic'))).toBe(true);
    });

    it('searches elements by customTypeName (case-insensitive)', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'custom', customTypeName: 'Spell' }),
        createMockElement({ id: 'e2', elementType: 'custom', customTypeName: 'Potion' }),
        createMockElement({ id: 'e3', elementType: 'custom', customTypeName: 'Ancient Spell' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'spell');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.customTypeName?.toLowerCase().includes('spell'))).toBe(true);
    });

    it('searches across name, description, details, and customTypeName', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Dragon Slayer', description: 'A hero', details: null }),
        createMockElement({ id: 'e2', name: 'Hero', description: 'Fights dragons', details: null }),
        createMockElement({ id: 'e3', name: 'Bob', description: 'Regular person', details: 'Once saw a dragon' }),
        createMockElement({ id: 'e4', elementType: 'custom', customTypeName: 'Dragon Scale', name: 'Item', description: 'Rare material' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'dragon');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(4);
    });

    it('handles search with uppercase query', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'gandalf' }),
        createMockElement({ id: 'e2', name: 'aragorn' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'GANDALF');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('e1');
    });

    it('returns empty array when search query does not match any element', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Element 1', description: 'Description 1' }),
        createMockElement({ id: 'e2', name: 'Element 2', description: 'Description 2' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'nonexistent');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(0);
    });

    it('returns all elements when search query is empty', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Element 1' }),
        createMockElement({ id: 'e2', name: 'Element 2' }),
        createMockElement({ id: 'e3', name: 'Element 3' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', '');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(3);
    });

    it('ignores elements with null details when searching', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Element 1', details: null }),
        createMockElement({ id: 'e2', name: 'Element 2', details: 'Contains search term' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'search');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('e2');
    });

    it('ignores elements with null customTypeName when searching', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Element 1', customTypeName: null }),
        createMockElement({ id: 'e2', name: 'Element 2', elementType: 'custom', customTypeName: 'Custom Type' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('searchQuery', 'custom');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('e2');
    });
  });

  describe('Combined Filters', () => {
    it('applies both type and search filters', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'Dragon Slayer' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Bob' }),
        createMockElement({ id: 'e3', elementType: 'creature', name: 'Dragon' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'character');
        useElementsStore.getState().setFilter('searchQuery', 'dragon');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('e1');
    });

    it('returns empty array when combined filters match nothing', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'John' }),
        createMockElement({ id: 'e2', elementType: 'location', name: 'Castle' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'vehicle');
        useElementsStore.getState().setFilter('searchQuery', 'spaceship');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Default Sorting', () => {
    it('sorts elements by name in ascending order (default)', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'Zebra' }),
        createMockElement({ id: 'e2', name: 'Apple' }),
        createMockElement({ id: 'e3', name: 'Middle' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered[0].name).toBe('Apple');
      expect(filtered[1].name).toBe('Middle');
      expect(filtered[2].name).toBe('Zebra');
    });

    it('sorts filtered elements by name', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character', name: 'Zebra' }),
        createMockElement({ id: 'e2', elementType: 'character', name: 'Apple' }),
        createMockElement({ id: 'e3', elementType: 'location', name: 'Middle' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
        useElementsStore.getState().setFilter('type', 'character');
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe('Apple');
      expect(filtered[1].name).toBe('Zebra');
    });

    it('uses case-insensitive sorting', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', name: 'zebra' }),
        createMockElement({ id: 'e2', name: 'Apple' }),
        createMockElement({ id: 'e3', name: 'MIDDLE' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
      });

      const filtered = useElementsStore.getState().getFilteredElements();
      expect(filtered[0].name).toBe('Apple');
      expect(filtered[1].name).toBe('MIDDLE');
      expect(filtered[2].name).toBe('zebra');
    });
  });

  describe('Filter Management', () => {
    it('setFilter updates a single filter value', () => {
      act(() => {
        useElementsStore.getState().setFilter('type', 'character');
      });

      expect(useElementsStore.getState().filters.type).toBe('character');
      expect(useElementsStore.getState().filters.searchQuery).toBe('');
    });

    it('setFilter can update multiple filters independently', () => {
      act(() => {
        useElementsStore.getState().setFilter('type', 'character');
        useElementsStore.getState().setFilter('searchQuery', 'test');
      });

      expect(useElementsStore.getState().filters.type).toBe('character');
      expect(useElementsStore.getState().filters.searchQuery).toBe('test');
    });

    it('setFilter can set type filter to null', () => {
      act(() => {
        useElementsStore.getState().setFilter('type', 'character');
        useElementsStore.getState().setFilter('type', null);
      });

      expect(useElementsStore.getState().filters.type).toBe(null);
    });

    it('setFilter can set searchQuery to empty string', () => {
      act(() => {
        useElementsStore.getState().setFilter('searchQuery', 'test');
        useElementsStore.getState().setFilter('searchQuery', '');
      });

      expect(useElementsStore.getState().filters.searchQuery).toBe('');
    });

    it('clearFilters resets all filters to default values', () => {
      act(() => {
        useElementsStore.getState().setFilter('type', 'character');
        useElementsStore.getState().setFilter('searchQuery', 'test');
        useElementsStore.getState().clearFilters();
      });

      const filters = useElementsStore.getState().filters;
      expect(filters.type).toBe(null);
      expect(filters.searchQuery).toBe('');
    });
  });

  describe('Regression Tests', () => {
    it('only accepts valid ElementType values in type filter', () => {
      const elements: Element[] = [
        createMockElement({ id: 'e1', elementType: 'character' }),
        createMockElement({ id: 'e2', elementType: 'location' }),
        createMockElement({ id: 'e3', elementType: 'vehicle' }),
        createMockElement({ id: 'e4', elementType: 'item' }),
        createMockElement({ id: 'e5', elementType: 'organization' }),
        createMockElement({ id: 'e6', elementType: 'creature' }),
        createMockElement({ id: 'e7', elementType: 'event' }),
        createMockElement({ id: 'e8', elementType: 'concept' }),
        createMockElement({ id: 'e9', elementType: 'custom' }),
      ];

      act(() => {
        useElementsStore.setState({ elements });
      });

      // Test each valid ElementType
      const validTypes: ElementType[] = [
        'character', 'location', 'vehicle', 'item', 'organization',
        'creature', 'event', 'concept', 'custom'
      ];

      validTypes.forEach(type => {
        act(() => {
          useElementsStore.getState().setFilter('type', type);
        });

        const filtered = useElementsStore.getState().getFilteredElements();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].elementType).toBe(type);
      });
    });
  });
});
