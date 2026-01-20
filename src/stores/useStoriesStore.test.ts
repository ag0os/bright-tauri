/**
 * Tests for useStoriesStore - Filter and Sort Functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useStoriesStore } from './useStoriesStore';
import type { Story } from '@/types';

describe('useStoriesStore - Filter and Sort Functionality', () => {
  // Helper function to create mock stories (DBV: no content/git fields)
  const createMockStory = (overrides: Partial<Story> = {}): Story => ({
    id: 'story-1',
    universeId: 'universe-1',
    title: 'Test Story',
    description: 'Test description',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    storyType: 'chapter',
    status: 'draft',
    wordCount: 1000,
    targetWordCount: null,
    notes: null,
    outline: null,
    order: null,
    tags: null,
    color: null,
    favorite: null,
    relatedElementIds: null,
    containerId: null,
    seriesName: null,
    lastEditedAt: '2025-01-01T00:00:00Z',
    version: 1,
    variationGroupId: 'group-1',
    variationType: 'original',
    parentVariationId: null,
    activeVersionId: 'version-1',
    activeSnapshotId: 'snapshot-1',
    activeVersion: null,
    activeSnapshot: null,
    ...overrides,
  });

  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useStoriesStore.setState({
        stories: [],
        selectedStory: null,
        isLoading: false,
        error: null,
        filters: {
          type: null,
          status: null,
          searchQuery: '',
        },
        sortBy: 'lastEdited',
        sortOrder: 'desc',
      });
    });
  });

  describe('Filtering by StoryType', () => {
    it('filters stories by chapter type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Chapter 1' }),
        createMockStory({ id: 's2', storyType: 'short-story', title: 'Short Story' }),
        createMockStory({ id: 's3', storyType: 'chapter', title: 'Chapter 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].storyType).toBe('chapter');
      expect(filtered[1].storyType).toBe('chapter');
    });

    it('filters stories by short-story type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Chapter 1' }),
        createMockStory({ id: 's2', storyType: 'short-story', title: 'Short Story' }),
        createMockStory({ id: 's3', storyType: 'poem', title: 'Poem' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'short-story');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('short-story');
    });

    it('filters stories by scene type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'scene', title: 'Scene 1' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Chapter' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'scene');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('scene');
    });

    it('filters stories by episode type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'episode', title: 'Episode 1' }),
        createMockStory({ id: 's2', storyType: 'episode', title: 'Episode 2' }),
        createMockStory({ id: 's3', storyType: 'chapter', title: 'Chapter' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'episode');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.storyType === 'episode')).toBe(true);
    });

    it('filters stories by poem type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'poem', title: 'Poem 1' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Chapter' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'poem');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('poem');
    });

    it('filters stories by outline type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'outline', title: 'Outline 1' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Chapter' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'outline');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('outline');
    });

    it('filters stories by treatment type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'treatment', title: 'Treatment 1' }),
        createMockStory({ id: 's2', storyType: 'screenplay', title: 'Screenplay' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'treatment');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('treatment');
    });

    it('filters stories by screenplay type', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'screenplay', title: 'Screenplay 1' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Chapter' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'screenplay');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].storyType).toBe('screenplay');
    });

    it('returns empty array when no stories match type filter', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Chapter 1' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Chapter 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'poem');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(0);
    });

    it('returns all stories when type filter is null', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Chapter 1' }),
        createMockStory({ id: 's2', storyType: 'short-story', title: 'Short Story' }),
        createMockStory({ id: 's3', storyType: 'poem', title: 'Poem' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', null);
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Filtering by StoryStatus', () => {
    it('filters stories by draft status', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'draft', title: 'Draft Story' }),
        createMockStory({ id: 's2', status: 'inprogress', title: 'In Progress Story' }),
        createMockStory({ id: 's3', status: 'draft', title: 'Another Draft' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'draft');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.status === 'draft')).toBe(true);
    });

    it('filters stories by inprogress status', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'draft', title: 'Draft' }),
        createMockStory({ id: 's2', status: 'inprogress', title: 'In Progress' }),
        createMockStory({ id: 's3', status: 'completed', title: 'Completed' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'inprogress');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('inprogress');
    });

    it('filters stories by completed status', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'completed', title: 'Completed 1' }),
        createMockStory({ id: 's2', status: 'draft', title: 'Draft' }),
        createMockStory({ id: 's3', status: 'completed', title: 'Completed 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'completed');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.status === 'completed')).toBe(true);
    });

    it('filters stories by published status', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'published', title: 'Published 1' }),
        createMockStory({ id: 's2', status: 'completed', title: 'Completed' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'published');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('published');
    });

    it('filters stories by archived status', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'archived', title: 'Archived 1' }),
        createMockStory({ id: 's2', status: 'draft', title: 'Draft' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'archived');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('archived');
    });

    it('returns empty array when no stories match status filter', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'draft', title: 'Draft 1' }),
        createMockStory({ id: 's2', status: 'draft', title: 'Draft 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'published');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(0);
    });

    it('returns all stories when status filter is null', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'draft', title: 'Draft' }),
        createMockStory({ id: 's2', status: 'completed', title: 'Completed' }),
        createMockStory({ id: 's3', status: 'published', title: 'Published' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', null);
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(3);
    });
  });

  describe('Search Functionality', () => {
    it('searches stories by title (case-insensitive)', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'The Great Adventure' }),
        createMockStory({ id: 's2', title: 'A Simple Tale' }),
        createMockStory({ id: 's3', title: 'Another Adventure' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'adventure');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.some(s => s.title.includes('Adventure'))).toBe(true);
    });

    it('searches stories by description (case-insensitive)', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', description: 'A thrilling mystery' }),
        createMockStory({ id: 's2', title: 'Story 2', description: 'A romantic tale' }),
        createMockStory({ id: 's3', title: 'Story 3', description: 'Another mystery novel' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'mystery');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.description.toLowerCase().includes('mystery'))).toBe(true);
    });

    it('searches stories by notes (case-insensitive)', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', notes: 'Needs more character development' }),
        createMockStory({ id: 's2', title: 'Story 2', notes: 'Plot is solid' }),
        createMockStory({ id: 's3', title: 'Story 3', notes: 'Character arc is complete' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'character');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.notes?.toLowerCase().includes('character'))).toBe(true);
    });

    it('searches across title, description, and notes', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Dragon Story', description: 'About wizards', notes: 'Magic theme' }),
        createMockStory({ id: 's2', title: 'Wizard Tale', description: 'About knights', notes: 'Medieval setting' }),
        createMockStory({ id: 's3', title: 'Knight Story', description: 'About dragons', notes: 'Epic battles' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'wizard');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
    });

    it('handles search with uppercase query', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'the great adventure' }),
        createMockStory({ id: 's2', title: 'a simple tale' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'ADVENTURE');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s1');
    });

    it('returns empty array when search query does not match any story', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', description: 'Description 1' }),
        createMockStory({ id: 's2', title: 'Story 2', description: 'Description 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'nonexistent');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(0);
    });

    it('returns all stories when search query is empty', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1' }),
        createMockStory({ id: 's2', title: 'Story 2' }),
        createMockStory({ id: 's3', title: 'Story 3' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', '');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(3);
    });

    it('ignores stories with null notes when searching', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', notes: null }),
        createMockStory({ id: 's2', title: 'Story 2', notes: 'Contains search term' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('searchQuery', 'search');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s2');
    });
  });

  describe('Combined Filters', () => {
    it('applies both type and status filters', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', status: 'draft' }),
        createMockStory({ id: 's2', storyType: 'chapter', status: 'completed' }),
        createMockStory({ id: 's3', storyType: 'short-story', status: 'draft' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('status', 'draft');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s1');
    });

    it('applies type filter and search query', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'The Adventure' }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'A Simple Tale' }),
        createMockStory({ id: 's3', storyType: 'short-story', title: 'Adventure Story' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('searchQuery', 'adventure');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s1');
    });

    it('applies status filter and search query', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', status: 'draft', title: 'Mystery Novel' }),
        createMockStory({ id: 's2', status: 'draft', title: 'Romance Story' }),
        createMockStory({ id: 's3', status: 'completed', title: 'Mystery Tale' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('status', 'draft');
        useStoriesStore.getState().setFilter('searchQuery', 'mystery');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s1');
    });

    it('applies all three filters together', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', status: 'draft', title: 'Dragon Adventure' }),
        createMockStory({ id: 's2', storyType: 'chapter', status: 'draft', title: 'Simple Tale' }),
        createMockStory({ id: 's3', storyType: 'chapter', status: 'completed', title: 'Dragon Quest' }),
        createMockStory({ id: 's4', storyType: 'short-story', status: 'draft', title: 'Dragon Story' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('status', 'draft');
        useStoriesStore.getState().setFilter('searchQuery', 'dragon');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('s1');
    });

    it('returns empty array when combined filters match nothing', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', status: 'draft', title: 'Story 1' }),
        createMockStory({ id: 's2', storyType: 'short-story', status: 'completed', title: 'Story 2' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('status', 'completed');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts by lastEdited in descending order (default)', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', lastEditedAt: '2025-01-01T00:00:00Z' }),
        createMockStory({ id: 's2', title: 'Story 2', lastEditedAt: '2025-01-03T00:00:00Z' }),
        createMockStory({ id: 's3', title: 'Story 3', lastEditedAt: '2025-01-02T00:00:00Z' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].id).toBe('s2'); // Most recent
      expect(sorted[1].id).toBe('s3');
      expect(sorted[2].id).toBe('s1'); // Oldest
    });

    it('sorts by lastEdited in ascending order', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', lastEditedAt: '2025-01-01T00:00:00Z' }),
        createMockStory({ id: 's2', title: 'Story 2', lastEditedAt: '2025-01-03T00:00:00Z' }),
        createMockStory({ id: 's3', title: 'Story 3', lastEditedAt: '2025-01-02T00:00:00Z' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('lastEdited', 'asc');
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].id).toBe('s1'); // Oldest
      expect(sorted[1].id).toBe('s3');
      expect(sorted[2].id).toBe('s2'); // Most recent
    });

    it('sorts by title in ascending order', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Zebra Story' }),
        createMockStory({ id: 's2', title: 'Apple Story' }),
        createMockStory({ id: 's3', title: 'Middle Story' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('title', 'asc');
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].title).toBe('Apple Story');
      expect(sorted[1].title).toBe('Middle Story');
      expect(sorted[2].title).toBe('Zebra Story');
    });

    it('sorts by title in descending order', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Zebra Story' }),
        createMockStory({ id: 's2', title: 'Apple Story' }),
        createMockStory({ id: 's3', title: 'Middle Story' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('title', 'desc');
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].title).toBe('Zebra Story');
      expect(sorted[1].title).toBe('Middle Story');
      expect(sorted[2].title).toBe('Apple Story');
    });

    it('sorts by wordCount in ascending order', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', wordCount: 5000 }),
        createMockStory({ id: 's2', title: 'Story 2', wordCount: 1000 }),
        createMockStory({ id: 's3', title: 'Story 3', wordCount: 3000 }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('wordCount', 'asc');
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].wordCount).toBe(1000);
      expect(sorted[1].wordCount).toBe(3000);
      expect(sorted[2].wordCount).toBe(5000);
    });

    it('sorts by wordCount in descending order', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'Story 1', wordCount: 5000 }),
        createMockStory({ id: 's2', title: 'Story 2', wordCount: 1000 }),
        createMockStory({ id: 's3', title: 'Story 3', wordCount: 3000 }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('wordCount', 'desc');
      });

      const sorted = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(sorted[0].wordCount).toBe(5000);
      expect(sorted[1].wordCount).toBe(3000);
      expect(sorted[2].wordCount).toBe(1000);
    });

    it('toggles sort order when calling setSorting with same field', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', title: 'A' }),
        createMockStory({ id: 's2', title: 'B' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setSorting('title'); // First call: asc
      });

      expect(useStoriesStore.getState().sortOrder).toBe('asc');

      act(() => {
        useStoriesStore.getState().setSorting('title'); // Second call: desc
      });

      expect(useStoriesStore.getState().sortOrder).toBe('desc');
    });

    it('applies sorting after filtering', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Zebra', wordCount: 5000 }),
        createMockStory({ id: 's2', storyType: 'chapter', title: 'Apple', wordCount: 1000 }),
        createMockStory({ id: 's3', storyType: 'short-story', title: 'Middle', wordCount: 3000 }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setSorting('title', 'asc');
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toBe('Apple');
      expect(filtered[1].title).toBe('Zebra');
    });
  });

  describe('Filter Management', () => {
    it('setFilter updates a single filter value', () => {
      act(() => {
        useStoriesStore.getState().setFilter('type', 'chapter');
      });

      expect(useStoriesStore.getState().filters.type).toBe('chapter');
      expect(useStoriesStore.getState().filters.status).toBe(null);
      expect(useStoriesStore.getState().filters.searchQuery).toBe('');
    });

    it('setFilter can update multiple filters independently', () => {
      act(() => {
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('status', 'draft');
        useStoriesStore.getState().setFilter('searchQuery', 'test');
      });

      expect(useStoriesStore.getState().filters.type).toBe('chapter');
      expect(useStoriesStore.getState().filters.status).toBe('draft');
      expect(useStoriesStore.getState().filters.searchQuery).toBe('test');
    });

    it('setFilter can set filter to null', () => {
      act(() => {
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('type', null);
      });

      expect(useStoriesStore.getState().filters.type).toBe(null);
    });

    it('clearFilters resets all filters to default values', () => {
      act(() => {
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().setFilter('status', 'draft');
        useStoriesStore.getState().setFilter('searchQuery', 'test');
        useStoriesStore.getState().clearFilters();
      });

      const filters = useStoriesStore.getState().filters;
      expect(filters.type).toBe(null);
      expect(filters.status).toBe(null);
      expect(filters.searchQuery).toBe('');
    });

    it('clearFilters does not affect sorting', () => {
      act(() => {
        useStoriesStore.getState().setSorting('title', 'asc');
        useStoriesStore.getState().setFilter('type', 'chapter');
        useStoriesStore.getState().clearFilters();
      });

      expect(useStoriesStore.getState().sortBy).toBe('title');
      expect(useStoriesStore.getState().sortOrder).toBe('asc');
    });
  });

  describe('Regression Tests', () => {
    it('does NOT filter by Container types (novel, series, collection)', () => {
      // This test ensures the bug doesn't return:
      // Container types should never be used as StoryType filters
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter', title: 'Chapter 1' }),
        createMockStory({ id: 's2', storyType: 'short-story', title: 'Short Story' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
        // 'novel' is not a valid StoryType, so this should filter out all stories
        useStoriesStore.getState().setFilter('type', 'novel' as never);
      });

      const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
      // Should return 0 results because 'novel' is not a valid StoryType
      expect(filtered).toHaveLength(0);
    });

    it('only accepts valid StoryType values in type filter', () => {
      const stories: Story[] = [
        createMockStory({ id: 's1', storyType: 'chapter' }),
        createMockStory({ id: 's2', storyType: 'short-story' }),
        createMockStory({ id: 's3', storyType: 'scene' }),
        createMockStory({ id: 's4', storyType: 'episode' }),
        createMockStory({ id: 's5', storyType: 'poem' }),
        createMockStory({ id: 's6', storyType: 'outline' }),
        createMockStory({ id: 's7', storyType: 'treatment' }),
        createMockStory({ id: 's8', storyType: 'screenplay' }),
      ];

      act(() => {
        useStoriesStore.setState({ stories });
      });

      // Test each valid StoryType
      const validTypes: Array<'chapter' | 'short-story' | 'scene' | 'episode' | 'poem' | 'outline' | 'treatment' | 'screenplay'> = [
        'chapter', 'short-story', 'scene', 'episode', 'poem', 'outline', 'treatment', 'screenplay'
      ];

      validTypes.forEach(type => {
        act(() => {
          useStoriesStore.getState().setFilter('type', type);
        });

        const filtered = useStoriesStore.getState().getFilteredAndSortedStories();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].storyType).toBe(type);
      });
    });
  });
});
